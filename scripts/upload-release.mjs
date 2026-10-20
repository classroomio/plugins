import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const bucket = process.env.PLUGIN_ASSET_BUCKET;
const endpoint = process.env.R2_ENDPOINT_URL;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) {
  throw new Error("R2 release credentials are not configured.");
}

const releaseIndex = JSON.parse(
  fs.readFileSync(
    path.join(repositoryRoot, ".plugin-artifacts", "release-index.json"),
    "utf8",
  ),
);
const releaseRequest = JSON.parse(
  fs.readFileSync(
    path.join(repositoryRoot, ".plugin-artifacts", "release-request.json"),
    "utf8",
  ),
);
const releasesById = new Map(
  releaseIndex.releases.map((release) => [release.pluginId, release]),
);
const r2 = new S3Client({
  region: "auto",
  endpoint,
  forcePathStyle: true,
  credentials: { accessKeyId, secretAccessKey },
});

function digestBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function contentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return (
    {
      ".css": "text/css; charset=utf-8",
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml",
      ".wasm": "application/wasm",
    }[extension] ?? "application/octet-stream"
  );
}

function filesUnder(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...filesUnder(entryPath));
    else if (entry.isFile()) files.push(entryPath);
    else
      throw new Error(`Release artifacts cannot contain links: ${entryPath}`);
  }

  return files;
}

function isMissingObject(error) {
  return (
    error?.$metadata?.httpStatusCode === 404 ||
    error?.name === "NotFound" ||
    error?.name === "NoSuchKey"
  );
}

function isPreconditionFailure(error) {
  return error?.$metadata?.httpStatusCode === 412;
}

async function assertExistingObjectMatches(localBytes, objectKey) {
  const existingObject = await r2.send(
    new GetObjectCommand({ Bucket: bucket, Key: objectKey }),
  );
  if (!existingObject.Body)
    throw new Error(`R2 returned an empty object: ${objectKey}`);

  const remoteBytes = Buffer.from(
    await existingObject.Body.transformToByteArray(),
  );
  if (digestBuffer(localBytes) !== digestBuffer(remoteBytes)) {
    throw new Error(
      `Immutable R2 object already exists with different bytes: ${objectKey}`,
    );
  }
}

async function uploadImmutable(localPath, objectKey) {
  const localBytes = fs.readFileSync(localPath);
  try {
    await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey }));
    await assertExistingObjectMatches(localBytes, objectKey);

    return;
  } catch (error) {
    if (!isMissingObject(error)) throw error;
  }

  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: objectKey,
        Body: localBytes,
        ContentType: contentType(localPath),
        CacheControl: "public, max-age=31536000, immutable",
        IfNoneMatch: "*",
      }),
    );
  } catch (error) {
    if (!isPreconditionFailure(error)) throw error;
    await assertExistingObjectMatches(localBytes, objectKey);
  }
}

for (const candidate of releaseRequest.releases) {
  const release = releasesById.get(candidate.pluginId);
  if (
    !release ||
    release.version !== candidate.version ||
    release.artifactDigest !== candidate.artifactDigest
  ) {
    throw new Error(
      `Release request does not match release-index.json for ${candidate.pluginId}.`,
    );
  }

  const keyPrefix = `${release.pluginId}/${release.version}/${release.artifactDigest}`;
  const artifactDirectory = path.resolve(
    repositoryRoot,
    release.artifactDirectory,
  );
  for (const assetPath of filesUnder(artifactDirectory)) {
    const relativePath = path
      .relative(artifactDirectory, assetPath)
      .split(path.sep)
      .join("/");
    await uploadImmutable(assetPath, `${keyPrefix}/${relativePath}`);
  }

  const archivePath = path.resolve(repositoryRoot, release.archive);
  await uploadImmutable(archivePath, `${keyPrefix}/package.tar.gz`);
}

process.stdout.write(
  `Uploaded ${releaseRequest.releases.length} immutable plugin releases.\n`,
);
