export function certificateDocumentsMatch(left: unknown, right: unknown): boolean {
  if (!left || !right) return false;

  return JSON.stringify(normalizeCertificateDocument(left)) === JSON.stringify(normalizeCertificateDocument(right));
}

function normalizeCertificateDocument(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeCertificateDocument);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([key]) => key !== 'templateSourceId' && key !== 'templateName')
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));

  return Object.fromEntries(entries.map(([key, entryValue]) => [key, normalizeCertificateDocument(entryValue)]));
}
