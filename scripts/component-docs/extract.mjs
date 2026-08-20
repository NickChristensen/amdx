import path from "node:path";
import { Node, Project, SyntaxKind } from "ts-morph";

/**
 * Builds a reusable extractor for one TypeScript project. ts-morph reads source
 * only. Application TypeScript diagnostics own the `satisfies` type contract.
 */
export function createComponentDocsExtractor({ tsConfigFilePath, projectSourceRoot }) {
  const configPath = requiredPath(tsConfigFilePath, "tsConfigFilePath");
  const sourceRoot = requiredPath(projectSourceRoot, "projectSourceRoot");
  const project = new Project({ tsConfigFilePath: configPath });

  return ({ catalogPath, catalogName = "agentMdxComponentManifest" }) =>
    extractFromCatalog(project, {
      catalogPath: requiredPath(catalogPath, "catalogPath"),
      catalogName,
      projectSourceRoot: sourceRoot,
    });
}

function extractFromCatalog(project, { catalogPath, catalogName, projectSourceRoot }) {
  const catalogFile = project.getSourceFile(catalogPath) ?? project.addSourceFileAtPath(catalogPath);
  const catalog = catalogFile.getVariableDeclaration(catalogName);

  if (!catalog) {
    throw new Error(`${catalogPath} must declare ${catalogName}.`);
  }

  const manifest = readComponentManifest(catalog, catalogName);
  const recordsByName = new Map();
  const componentIdentities = new Map();
  const rootNames = new Set();
  const memberNames = new Set();

  const getRecord = (entry) => {
    const identity = componentIdentity(entry.expression);
    const previousIdentity = componentIdentities.get(entry.name);

    if (previousIdentity && previousIdentity !== identity) {
      throw new Error(`${entry.name} must resolve to the same component symbol in every capability.`);
    }

    if (previousIdentity) {
      return recordsByName.get(entry.name);
    }

    const record = extractComponent({
      name: entry.name,
      expression: entry.expression,
      projectSourceRoot,
    });
    recordsByName.set(entry.name, record);
    componentIdentities.set(entry.name, identity);
    return record;
  };

  const groups = manifest.map(({ title, capabilities }) => ({
    title,
    capabilities: capabilities.map((capability) => {
      if (rootNames.has(capability.root.name)) {
        throw new Error(`${capability.root.name} must be the root of only one capability.`);
      }

      rootNames.add(capability.root.name);
      const root = getRecord(capability.root);
      const members = capability.members.map((entry) => {
        memberNames.add(entry.name);
        return {
          record: getRecord(entry),
          required: capability.required.includes(entry.name),
        };
      });

      if (members.length > 0) {
        if (root.examples.length === 0) {
          throw new Error(`${root.name}.examples must contain one or two examples unless the component is a family member.`);
        }

        if (root.guidance.length === 0) {
          throw new Error(`${root.name} family capability requires root guidance describing its hierarchy.`);
        }

        assertCompleteFamilyExample(root, members.map(({ record }) => record.name));
      } else if (root.examples.length === 0) {
        throw new Error(`${root.name}.examples must contain one or two examples unless the component is a family member.`);
      }

      return { root, members };
    }),
  }));

  for (const rootName of rootNames) {
    if (memberNames.has(rootName)) {
      throw new Error(`${rootName} cannot be both a capability root and a family member.`);
    }
  }

  return {
    records: [...recordsByName.values()],
    groups,
  };
}

function readComponentManifest(catalog, catalogName) {
  const statement = catalog.getFirstAncestorByKindOrThrow(SyntaxKind.VariableStatement);

  if (!statement.isExported()) {
    throw new Error(`${catalogName} must be exported.`);
  }

  const value = unwrapExpression(catalog.getInitializerOrThrow());

  if (!Node.isArrayLiteralExpression(value)) {
    throw new Error(`${catalogName} must be an array literal.`);
  }

  if (value.getElements().length === 0) {
    throw new Error(`${catalogName} must contain at least one section.`);
  }

  const groups = value.getElements().map((element, index) => {
    const groupLabel = `${catalogName}[${index}]`;
    const group = unwrapExpression(element);
    assertObjectShape(group, groupLabel, ["title", "capabilities"]);

    const title = requireText(
      readStaticString(propertyInitializer(group, "title", groupLabel), `${groupLabel}.title`),
      `${groupLabel}.title`,
    );
    const capabilitiesValue = unwrapExpression(propertyInitializer(group, "capabilities", groupLabel));

    if (!Node.isArrayLiteralExpression(capabilitiesValue) || capabilitiesValue.getElements().length === 0) {
      throw new Error(`${groupLabel}.capabilities must be a non-empty array.`);
    }

    return {
      title,
      capabilities: capabilitiesValue.getElements().map((capability, capabilityIndex) =>
        readCapability(capability, `${groupLabel}.capabilities[${capabilityIndex}]`),
      ),
    };
  });

  assertUniqueNames(groups.map(({ title }) => title), `${catalogName} section titles`);
  return groups;
}

