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

  return ({ catalogPath, catalogName = "agentMdxComponents" }) =>
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

  const catalogObject = unwrapExpression(catalog.getInitializerOrThrow());

  if (!Node.isObjectLiteralExpression(catalogObject)) {
    throw new Error(`${catalogName} must be an object literal.`);
  }

  const entries = catalogObject.getProperties().map(readCatalogEntry);
  assertUniqueNames(entries.map(({ name }) => name), `${catalogName} component names`);

  return entries.map(({ name, expression }) =>
    extractComponent({
      name,
      expression,
      projectSourceRoot,
    }),
  );
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

  throw new Error("agentMdxComponents must use static property assignments.");
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

function assertStaticObject(object, label) {
  for (const property of object.getProperties()) {
    if (!Node.isPropertyAssignment(property) || Node.isComputedPropertyName(property.getNameNode())) {
      throw new Error(`${label} must use static property assignments.`);
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

  if (!Node.isArrayLiteralExpression(value) || value.getElements().length < 1 || value.getElements().length > 2) {
    throw new Error(`${metadataName}.examples must contain one or two examples.`);
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
