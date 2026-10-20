import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const pluginDirectory = path.resolve(import.meta.dirname, "..");

test("build emits only the declared icon asset", () => {
  const result = spawnSync(process.execPath, ["./scripts/build.mjs"], {
    cwd: pluginDirectory,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr);

  const sourceIcon = fs.readFileSync(
    path.join(pluginDirectory, "public", "assets", "icon.svg"),
  );
  const builtIcon = fs.readFileSync(
    path.join(pluginDirectory, "dist", "assets", "icon.svg"),
  );
  assert.deepEqual(builtIcon, sourceIcon);
  assert.deepEqual(fs.readdirSync(path.join(pluginDirectory, "dist")), [
    "assets",
  ]);
  assert.deepEqual(
    fs.readdirSync(path.join(pluginDirectory, "dist", "assets")),
    ["icon.svg"],
  );
});
