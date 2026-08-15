/**
 * Renders the source-backed record from extract.mjs. It formats only the
 * display copy of defaultsInitializer and preserves the extracted source.
 */
export function renderComponentReference(record, members = []) {
  if (members.length > 0) {
    return renderFamilyReference(record, members);
  }

  const sections = [
    `# ${record.name}`,
    record.description,
    `**Layout:** ${record.flow === "inline" ? "Inline" : "Block"}`,
    ["## Props", "", "```ts", record.typeDeclarations.join("\n\n"), "```"].join("\n"),
    [
      "## Defaults",
      "",
      "```ts",
      `export const ${toCamelCase(record.name)}Defaults = ${normalizeDisplayIndentation(record.defaultsInitializer)} satisfies AgentMdxDefaults<${record.propsTypeName}>;`,
      "```",
    ].join("\n"),
  ];

  if (record.guidance.length > 0) {
    sections.push(["## Guidance", "", record.guidance.map((item) => `- ${item}`).join("\n")].join("\n"));
  }

  sections.push(
    [
      "## Examples",
      record.examples
        .map((example) => [
          `### ${example.title}`,
          "",
          "```mdx",
          example.mdx,
          "```",
        ].join("\n"))
        .join("\n\n"),
    ].join("\n\n"),
  );

  return `${sections.join("\n\n")}\n`;
}

/**
 * Renders one reference for a root component and its ordered family members.
 * Each contract keeps its source-backed props, defaults, guidance, and examples
 * so the generated reference remains useful as a standalone authoring guide.
 */
export function renderFamilyReference(root, members) {
  const components = [root, ...members];
  const sections = [
    `# ${root.name}`,
    `**Components:** ${root.name} (root), ${members
      .map((record) => `${record.name} (${familyMemberStatus(root, record.name)})`)
      .join(", ")}`,
    [
      "## Composition",
      root.guidance.map((item) => `- ${item}`).join("\n"),
    ].join("\n\n"),
    [
      "## Component contracts",
      ...components.map((record, index) => renderFamilyContract(record, index > 0)),
    ].join("\n\n"),
  ];

  return `${sections.join("\n\n")}\n`;
}

function familyMemberStatus(root, memberName) {
  const member = root.family?.find(({ name }) => name === memberName);

  if (!member) {
    throw new Error(`${root.name}.family is missing ${memberName}.`);
  }

  return member.required ? "Required" : "Optional";
}

function renderFamilyContract(record, includeGuidance) {
  const sections = [
    `### ${record.name}`,
    record.description,
    `**Layout:** ${record.flow === "inline" ? "Inline" : "Block"}`,
    ["#### Props", "", "```ts", record.typeDeclarations.join("\n\n"), "```"].join("\n"),
    [
      "#### Defaults",
      "",
      "```ts",
      `export const ${toCamelCase(record.name)}Defaults = ${normalizeDisplayIndentation(record.defaultsInitializer)} satisfies AgentMdxDefaults<${record.propsTypeName}>;`,
      "```",
    ].join("\n"),
  ];

  if (includeGuidance && record.guidance.length > 0) {
    sections.push(["#### Guidance", "", record.guidance.map((item) => `- ${item}`).join("\n")].join("\n"));
  }

  sections.push(
    [
      "#### Examples",
      record.examples
        .map((example) => [
          `##### ${example.title}`,
          "",
          "```mdx",
          example.mdx,
          "```",
        ].join("\n"))
        .join("\n\n"),
    ].join("\n\n"),
  );

  return sections.join("\n\n");
}

function toCamelCase(name) {
  return `${name[0].toLowerCase()}${name.slice(1)}`;
}

function normalizeDisplayIndentation(source) {
  const lines = source.split("\n");
  const indentedLines = lines.slice(1).filter((line) => line.trim());
  const indentation = Math.min(...indentedLines.map((line) => line.length - line.trimStart().length));

  if (!Number.isFinite(indentation) || indentation === 0) {
    return source;
  }

  return lines
    .map((line, index) => (index > 0 && line.trim() ? line.slice(indentation) : line))
    .join("\n");
}
