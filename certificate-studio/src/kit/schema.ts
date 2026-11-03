import { z } from "zod";
import {
  BUILTIN_CERTIFICATE_TEMPLATE_IDS,
  DEFAULT_ACCENT_COLOR,
} from "./constants";

export const HEX_COLOR_PATTERN =
  /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export const ZHexColor = z
  .string()
  .trim()
  .regex(HEX_COLOR_PATTERN, "Invalid hex color format");

export const ZSafeUrl = z
  .string()
  .trim()
  .max(2048)
  .refine(
    (val: string) => {
      if (!val) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "URL must use HTTPS" },
  );

export const ZCertificateSignatory = z.object({
  id: z
    .string()
    .trim()
    .max(64)
    .default(() => `sig-${Math.random().toString(36).substring(2, 7)}`),
  name: z.string().trim().max(128).default(""),
  role: z.string().trim().max(128).default(""),
  enabled: z.boolean().default(true),
  signatureUrl: ZSafeUrl.optional(),
  signatureAssetId: z.string().trim().max(128).optional(),
});

export const ZCertificateBorderConfig = z.object({
  style: z
    .enum(["victorian", "double_gold", "geometric", "minimal", "custom_image"])
    .default("victorian"),
  width: z.number().int().min(1).max(64).default(12),
  primaryColor: ZHexColor.optional(),
  accentColor: ZHexColor.optional(),
  customImageUrl: ZSafeUrl.optional(),
});

export const ZCertificateTypographyConfig = z.object({
  titleFont: z.string().trim().max(64).optional(),
  recipientFont: z.string().trim().max(64).optional(),
  bodyFont: z.string().trim().max(64).optional(),
  primaryColor: ZHexColor.optional(),
  letterSpacing: z.number().min(0).max(1).optional(),
});

export const ZCertificateBackgroundConfig = z.object({
  style: z
    .enum(["parchment", "guilloche", "solid", "gradient"])
    .default("parchment"),
  primaryColor: ZHexColor.optional(),
  secondaryColor: ZHexColor.optional(),
});

export const ZCertificateBadgeConfig = z.object({
  style: z
    .enum([
      "gold_seal",
      "org_logo",
      "ribbon",
      "wax_stamp",
      "crest",
      "custom",
      "none",
    ])
    .default("gold_seal"),
  label: z.string().trim().max(64).optional(),
  foilColor: ZHexColor.optional(),
  customImageUrl: ZSafeUrl.optional(),
});

export const ZCertificateQrCodeConfig = z.object({
  enabled: z.boolean().default(true),
  position: z
    .enum([
      "bottom_right",
      "bottom_left",
      "center_footer",
      "top_right",
      "custom",
    ])
    .default("bottom_right"),
});

export const ZCertificateElementLayout = z.object({
  enabled: z.boolean().optional(),
  positionMode: z.enum(["auto", "custom"]).optional(),
  x: z.number().min(0).max(2000).optional(),
  y: z.number().min(0).max(2000).optional(),
  width: z.number().min(0).max(2000).optional(),
  height: z.number().min(0).max(2000).optional(),
  anchor: z.literal("top_left").optional(),
  zIndex: z.number().int().min(0).max(50).optional(),
});

export const ZCertificateCopyOverrides = z.object({
  title: z.string().trim().max(128).optional(),
  presentation: z.string().trim().max(128).optional(),
  completion: z.string().trim().max(256).optional(),
  dateLabel: z.string().trim().max(64).optional(),
  verifiedCredentialLabel: z.string().trim().max(64).optional(),
  organizationName: z.string().trim().max(128).optional(),
});

export const ZGradientStop = z.object({
  offset: z.number().min(0).max(1),
  color: ZHexColor,
});