function readCapability(expression, label) {
  const capability = unwrapExpression(expression);

  if (!Node.isObjectLiteralExpression(capability)) {
    throw new Error(`${label} must be an object literal.`);
  }

  assertObjectShape(capability, label, ["root", "components"], ["required"]);

  const rootName = requireText(
    readStaticString(propertyInitializer(capability, "root", label), `${label}.root`),
    `${label}.root`,
  );
  const entries = readComponentMap(propertyInitializer(capability, "components", label), `${label}.components`);
  const rootEntry = entries.find(({ name }) => name === rootName);

  if (!rootEntry) {
    throw new Error(`${label}.root ${rootName} must name a component in ${label}.components.`);
  }

  if (entries[0] !== rootEntry) {
    throw new Error(`${label}.components must place the root component first.`);
  }

  const members = entries.filter(({ name }) => name !== rootName);
  const required = capability.getProperty("required")
    ? readStaticStringArray(
      propertyInitializer(capability, "required", label),
      `${label}.required`,
    )
    : [];
  assertUniqueNames(required, `${label}.required`);

  const memberNames = new Set(members.map(({ name }) => name));
  const unknownRequired = required.filter((name) => !memberNames.has(name));

  if (unknownRequired.length > 0) {
    throw new Error(`${label}.required references unknown member(s): ${unknownRequired.join(", ")}.`);
  }

  return { root: rootEntry, members, required };
}

function readComponentMap(expression, label) {
  const object = resolveObjectInitializer(expression);

  if (!object) {
    throw new Error(`${label} must reference a static named component map.`);
  }

  const entries = readCatalogEntries(object);
  assertUniqueNames(entries.map(({ name }) => name), `${label} component names`);

  return entries;
}

function assertObjectShape(value, label, requiredProperties, optionalProperties = []) {
  if (!Node.isObjectLiteralExpression(value)) {
    throw new Error(`${label} must be an object literal.`);
  }

  const properties = value.getProperties();

  for (const property of properties) {
    if (!Node.isPropertyAssignment(property) || Node.isComputedPropertyName(property.getNameNode())) {
      throw new Error(`${label} must use static property assignments.`);
    }
  }

  const propertyNames = properties.map((property) => property.getName());
  const duplicate = propertyNames.find((name, index) => propertyNames.indexOf(name) !== index);

  if (duplicate) {
    throw new Error(`${label} must define each property exactly once; duplicate ${duplicate}.`);
  }

  const missing = requiredProperties.filter((name) => !propertyNames.includes(name));

  if (missing.length > 0) {
    throw new Error(`${label} is missing required field(s): ${missing.join(", ")}.`);
  }

  const allowedProperties = [...requiredProperties, ...optionalProperties];
  const extra = propertyNames.filter((name) => !allowedProperties.includes(name));

  if (extra.length > 0) {
    throw new Error(`${label} has unsupported field(s): ${extra.join(", ")}. Expected only ${allowedProperties.join(" and ")}.`);
  }
}

function readCatalogEntries(object, seenObjects = new Set()) {
  const objectKey = `${object.getSourceFile().getFilePath()}:${object.getStart()}`;

  if (seenObjects.has(objectKey)) {
    throw new Error("Agent MDX component maps cannot contain recursive spreads.");
  }

  const nextSeenObjects = new Set(seenObjects).add(objectKey);

  return object.getProperties().flatMap((property) => {
    if (Node.isSpreadAssignment(property)) {
      const spreadObject = resolveObjectInitializer(property.getExpression());

      if (!spreadObject) {
        throw new Error("Agent MDX component maps must use static object spreads.");
      }

      return readCatalogEntries(spreadObject, nextSeenObjects);
    }

    return [readCatalogEntry(property)];
  });
}

function resolveObjectInitializer(expression) {
  const value = unwrapExpression(expression);

  if (Node.isObjectLiteralExpression(value)) {
    return value;
  }

  if (!Node.isIdentifier(value)) {
    return undefined;
  }

  const declaration = resolveAlias(value.getSymbol())
    ?.getDeclarations()
    .find((candidate) => Node.isVariableDeclaration(candidate));

  if (!declaration) {
    return undefined;
  }

  const initializer = declaration.getInitializer();
  if (!initializer) {
    return undefined;
  }

  const object = unwrapExpression(initializer);
  return Node.isObjectLiteralExpression(object) ? object : undefined;
}

