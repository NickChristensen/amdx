/**
 * Renders the source-backed record from extract.mjs. It formats only the
 * display copy of defaultsInitializer and preserves the extracted source.
 */
export function renderComponentReference(record) {
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
