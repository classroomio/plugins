import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { StudioApiClient } from "../src/shared/api";
import type { ClassroomIOClient } from "@classroomio/plugin-sdk";
import { DEFAULT_CERTIFICATE_DESIGN } from "../src/kit";
import { certificateDocumentsMatch } from "../src/picker/template-match";

describe("Certificate Studio UI & Client Tests", () => {
  it("StudioApiClient loads templates via host storage", async () => {
    const mockClient = {
      storage: {
        list: vi.fn().mockResolvedValue({
          items: [
            {
              key: "tmpl-1",
              value: {
                id: "tmpl-1",
                name: "Test Template",
                designVersion: 1,
                design: DEFAULT_CERTIFICATE_DESIGN,
                revision: 1,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              version: 1,
              schemaVersion: 1,
              updatedAt: new Date().toISOString(),
            },
          ],
          nextCursor: null,
        }),
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
      },
    } as unknown as ClassroomIOClient;

    const api = new StudioApiClient(mockClient);
    const templates = await api.listTemplates();

    expect(templates.length).toBe(1);
    expect(templates[0].id).toBe("tmpl-1");
    expect(mockClient.storage.list).toHaveBeenCalledWith(
      "certificate-templates",
      "organization",
    );
  });

  it("matches legacy course documents to studio templates without persisted identity metadata", () => {
    const storedDocument = {
      ...DEFAULT_CERTIFICATE_DESIGN,
      templateSourceId: "template-1",
      templateName: "Certificate One",
    };

    expect(
      certificateDocumentsMatch(DEFAULT_CERTIFICATE_DESIGN, storedDocument),
    ).toBe(true);
    expect(
      certificateDocumentsMatch(DEFAULT_CERTIFICATE_DESIGN, {
        ...storedDocument,
        accentColor: "#000000",
      }),
    ).toBe(false);
  });

  it("Verifies zero private ClassroomIO imports in plugin source", () => {
    const srcDir = path.resolve(__dirname, "../src");

    function scanFiles(dir: string): string[] {
      const results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results.push(...scanFiles(fullPath));
        } else if (
          file.endsWith(".ts") ||
          file.endsWith(".svelte") ||
          file.endsWith(".html")
        ) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const files = scanFiles(srcDir);
    expect(files.length).toBeGreaterThan(0);

    const FORBIDDEN_PATTERNS = [
      /@cio\//,
      /\$lib\//,
      /\$features\//,
      /\$app\//,
      /apps\//,
      /\.\.\/\.\.\/\.\.\//,
      /localStorage/,
      /sessionStorage/,
      /indexedDB/,
      /document\.cookie/,
      /@cio\/db/,
    ];

    for (const file of files) {
      const fileContent = fs.readFileSync(file, "utf8");
      for (const pattern of FORBIDDEN_PATTERNS) {
        const matches = fileContent.match(pattern);
        if (matches) {
          throw new Error(
            `Forbidden private import or storage pattern matching ${pattern} found in file: ${file}`,
          );
        }
      }
    }
  });

  it("Verifies dependencies use only workspace or public registries (no file:, link:, or portal:)", () => {
    const pkgPath = path.resolve(__dirname, "../package.json");
    const servicePkgPath = path.resolve(__dirname, "../service/package.json");
    const packagePaths = fs.existsSync(servicePkgPath)
      ? [pkgPath, servicePkgPath]
      : [pkgPath];

    for (const p of packagePaths) {
      const pkg = JSON.parse(fs.readFileSync(p, "utf8"));
      const allDeps = {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
        ...(pkg.peerDependencies || {}),
      };

      for (const [name, version] of Object.entries(allDeps)) {
        expect(typeof version).toBe("string");
        const v = version as string;
        expect(v.startsWith("file:")).toBe(false);
        if (v.startsWith("link:")) {
          expect(name.startsWith("@classroomio/")).toBe(true);
        }
        expect(v.startsWith("portal:")).toBe(false);
      }
    }
  });
});
