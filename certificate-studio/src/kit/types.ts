import type { BuiltInCertificateTemplateId } from "./constants";
import type {
  TCertificateBadgeConfig,
  TCertificateBackgroundConfig,
  TCertificateBorderConfig,
  TCertificateCopyOverrides,
  TCertificateDesign,
  TCertificateElementLayout,
  TCertificateQrCodeConfig,
  TCertificateShapeFill,
  TCertificateShapeFrame,
  TCertificateShapeObject,
  TCertificateShapeStroke,
  TCertificateSignatory,
  TCertificateTypographyConfig,
  TGradientStop,
} from "./schema";

export type CertificateTemplateId =
  | BuiltInCertificateTemplateId
  | (string & {});

export type CertificateSignatory = TCertificateSignatory;
export type CertificateBorderConfig = TCertificateBorderConfig;
export type CertificateTypographyConfig = TCertificateTypographyConfig;
export type CertificateBackgroundConfig = TCertificateBackgroundConfig;
export type CertificateBadgeConfig = TCertificateBadgeConfig;
export type CertificateQrCodeConfig = TCertificateQrCodeConfig;
export type CertificateElementLayout = TCertificateElementLayout;
export type CertificateCopyOverrides = TCertificateCopyOverrides;
export type GradientStop = TGradientStop;
export type CertificateShapeFill = TCertificateShapeFill;
export type CertificateShapeStroke = TCertificateShapeStroke;
export type CertificateShapeFrame = TCertificateShapeFrame;
export type CertificateShapeObject = TCertificateShapeObject;
export type CertificateDesign = TCertificateDesign;

export interface CertificatePreviewData {
  recipientName: string;
  courseName: string;
  courseDescription: string;
  orgName: string;
  orgLogoUrl?: string;
  date: string;
  certificateId: string;
}

export interface CertificatePreviewResult {
  html: string;
  styles: string;
}

export interface StarterTemplateMeta {
  id: CertificateTemplateId;
  name: string;
  style: string;
  description: string;
  accentColor: string;
  subtitle: string;
  initialDesign: CertificateDesign;
}

export type CertificateRenderData = CertificatePreviewData;
export type CertificateRenderResult = CertificatePreviewResult;
