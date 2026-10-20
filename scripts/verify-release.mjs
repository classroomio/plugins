import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const registryPath = path.join(repositoryRoot, "registry", "plugins.json");
const releaseIndexPath = path.join(
  repositoryRoot,
  ".plugin-artifacts",
  "release-index.json",
);
const allowedLinkedPackages = new Set([
  "@classroomio/plugin-sdk",
  "@classroomio/plugin-design",
  "@classroomio/certificate-kit",
]);
const forbiddenImportPatterns = [/@cio\//, /\$lib\//, /\$app\//];
const relativeImportPattern =
  /(?:from\s*|import\()\s*['"](\.{1,2}\/[^'"]+)['"]/g;
const forbiddenArtifactNames = [
  /(^|\/)\.env(?:\.|$)/,
  /\.pem$/i,
  /\.key$/i,
  /id_rsa/i,
  /\.map$/i,
];
const exactVersionPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const maximumArchiveBytes = 12 * 1024 * 1024;
const maximumExtractedBytes = 48 * 1024 * 1024;
const maximumFiles = 1_000;

function fail(message) {
  throw new Error(message);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function assertInsideRoot(filePath) {
  const resolvedPath = path.resolve(repositoryRoot, filePath);
  if (!resolvedPath.startsWith(`${repositoryRoot}${path.sep}`)) {
    fail(`Path escapes the repository: ${filePath}`);
  }

  return resolvedPath;
}

function listTextFiles(directory) {
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (["node_modules", ".plugin-artifacts", ".git"].includes(entry.name))
      continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...listTextFiles(entryPath));
    } else if (
      /\.(?:js|mjs|cjs|ts|tsx|svelte|html|css|json)$/i.test(entry.name)
    ) {
      results.push(entryPath);
    }
  }

  return results;
}

function listFiles(directory) {
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) results.push(...listFiles(entryPath));
    else if (entry.isFile()) results.push(entryPath);
    else fail(`Release artifacts cannot contain links: ${entryPath}`);
  }

  return results;
}

function fileDigest(filePath) {
  const bytes = fs.readFileSync(filePath);
  return `sha256-${crypto.createHash("sha256").update(bytes).digest("hex")}`;
}

const registry = readJson(registryPath);
if (registry.schemaVersion !== 1 || !Array.isArray(registry.plugins)) {
  fail(
    "registry/plugins.json must use schemaVersion 1 and contain a plugins array.",
  );
}

const registryIds = new Set();
const registryPaths = new Set();
const releasedRegistryEntries = new Map();

for (const entry of registry.plugins) {
  if (
    typeof entry.id !== "string" ||
    typeof entry.path !== "string" ||
    !["first-party", "community", "fixture"].includes(entry.kind) ||
    typeof entry.release !== "boolean"
  ) {
    fail(`Invalid registry entry: ${JSON.stringify(entry)}`);
  }
  if (registryIds.has(entry.id) || registryPaths.has(entry.path)) {
    fail(`Duplicate registry ID or path: ${entry.id}`);
  }
  registryIds.add(entry.id);
  registryPaths.add(entry.path);

  const pluginDirectory = assertInsideRoot(entry.path);
  const manifestPath = path.join(pluginDirectory, "plugin.json");
  if (!fs.existsSync(manifestPath))
    fail(`Missing plugin.json for ${entry.id}.`);

  const manifest = readJson(manifestPath);
  if (manifest.id !== entry.id)
    fail(`Registry ID does not match plugin.json for ${entry.id}.`);
  if (
    entry.release &&
    entry.id.startsWith("com.classroomio.") !== (entry.kind === "first-party")
  ) {
    fail(`Invalid namespace policy for ${entry.id}.`);
  }
  if (entry.kind === "fixture" && entry.release)
    fail(`Fixture ${entry.id} cannot be released.`);

  const packagePath = path.join(pluginDirectory, "package.json");
  if (fs.existsSync(packagePath)) {
    const packageJson = readJson(packagePath);
    if (entry.release) {
      for (const scriptName of ["build", "check", "test"]) {
        if (typeof packageJson.scripts?.[scriptName] !== "string") {
          fail(
            `${entry.id} must define a ${scriptName} script before release.`,
          );
        }
      }
    }

    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    for (const [packageName, version] of Object.entries(dependencies)) {
      const usesLocalReference = /^(?:file|link|portal|workspace):/.test(
        String(version),
      );
      if (usesLocalReference && !allowedLinkedPackages.has(packageName)) {
        fail(
          `${entry.id} uses forbidden local dependency ${packageName}@${version}.`,
        );
      }
      if (
        entry.release &&
        !usesLocalReference &&
        !exactVersionPattern.test(String(version))
      ) {
        fail(`${entry.id} must pin ${packageName} to an exact version.`);
      }
    }
  } else if (entry.release) {
    fail(`${entry.id} must include package.json before release.`);
  }

  for (const sourcePath of listTextFiles(pluginDirectory)) {
    const source = fs.readFileSync(sourcePath, "utf8");
    if (forbiddenImportPatterns.some((pattern) => pattern.test(source))) {
      fail(
        `${entry.id} imports a private host module in ${path.relative(repositoryRoot, sourcePath)}.`,
      );
    }

    for (const importMatch of source.matchAll(relativeImportPattern)) {
      const importedPath = path.resolve(
        path.dirname(sourcePath),
        importMatch[1],
      );
      if (!importedPath.startsWith(`${pluginDirectory}${path.sep}`)) {
        fail(
          `${entry.id} imports outside its plugin directory in ${path.relative(repositoryRoot, sourcePath)}.`,
        );
      }
    }
  }

  if (entry.release) releasedRegistryEntries.set(entry.id, entry);
}

