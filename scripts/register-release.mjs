import fs from "node:fs";
import path from "node:path";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const apiUrl = process.env.CLASSROOMIO_API_URL?.replace(/\/$/, "");
const deployToken = process.env.PLUGIN_RELEASE_DEPLOY_TOKEN;
if (!apiUrl || !deployToken)
  throw new Error("Release API credentials are not configured.");

const request = fs.readFileSync(
  path.join(repositoryRoot, ".plugin-artifacts", "release-request.json"),
  "utf8",
);
const response = await fetch(`${apiUrl}/internal/plugin-releases`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${deployToken}`,
    "Content-Type": "application/json",
  },
  body: request,
});

if (!response.ok)
  throw new Error(
    `Release registration failed (${response.status}): ${await response.text()}`,
  );
process.stdout.write(`${await response.text()}\n`);
