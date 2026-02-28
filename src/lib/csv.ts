/**
 * Escapes a CSV field value (handles quotes, semicolons, newlines).
 */
function escapeField(value: string): string {
  if (value.includes('"') || value.includes(";") || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generates a CSV string from headers and data rows.
 * Uses semicolon separator (FR/BE convention for Excel) and UTF-8 BOM.
 *
 * @param headers - Array of column header strings
 * @param rows - Array of row arrays (each row is an array of string values)
 * @returns CSV string with BOM prefix
 */
export function generateCsv(headers: string[], rows: string[][]): string {
  const BOM = "\uFEFF";
  const headerLine = headers.map(escapeField).join(";");
  const dataLines = rows.map((row) => row.map(escapeField).join(";")).join("\n");
  return BOM + headerLine + "\n" + dataLines;
}
