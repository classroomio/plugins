import { DEFAULT_CERTIFICATE_DESIGN } from './constants';
import { normalizeCertificateDesign } from './normalize';
import type { CertificateDesign } from './types';

const BLANK_ELEMENT_IDS = [
  'border',
  'header',
  'title',
  'subtitle',
  'recipient',
  'course',
  'description',
  'date',
  'badge',
  'signatories',
  'qrCode'
] as const;

export function createBlankCertificateDesign(): CertificateDesign {
  const design = normalizeCertificateDesign(DEFAULT_CERTIFICATE_DESIGN);
  const elements = Object.fromEntries(BLANK_ELEMENT_IDS.map((id) => [id, { enabled: false }]));

  return {
    ...design,
    templateId: 'modular',
    rendererTemplateId: 'modular',
    shapes: [],
    signatories: design.signatories.map((signatory) => ({ ...signatory, enabled: false })),
    qrCode: { enabled: false, position: design.qrCode?.position ?? 'bottom_right' },
    elements
  };
}
