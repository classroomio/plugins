const DICTIONARY: Record<string, string> = {
  'studio.title': 'Certificate Studio',
  'studio.subtitle': 'Design and customize professional certificate templates for your courses',
  'studio.createNew': 'Create template',
  'studio.templatesHeading': 'Templates',
  'studio.noTemplates': 'No certificate templates yet',
  'studio.noTemplatesDesc': 'Create your first branded template from a starter design or start from scratch.',
  'studio.edit': 'Edit',
  'studio.clone': 'Clone',
  'studio.delete': 'Delete',
  'studio.save': 'Save changes',
  'studio.saving': 'Saving...',
  'studio.saved': 'Template saved',
  'studio.cancel': 'Cancel',
  'studio.back': 'Back to templates',
  'studio.preview': 'Preview',
  'studio.closePreview': 'Close preview',
  'studio.templateName': 'Template name',
  'studio.templateNamePlaceholder': 'e.g. Executive Leadership Honors',
  'studio.deleteConfirmTitle': 'Delete template',
  'studio.deleteConfirmDesc':
    'Are you sure you want to delete this template? Issued certificates and course snapshots will not be affected.',
  'studio.deleteButton': 'Yes, delete template',
  'studio.starterCatalogTitle': 'Choose a starter design',
  'studio.starterCatalogDesc': 'Select a curated certificate style to jump-start your design.',
  'studio.blankTemplate': 'Start from blank',
  'studio.tool.layout': 'Layout & Copy',
  'studio.tool.borders': 'Borders',
  'studio.tool.typography': 'Typography',
  'studio.tool.badges': 'Badges & Seals',
  'studio.tool.qrcode': 'QR Code',
  'studio.tool.signatories': 'Signatories',
  'studio.tool.background': 'Background',
  'studio.unsavedWarning': 'You have unsaved changes. Do you want to leave without saving?'
};

export function t(key: string, fallback?: string): string {
  return DICTIONARY[key] ?? fallback ?? key;
}
