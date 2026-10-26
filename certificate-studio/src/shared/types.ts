import type {
  CertificateDesignV1,
  CertificateTemplateId,
  StarterTemplateMeta,
} from "../kit";

export type ToolCategory =
  | "layout"
  | "borders"
  | "typography"
  | "badges"
  | "qrcode"
  | "signatories"
  | "background";

export type StudioElementId =
  | "header"
  | "title"
  | "subtitle"
  | "recipient"
  | "course"
  | "description"
  | "date"
  | "badge"
  | "signatory-0"
  | "signatory-1"
  | "signatory-2"
  | "signatories"
  | "qrCode"
  | "border"
  | "background";

export type ResizeDirection =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "nw"
  | "ne"
  | "sw"
  | "se";

export interface StudioTemplate {
  id: string;
  installationId: string;
  name: string;
  description: string | null;
  designVersion: number;
  design: CertificateDesignV1;
  revision: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationProfile {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string | null;
}

export type { CertificateDesignV1, CertificateTemplateId, StarterTemplateMeta };
