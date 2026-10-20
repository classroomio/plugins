import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const scriptName = process.argv[2];
if (!scriptName || !["check", "test"].includes(scriptName)) {
  throw new Error("Expected check or test.");
}

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const registry = JSON.parse(
  fs.readFileSync(
    path.join(repositoryRoot, "registry", "plugins.json"),
    "utf8",
  ),
);

for (const entry of registry.plugins.filter((candidate) => candidate.release)) {
  const pluginDirectory = path.resolve(repositoryRoot, entry.path);
  const packagePath = path.join(pluginDirectory, "package.json");
  if (!fs.existsSync(packagePath)) continue;

  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  if (!packageJson.scripts?.[scriptName]) continue;

  const result = spawnSync("pnpm", ["run", scriptName], {
    cwd: pluginDirectory,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