function extractComponent({ name, expression, projectSourceRoot }) {
  const signatures = expression.getType().getCallSignatures();

  if (signatures.length !== 1) {
    throw new Error(`${name} must resolve to exactly one callable signature.`);
  }

  const component = signatures[0].getDeclaration();
  const parameter = component.getParameters()[0];
  const propsDeclaration = resolvePropsDeclaration(parameter?.getTypeNode(), projectSourceRoot, name);
  const typeDeclarations = collectTypeDeclarations(propsDeclaration, projectSourceRoot, name);
  const metadata = readMetadata(component.getSourceFile(), name, propsDeclaration);

  for (const declaration of typeDeclarations) {
    assertDocumentedProperties(declaration, name);
  }

  return {
    name,
    propsTypeName: propsDeclaration.getName(),
    typeDeclarations: typeDeclarations.map((declaration) => declaration.getText()),
    ...metadata,
  };
}

function componentIdentity(expression) {
  const declarations = expression
    .getType()
    .getCallSignatures()
    .map((signature) => signature.getDeclaration())
    .filter(Boolean)
    .map((declaration) => `${declaration.getSourceFile().getFilePath()}:${declaration.getStart()}`);

  return declarations.join("|");
}

function assertCompleteFamilyExample(root, members) {
  const example = root.examples[0];
  const tags = new Set([...example.mdx.matchAll(/<\/?([A-Z][A-Za-z0-9]*)\b/g)].map((match) => match[1]));
  const missing = [root.name, ...members].filter((name) => !tags.has(name));

  if (missing.length > 0) {
    throw new Error(`${root.name}.examples[0] must contain the root and every family member. Missing: ${missing.join(", ")}.`);
  }
}

function readCatalogEntry(property) {
  if (Node.isShorthandPropertyAssignment(property)) {
    const name = property.getName();
    assertSafeComponentName(name);
    return { name, expression: property.getNameNode() };
  }

  if (Node.isPropertyAssignment(property) && !Node.isComputedPropertyName(property.getNameNode())) {
    const nameNode = property.getNameNode();
    const name = Node.isStringLiteral(nameNode) ? nameNode.getLiteralText() : property.getName();
    assertSafeComponentName(name);
    return { name, expression: property.getInitializerOrThrow() };
  }

  throw new Error("Agent MDX component maps must use static property assignments.");
}

function assertSafeComponentName(name) {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    throw new Error(`Agent MDX component name ${JSON.stringify(name)} must match /^[A-Z][A-Za-z0-9]*$/.`);
  }
}

function resolvePropsDeclaration(typeNode, projectSourceRoot, componentName) {
  if (!typeNode || !Node.isTypeReference(typeNode)) {
    throw new Error(`${componentName} must use an exported direct props alias or interface.`);
  }

  const declaration = typeDeclarationForSymbol(resolveAlias(typeNode.getTypeName().getSymbol()));

  if (!declaration || !declaration.isExported() || !isProjectSource(declaration.getSourceFile(), projectSourceRoot)) {
    throw new Error(`${componentName} must use an exported direct props alias or interface.`);
  }

  return declaration;
}

function collectTypeDeclarations(rootDeclaration, projectSourceRoot, componentName) {
  const declarations = [];
  const seen = new Set();

  const visit = (declaration) => {
    const key = `${declaration.getSourceFile().getFilePath()}:${declaration.getStart()}`;

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    declarations.push(declaration);

    for (const reference of referencedTypeDeclarations(declaration, projectSourceRoot)) {
      if (!reference.isExported()) {
        throw new Error(`${componentName}: ${reference.getName()} must be exported because it appears in an Agent MDX prop type.`);
      }

      visit(reference);
    }

    assertNoProjectTypeQueries(declaration, projectSourceRoot, componentName);
  };

  visit(rootDeclaration);
  return declarations;
}

function referencedTypeDeclarations(declaration, projectSourceRoot) {
  return declaration
    .getDescendants()
    .flatMap((node) => {
      if (Node.isTypeReference(node)) {
        return [typeDeclarationForSymbol(resolveAlias(node.getTypeName().getSymbol()))];
      }

      if (Node.isExpressionWithTypeArguments(node)) {
        return [typeDeclarationForSymbol(resolveAlias(node.getExpression().getSymbol()))];
      }

      return [];
    })
    .filter((reference) => reference && isProjectSource(reference.getSourceFile(), projectSourceRoot));
}