export const ZCertificateShapeFill = z.discriminatedUnion("type", [
  z.object({ type: z.literal("none") }),
  z.object({ type: z.literal("solid"), color: ZHexColor }),
  z.object({
    type: z.literal("linear-gradient"),
    angle: z.number().min(0).max(360).default(90),
    stops: z.array(ZGradientStop).min(2).max(10),
  }),
]);

export const ZCertificateShapeStroke = z.object({
  color: ZHexColor.default("#000000"),
  width: z.number().min(0).max(50).default(1),
  style: z.enum(["solid", "dashed"]).default("solid"),
});

export const ZCertificateShapeFrame = z.object({
  x: z.number().min(0).max(2000),
  y: z.number().min(0).max(2000),
  width: z.number().min(1).max(2000),
  height: z.number().min(1).max(2000),
  rotation: z.number().min(-360).max(360).default(0),
});

export const ZCertificateShapeObject = z.object({
  id: z.string().trim().min(1).max(64),
  objectType: z.literal("shape").default("shape"),
  shape: z.enum(["rectangle", "ellipse", "line", "frame"]).default("rectangle"),
  frame: ZCertificateShapeFrame,
  fill: ZCertificateShapeFill.default({ type: "solid", color: "#e2e8f0" }),
  stroke: ZCertificateShapeStroke.nullable().default(null),
  borderRadius: z.number().min(0).max(500).default(0),
  opacity: z.number().min(0).max(1).default(1),
  locked: z.boolean().default(false),
  zIndex: z.number().int().min(0).max(100).default(5),
});

export const ZCertificateDesign = z.object({
  templateId: z.string().trim().min(1).max(64).default("classique"),
  rendererTemplateId: z.string().trim().max(64).optional(),
  sourcePresetId: z.string().trim().max(128).optional(),
  accentColor: ZHexColor.default(DEFAULT_ACCENT_COLOR),
  title: z.string().trim().max(128).default("Certificate of Completion"),
  subtitle: z.string().trim().max(128).default("This is proudly presented to"),
  descriptionOverride: z.string().trim().max(1000).optional().default(""),
  idFormat: z.string().trim().max(64).default("CIO-{YYYY}-{RANDOM}"),
  signatories: z.array(ZCertificateSignatory).max(3).default([]),
  shapes: z.array(ZCertificateShapeObject).default([]),
  elements: z.record(z.string(), ZCertificateElementLayout).optional(),
  border: ZCertificateBorderConfig.optional(),
  typography: ZCertificateTypographyConfig.optional(),
  background: ZCertificateBackgroundConfig.optional(),
  badge: ZCertificateBadgeConfig.optional(),
  qrCode: ZCertificateQrCodeConfig.optional(),
  copy: ZCertificateCopyOverrides.optional(),
});

export type TCertificateSignatory = z.infer<typeof ZCertificateSignatory>;
export type TCertificateBorderConfig = z.infer<typeof ZCertificateBorderConfig>;
export type TCertificateTypographyConfig = z.infer<
  typeof ZCertificateTypographyConfig
>;
export type TCertificateBackgroundConfig = z.infer<
  typeof ZCertificateBackgroundConfig
>;
export type TCertificateBadgeConfig = z.infer<typeof ZCertificateBadgeConfig>;
export type TCertificateQrCodeConfig = z.infer<typeof ZCertificateQrCodeConfig>;
export type TCertificateElementLayout = z.infer<
  typeof ZCertificateElementLayout
>;
export type TCertificateCopyOverrides = z.infer<
  typeof ZCertificateCopyOverrides
>;
export type TGradientStop = z.infer<typeof ZGradientStop>;
export type TCertificateShapeFill = z.infer<typeof ZCertificateShapeFill>;
export type TCertificateShapeStroke = z.infer<typeof ZCertificateShapeStroke>;
export type TCertificateShapeFrame = z.infer<typeof ZCertificateShapeFrame>;
export type TCertificateShapeObject = z.infer<typeof ZCertificateShapeObject>;
export type TCertificateDesign = z.infer<typeof ZCertificateDesign>;
