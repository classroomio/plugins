import { z } from 'zod';
import { BUILTIN_CERTIFICATE_TEMPLATE_IDS, DEFAULT_ACCENT_COLOR } from './constants';

export const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export const ZHexColor = z.string().trim().regex(HEX_COLOR_PATTERN, 'Invalid hex color format');

export const ZSafeUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (val: string) => {
      if (!val) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL must use HTTPS' }
  );

export const ZCertificateSignatoryV1 = z.object({
  id: z
    .string()
    .trim()
    .max(64)
    .default(() => `sig-${Math.random().toString(36).substring(2, 7)}`),
  name: z.string().trim().max(128).default(''),
  role: z.string().trim().max(128).default(''),
  enabled: z.boolean().default(true),
  signatureUrl: ZSafeUrl.optional(),
  signatureAssetId: z.string().trim().max(128).optional()
});

export const ZCertificateBorderConfigV1 = z.object({
  style: z.enum(['victorian', 'double_gold', 'geometric', 'minimal', 'custom_image']).default('victorian'),
  width: z.number().int().min(1).max(64).default(12),
  primaryColor: ZHexColor.optional(),
  accentColor: ZHexColor.optional(),
  customImageUrl: ZSafeUrl.optional()
});

export const ZCertificateTypographyConfigV1 = z.object({
  titleFont: z.string().trim().max(64).optional(),
  recipientFont: z.string().trim().max(64).optional(),
  bodyFont: z.string().trim().max(64).optional(),
  primaryColor: ZHexColor.optional(),
  letterSpacing: z.number().min(0).max(1).optional()
});

export const ZCertificateBackgroundConfigV1 = z.object({
  style: z.enum(['parchment', 'guilloche', 'solid', 'gradient']).default('parchment'),
  primaryColor: ZHexColor.optional(),
  secondaryColor: ZHexColor.optional()
});

export const ZCertificateBadgeConfigV1 = z.object({
  style: z.enum(['gold_seal', 'org_logo', 'ribbon', 'wax_stamp', 'crest', 'custom', 'none']).default('gold_seal'),
  label: z.string().trim().max(64).optional(),
  foilColor: ZHexColor.optional(),
  customImageUrl: ZSafeUrl.optional()
});

export const ZCertificateQrCodeConfigV1 = z.object({
  enabled: z.boolean().default(true),
  position: z.enum(['bottom_right', 'bottom_left', 'center_footer', 'top_right', 'custom']).default('bottom_right')
});

export const ZCertificateElementLayoutV1 = z.object({
  enabled: z.boolean().optional(),
  positionMode: z.enum(['auto', 'custom']).optional(),
  x: z.number().min(0).max(2000).optional(),
  y: z.number().min(0).max(2000).optional(),
  width: z.number().min(0).max(2000).optional(),
  height: z.number().min(0).max(2000).optional(),
  anchor: z.literal('top_left').optional(),
  zIndex: z.number().int().min(0).max(50).optional()
});

export const ZCertificateCopyOverridesV1 = z.object({
  title: z.string().trim().max(128).optional(),
  presentation: z.string().trim().max(128).optional(),
  completion: z.string().trim().max(256).optional(),
  dateLabel: z.string().trim().max(64).optional(),
  verifiedCredentialLabel: z.string().trim().max(64).optional(),
  organizationName: z.string().trim().max(128).optional()
});

export const ZGradientStop = z.object({
  offset: z.number().min(0).max(1),
  color: ZHexColor
});

export const ZCertificateShapeFill = z.discriminatedUnion('type', [
  z.object({ type: z.literal('none') }),
  z.object({ type: z.literal('solid'), color: ZHexColor }),
  z.object({
    type: z.literal('linear-gradient'),
    angle: z.number().min(0).max(360).default(90),
    stops: z.array(ZGradientStop).min(2).max(10)
  })
]);

export const ZCertificateShapeStroke = z.object({
  color: ZHexColor.default('#000000'),
  width: z.number().min(0).max(50).default(1),
  style: z.enum(['solid', 'dashed']).default('solid')
});

export const ZCertificateShapeFrame = z.object({
  x: z.number().min(0).max(2000),
  y: z.number().min(0).max(2000),
  width: z.number().min(1).max(2000),
  height: z.number().min(1).max(2000),
  rotation: z.number().min(-360).max(360).default(0)
});

export const ZCertificateShapeObject = z.object({
  id: z.string().trim().min(1).max(64),
  objectType: z.literal('shape').default('shape'),
  shape: z.enum(['rectangle', 'ellipse', 'line', 'frame']).default('rectangle'),
  frame: ZCertificateShapeFrame,
  fill: ZCertificateShapeFill.default({ type: 'solid', color: '#e2e8f0' }),
  stroke: ZCertificateShapeStroke.nullable().default(null),
  borderRadius: z.number().min(0).max(500).default(0),
  opacity: z.number().min(0).max(1).default(1),
  locked: z.boolean().default(false),
  zIndex: z.number().int().min(0).max(100).default(5)
});

export const ZCertificateDesignV1 = z.object({
  version: z.literal(1).default(1),
  templateId: z.string().trim().min(1).max(64).default('classique'),
  rendererTemplateId: z.string().trim().max(64).optional(),
  sourcePresetId: z.string().trim().max(128).optional(),
  accentColor: ZHexColor.default(DEFAULT_ACCENT_COLOR),
  title: z.string().trim().max(128).default('Certificate of Completion'),
  subtitle: z.string().trim().max(128).default('This is proudly presented to'),
  descriptionOverride: z.string().trim().max(1000).optional().default(''),
  idFormat: z.string().trim().max(64).default('CIO-{YYYY}-{RANDOM}'),
  signatories: z.array(ZCertificateSignatoryV1).max(3).default([]),
  shapes: z.array(ZCertificateShapeObject).default([]),
  elements: z.record(z.string(), ZCertificateElementLayoutV1).optional(),
  border: ZCertificateBorderConfigV1.optional(),
  typography: ZCertificateTypographyConfigV1.optional(),
  background: ZCertificateBackgroundConfigV1.optional(),
  badge: ZCertificateBadgeConfigV1.optional(),
  qrCode: ZCertificateQrCodeConfigV1.optional(),
  copy: ZCertificateCopyOverridesV1.optional()
});

export type TCertificateSignatoryV1 = z.infer<typeof ZCertificateSignatoryV1>;
export type TCertificateBorderConfigV1 = z.infer<typeof ZCertificateBorderConfigV1>;
export type TCertificateTypographyConfigV1 = z.infer<typeof ZCertificateTypographyConfigV1>;
export type TCertificateBackgroundConfigV1 = z.infer<typeof ZCertificateBackgroundConfigV1>;
export type TCertificateBadgeConfigV1 = z.infer<typeof ZCertificateBadgeConfigV1>;
export type TCertificateQrCodeConfigV1 = z.infer<typeof ZCertificateQrCodeConfigV1>;
export type TCertificateElementLayoutV1 = z.infer<typeof ZCertificateElementLayoutV1>;
export type TCertificateCopyOverridesV1 = z.infer<typeof ZCertificateCopyOverridesV1>;
export type TGradientStop = z.infer<typeof ZGradientStop>;
export type TCertificateShapeFill = z.infer<typeof ZCertificateShapeFill>;
export type TCertificateShapeStroke = z.infer<typeof ZCertificateShapeStroke>;
export type TCertificateShapeFrame = z.infer<typeof ZCertificateShapeFrame>;
export type TCertificateShapeObject = z.infer<typeof ZCertificateShapeObject>;
export type TCertificateDesignV1 = z.infer<typeof ZCertificateDesignV1>;