if (!fs.existsSync(releaseIndexPath))
  fail("Run pnpm run pack before pnpm release:verify.");
const releaseIndex = readJson(releaseIndexPath);
if (!Array.isArray(releaseIndex.releases))
  fail("release-index.json is missing its releases array.");
if (releaseIndex.releases.length !== releasedRegistryEntries.size) {
  fail(
    "release-index.json does not contain every enabled registry plugin exactly once.",
  );
}

const releaseIds = new Set();
for (const release of releaseIndex.releases) {
  const registryEntry = releasedRegistryEntries.get(release.pluginId);
  if (!registryEntry || releaseIds.has(release.pluginId))
    fail(`Unexpected or duplicate release ${release.pluginId}.`);
  releaseIds.add(release.pluginId);
  if (release.kind !== registryEntry.kind)
    fail(`Release kind mismatch for ${release.pluginId}.`);
  if (!/^sha256-[a-f0-9]{64}$/.test(release.artifactDigest)) {
    fail(`Invalid artifact digest for ${release.pluginId}.`);
  }

  const sourceManifest = readJson(
    path.join(assertInsideRoot(registryEntry.path), "plugin.json"),
  );
  if (
    release.version !== sourceManifest.version ||
    JSON.stringify(release.manifest) !== JSON.stringify(sourceManifest)
  ) {
    fail(`Release manifest mismatch for ${release.pluginId}.`);
  }

  const expectedArchive = path.join(
    ".plugin-artifacts",
    release.pluginId,
    release.version,
    `${release.pluginId}-${release.version}.tar.gz`,
  );
  if (release.archive !== expectedArchive) {
    fail(`Unexpected archive path for ${release.pluginId}.`);
  }
  const archivePath = assertInsideRoot(release.archive);
  const archive = fs.readFileSync(archivePath);
  if (archive.length > maximumArchiveBytes)
    fail(`Archive is too large for ${release.pluginId}.`);
  const digest = `sha256-${crypto.createHash("sha256").update(archive).digest("hex")}`;
  if (digest !== release.artifactDigest)
    fail(`Archive digest mismatch for ${release.pluginId}.`);

  if (
    !Array.isArray(release.inventory) ||
    release.inventory.length > maximumFiles
  ) {
    fail(`Invalid inventory for ${release.pluginId}.`);
  }
  for (const inventoryEntry of release.inventory) {
    if (
      forbiddenArtifactNames.some((pattern) =>
        pattern.test(inventoryEntry.path),
      )
    ) {
      fail(
        `Forbidden packaged file for ${release.pluginId}: ${inventoryEntry.path}`,
      );
    }
  }

  const expectedArtifactDirectory = path.join(
    ".plugin-artifacts",
    release.pluginId,
    release.version,
    release.artifactDigest,
  );
  if (release.artifactDirectory !== expectedArtifactDirectory) {
    fail(`Unexpected artifact directory for ${release.pluginId}.`);
  }

  const artifactDirectory = assertInsideRoot(release.artifactDirectory);
  if (!fs.statSync(artifactDirectory).isDirectory())
    fail(`Missing artifact directory for ${release.pluginId}.`);

  const extractedFiles = listFiles(artifactDirectory);
  if (extractedFiles.length !== release.inventory.length + 1) {
    fail(`Artifact file count mismatch for ${release.pluginId}.`);
  }

  const expectedPaths = new Set([
    ...release.inventory.map((entry) => entry.path),
    "inventory.json",
  ]);
  let extractedBytes = 0;
  for (const extractedFile of extractedFiles) {
    const relativePath = path
      .relative(artifactDirectory, extractedFile)
      .split(path.sep)
      .join("/");
    if (!expectedPaths.delete(relativePath)) {
      fail(`Unexpected artifact file for ${release.pluginId}: ${relativePath}`);
    }
    extractedBytes += fs.statSync(extractedFile).size;
  }
  if (expectedPaths.size > 0) {
    fail(
      `Missing artifact files for ${release.pluginId}: ${[...expectedPaths].join(", ")}`,
    );
  }
  if (extractedBytes > maximumExtractedBytes) {
    fail(`Extracted artifacts are too large for ${release.pluginId}.`);
  }

  for (const inventoryEntry of release.inventory) {
    const artifactPath = path.join(artifactDirectory, inventoryEntry.path);
    const artifactSize = fs.statSync(artifactPath).size;
    if (
      artifactSize !== inventoryEntry.size ||
      fileDigest(artifactPath) !== inventoryEntry.digest
    ) {
      fail(
        `Artifact bytes do not match inventory for ${release.pluginId}: ${inventoryEntry.path}`,
      );
    }
  }

  const packagedInventory = readJson(
    path.join(artifactDirectory, "inventory.json"),
  );
  if (
    packagedInventory.pluginId !== release.pluginId ||
    packagedInventory.version !== release.version ||
    JSON.stringify(packagedInventory.files) !==
      JSON.stringify(release.inventory)
  ) {
    fail(`Packaged inventory mismatch for ${release.pluginId}.`);
  }
}

process.stdout.write(
  `Verified ${releaseIndex.releases.length} release artifacts.\n`,
);
