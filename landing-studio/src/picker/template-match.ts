export function landingPageDocumentsMatch(left: unknown, right: unknown): boolean {
  if (!left || !right) return false;

  return JSON.stringify(normalizeDocument(left)) === JSON.stringify(normalizeDocument(right));
}

function normalizeDocument(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeDocument);
  if (!value || typeof value !== 'object') return value;

  const entries = Object.entries(value as Record<string, unknown>).sort(([leftKey], [rightKey]) =>
    leftKey.localeCompare(rightKey)
  );
  return Object.fromEntries(entries.map(([key, entryValue]) => [key, normalizeDocument(entryValue)]));
}