function assertNoProjectTypeQueries(declaration, projectSourceRoot, componentName) {
  for (const query of declaration.getDescendantsOfKind(SyntaxKind.TypeQuery)) {
    const valueDeclarations = resolveAlias(query.getExprName().getSymbol())?.getDeclarations() ?? [];
    const projectValue = valueDeclarations.find((entry) => isProjectSource(entry.getSourceFile(), projectSourceRoot));

    if (projectValue) {
      throw new Error(`${componentName}: ${declaration.getName()} cannot use a project-local typeof query in an Agent MDX prop type.`);
    }
  }
}

function assertDocumentedProperties(declaration, componentName) {
  for (const property of declaration.getDescendantsOfKind(SyntaxKind.PropertySignature)) {
    const description = property
      .getJsDocs()
      .map((documentation) => documentation.getDescription().trim())
      .find(Boolean);

    if (!description) {
      throw new Error(`${componentName}: ${declaration.getName()}.${property.getName()} requires JSDoc.`);
    }
  }
}

function readMetadata(componentFile, componentName, propsDeclaration) {
  const metadataName = `${componentName[0].toLowerCase()}${componentName.slice(1)}MdxDocs`;
  const metadata = componentFile.getVariableDeclaration(metadataName);

  if (!metadata) {
    throw new Error(`${componentName} must export ${metadataName}.`);
  }

  const statement = metadata.getFirstAncestorByKindOrThrow(SyntaxKind.VariableStatement);

  if (!statement.isExported()) {
    throw new Error(`${componentName}: ${metadataName} must be exported.`);
  }

  const initializer = metadata.getInitializerOrThrow();

  if (!isComponentDocsContract(initializer, propsDeclaration)) {
    throw new Error(`${componentName}: ${metadataName} must satisfy AgentMdxComponentDocs<${propsDeclaration.getName()}>.`);
  }

  const object = unwrapExpression(initializer);

  if (!Node.isObjectLiteralExpression(object)) {
    throw new Error(`${componentName}: ${metadataName} must be a static object literal.`);
  }

  assertStaticObject(object, metadataName);
  const description = readStaticString(propertyInitializer(object, "description", metadataName), `${metadataName}.description`);
  const flow = readStaticString(propertyInitializer(object, "flow", metadataName), `${metadataName}.flow`);
  const defaults = propertyInitializer(object, "defaults", metadataName);

  if (!Node.isObjectLiteralExpression(unwrapExpression(defaults))) {
    throw new Error(`${metadataName}.defaults must be an object literal.`);
  }

  if (flow !== "inline" && flow !== "block") {
    throw new Error(`${metadataName}.flow must be inline or block.`);
  }

  return {
    description: requireText(description, `${metadataName}.description`),
    flow,
    defaultsInitializer: defaults.getText(),
    guidance: object.getProperty("guidance")
      ? readStaticStringArray(propertyInitializer(object, "guidance", metadataName), `${metadataName}.guidance`)
      : [],
    examples: readExamples(propertyInitializer(object, "examples", metadataName), metadataName),
  };
}

function assertStaticObject(object, label, skippedProperties = new Set()) {
  for (const property of object.getProperties()) {
    if (!Node.isPropertyAssignment(property) || Node.isComputedPropertyName(property.getNameNode())) {
      throw new Error(`${label} must use static property assignments.`);
    }

    if (skippedProperties.has(property.getName())) {
      continue;
    }

    if (!isStaticValue(property.getInitializerOrThrow())) {
      throw new Error(`${label}.${property.getName()} must contain only static literals.`);
    }
  }
}

function propertyInitializer(object, name, label) {
  const property = object.getProperty(name);

  if (!Node.isPropertyAssignment(property) || Node.isComputedPropertyName(property.getNameNode())) {
    throw new Error(`${label}.${name} must use a static property assignment.`);
  }

  return property.getInitializerOrThrow();
}

function readStaticString(expression, label) {
  const value = unwrapExpression(expression);

  if (Node.isStringLiteral(value) || Node.isNoSubstitutionTemplateLiteral(value)) {
    return value.getLiteralText();
  }

  throw new Error(`${label} must be a string literal.`);
}

function readStaticStringArray(expression, label) {
  const value = unwrapExpression(expression);

  if (!Node.isArrayLiteralExpression(value)) {
    throw new Error(`${label} must be an array of strings.`);
  }

  return value.getElements().map((element) => requireText(readStaticString(element, label), label));
}

