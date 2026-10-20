import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const registry = JSON.parse(
  fs.readFileSync(
    path.join(repositoryRoot, "registry", "plugins.json"),
    "utf8",
  ),
);
const releaseIndex = JSON.parse(
  fs.readFileSync(
    path.join(repositoryRoot, ".plugin-artifacts", "release-index.json"),
    "utf8",
  ),
);
const sourceCommit = process.env.GITHUB_SHA;
const runId = process.env.GITHUB_RUN_ID;
const repository = process.env.GITHUB_REPOSITORY;
const baseCommit = process.env.RELEASE_BASE_SHA;

if (
  !sourceCommit ||
  !runId ||
  repository !== "classroomio/classroomio-plugins"
) {
  throw new Error(
    "Release request creation is restricted to the ClassroomIO plugin release workflow.",
  );
}

let changedPaths = [];
if (baseCommit && !/^0+$/.test(baseCommit)) {
  const diff = spawnSync(
    "git",
    ["diff", "--name-only", baseCommit, sourceCommit],
    {
      cwd: repositoryRoot,
      encoding: "utf8",
    },
  );
  if (diff.status !== 0)
    throw new Error(diff.stderr || "Unable to determine changed plugins.");
  changedPaths = diff.stdout.split("\n").filter(Boolean);
}

const registryChanged = changedPaths.includes("registry/plugins.json");
const enabledEntries = registry.plugins.filter((entry) => entry.release);
const selectedEntries =
  changedPaths.length === 0
    ? enabledEntries
    : enabledEntries.filter(
        (entry) =>
          registryChanged ||
          changedPaths.some((changedPath) =>
            changedPath.startsWith(`${entry.path}/`),
          ),
      );
const releasesById = new Map(
  releaseIndex.releases.map((release) => [release.pluginId, release]),
);
const releases = selectedEntries.map((entry) => {
  const release = releasesById.get(entry.id);
  if (!release) throw new Error(`Missing release artifact for ${entry.id}.`);

  const pluginChanged = changedPaths.some((changedPath) =>
    changedPath.startsWith(`${entry.path}/`),
  );
  if (pluginChanged && baseCommit) {
    const previousManifest = spawnSync(
      "git",
      ["show", `${baseCommit}:${entry.path}/plugin.json`],
      {
        cwd: repositoryRoot,
        encoding: "utf8",
      },
    );
    if (previousManifest.status === 0) {
      const previousVersion = JSON.parse(previousManifest.stdout).version;
      if (previousVersion === release.version) {
        throw new Error(
          `${entry.id} changed without incrementing plugin.json.version.`,
        );
      }
    }
  }

  return {
    pluginId: release.pluginId,
    version: release.version,
    artifactDigest: release.artifactDigest,
    kind: entry.kind,
  };
});
const request = {
  sourceCommit,
  workflowRunUrl: `https://github.com/${repository}/actions/runs/${runId}`,
  releases,
};
const outputPath = path.join(
  repositoryRoot,
  ".plugin-artifacts",
  "release-request.json",
);
fs.writeFileSync(outputPath, `${JSON.stringify(request, null, 2)}\n`);
process.stdout.write(`${releases.length}\n`);