function readExamples(expression, metadataName) {
  const value = unwrapExpression(expression);

  if (!Node.isArrayLiteralExpression(value) || value.getElements().length > 2) {
    throw new Error(`${metadataName}.examples must contain zero, one, or two examples.`);
  }

  const examples = value.getElements().map((element) => {
    const example = unwrapExpression(element);

    if (!Node.isObjectLiteralExpression(example)) {
      throw new Error(`${metadataName}.examples must contain object literals.`);
    }

    assertStaticObject(example, `${metadataName}.examples`);

    return {
      title: requireText(
        readStaticString(propertyInitializer(example, "title", `${metadataName}.examples`), `${metadataName}.examples.title`),
        `${metadataName}.examples.title`,
      ),
      mdx: requireText(
        readStaticString(propertyInitializer(example, "mdx", `${metadataName}.examples`), `${metadataName}.examples.mdx`),
        `${metadataName}.examples.mdx`,
      ),
    };
  });

  assertUniqueNames(examples.map(({ title }) => title), `${metadataName}.examples titles`);
  return examples;
}

function isStaticValue(expression) {
  const value = unwrapExpression(expression);

  if (
    Node.isStringLiteral(value) ||
    Node.isNoSubstitutionTemplateLiteral(value) ||
    Node.isNumericLiteral(value) ||
    value.getKind() === SyntaxKind.TrueKeyword ||
    value.getKind() === SyntaxKind.FalseKeyword ||
    value.getKind() === SyntaxKind.NullKeyword
  ) {
    return true;
  }

  if (Node.isPrefixUnaryExpression(value)) {
    return Node.isNumericLiteral(value.getOperand()) && [SyntaxKind.PlusToken, SyntaxKind.MinusToken].includes(value.getOperatorToken());
  }

  if (Node.isArrayLiteralExpression(value)) {
    return value.getElements().every((element) => !Node.isSpreadElement(element) && isStaticValue(element));
  }

  if (Node.isObjectLiteralExpression(value)) {
    return value.getProperties().every(
      (property) =>
        Node.isPropertyAssignment(property) &&
        !Node.isComputedPropertyName(property.getNameNode()) &&
        isStaticValue(property.getInitializerOrThrow()),
    );
  }

  return false;
}

function unwrapExpression(expression) {
  let current = expression;

  while (
    current.getKind() === SyntaxKind.AsExpression ||
    current.getKind() === SyntaxKind.SatisfiesExpression ||
    current.getKind() === SyntaxKind.ParenthesizedExpression
  ) {
    current = current.getExpression();
  }

  return current;
}

function isComponentDocsContract(expression, propsDeclaration) {
  let current = expression;

  while (current.getKind() === SyntaxKind.AsExpression || current.getKind() === SyntaxKind.ParenthesizedExpression) {
    current = current.getExpression();
  }

  if (current.getKind() !== SyntaxKind.SatisfiesExpression) {
    return false;
  }

  const contract = current.getTypeNode();

  if (!Node.isTypeReference(contract) || contract.getTypeArguments().length !== 1) {
    return false;
  }

  const contractDeclaration = typeDeclarationForSymbol(resolveAlias(contract.getTypeName().getSymbol()));
  const propsType = contract.getTypeArguments()[0];

  return (
    contractDeclaration?.getName() === "AgentMdxComponentDocs" &&
    Node.isTypeReference(propsType) &&
    typeDeclarationForSymbol(resolveAlias(propsType.getTypeName().getSymbol())) === propsDeclaration
  );
}

function resolveAlias(symbol) {
  return symbol?.getAliasedSymbol() ?? symbol;
}

function typeDeclarationForSymbol(symbol) {
  return symbol
    ?.getDeclarations()
    .find((declaration) => Node.isTypeAliasDeclaration(declaration) || Node.isInterfaceDeclaration(declaration));
}

function isProjectSource(sourceFile, projectSourceRoot) {
  const relative = path.relative(projectSourceRoot, sourceFile.getFilePath());
  return !relative.startsWith("..") && !path.isAbsolute(relative);
}

function requiredPath(value, name) {
  if (typeof value !== "string" || !value) {
    throw new Error(`${name} must be a non-empty path.`);
  }

  return path.resolve(value);
}

function requireText(value, label) {
  if (!value.trim()) {
    throw new Error(`${label} must not be empty.`);
  }

  return value;
}

function assertUniqueNames(names, label) {
  const duplicate = names.find((name, index) => names.indexOf(name) !== index);

  if (duplicate) {
    throw new Error(`${label} must be unique: ${duplicate}.`);
  }
}
