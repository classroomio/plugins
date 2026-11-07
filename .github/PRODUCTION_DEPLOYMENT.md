# Production Deployment & Release Pipeline

This document explains how approved plugin releases are built, uploaded, and registered to production when changes merge into `main`.

## Pipeline Architecture

```text
PR merged to main
       │
       ▼
GitHub Actions (release-plugins.yml)
  • Checks out pinned ClassroomIO SDK & plugins
  • Runs check, test, deterministic pack verification
  • Detects version-bumped releases eligible for publication
       │
       ├───────────────────────────────────────────────┐
       ▼                                               ▼
Cloudflare R2 Bucket                             ClassroomIO API
  • Uploads static web bundles                     • Calls POST /internal/plugin-releases
    (HTML, JS, CSS, package.tar.gz)                • Authenticates with deploy token
  • Immutable paths:                               • Registers approved versions in DB
    {pluginId}/{version}/{digest}/...              • Enables catalog discovery
       │
       ▼
Client Browsers (Dashboard / Academy)
  • Load plugin iframes directly from CDN (PLUGIN_ASSET_ORIGIN)
```

In production, the ClassroomIO API does **not** stream plugin web assets. Sandboxed plugin iframes fetch static bundles directly from Cloudflare R2 / Cloudflare CDN at `PLUGIN_ASSET_ORIGIN` (`https://plugins.classroomio.com`). This ensures fast edge delivery and isolates backend API resources from plugin asset traffic.

---

## 1. Cloudflare R2 Bucket Configuration

1. In the Cloudflare dashboard, navigate to **R2** > **Create bucket**.
2. Name the bucket (e.g., `classroomio-plugins`).
3. Connect a custom domain:
   - In bucket settings, go to **Settings** > **Public access** > **Connect Domain**.
   - Enter your public asset origin, such as `plugins.classroomio.com`.
4. Configure CORS under **Bucket Settings** > **CORS Policy** if plugins load font or canvas assets cross-origin:
   ```json
   [
     {
       "AllowedOrigins": ["https://app.classroomio.com", "https://*.classroomio.com"],
       "AllowedMethods": ["GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 86400
     }
   ]
   ```
5. Generate an API token:
   - Navigate to **R2** > **Manage R2 API Tokens** > **Create API token**.
   - Permissions: **Object Read & Write**.
   - Specify bucket: Apply only to the `classroomio-plugins` bucket.
   - Note the **Endpoint URL** (`https://<account-id>.r2.cloudflarestorage.com`), **Access Key ID**, and **Secret Access Key**.

---

## 2. ClassroomIO API Configuration

On your production ClassroomIO backend, configure the following environment variables in `apps/api/.env`:

```bash
# Public CDN origin where Cloudflare R2 is served
PLUGIN_ASSET_ORIGIN="https://plugins.classroomio.com"

# Shared deploy secret for automated release registration (at least 32 random characters)
PLUGIN_RELEASE_DEPLOY_TOKEN="generate-a-secure-random-token-here"
```

Restart the API service after updating environment variables.

---

## 3. GitHub Actions Environment Configuration

The release workflow (`.github/workflows/release-plugins.yml`) targets the `plugin-production` GitHub Environment.

### Create the Environment
1. In `classroomio/plugins`, go to **Settings** > **Environments** > **New environment**.
2. Name: `plugin-production`.
3. Under **Deployment branches**, select **Selected branches** and add `main`.
4. (Optional) Under **Required reviewers**, designate maintainers who must approve releases before deployment.

### Set Environment Secrets
In the `plugin-production` environment, add the following secrets:

| Secret | Description | Example |
| --- | --- | --- |
| `CLASSROOMIO_API_URL` | Base URL of the production ClassroomIO API | `https://api.classroomio.com` |
| `PLUGIN_RELEASE_DEPLOY_TOKEN` | Matches `PLUGIN_RELEASE_DEPLOY_TOKEN` on the API server | `32+ random characters` |
| `R2_ENDPOINT_URL` | Cloudflare R2 S3 endpoint | `https://<account-id>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 API token access key ID | `e.g. 7f3b...` |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 API token secret access key | `e.g. a91c...` |

### Set Environment Variables
In the `plugin-production` environment, add the following variable:

| Variable | Description | Example |
| --- | --- | --- |
| `PLUGIN_ASSET_BUCKET` | The name of the Cloudflare R2 bucket | `classroomio-plugins` |

---

## 4. Release Verification & Rollbacks

- **Immutability**: The upload script (`scripts/upload-release.mjs`) uploads files with `IfNoneMatch: "*"` and `CacheControl: "public, max-age=31536000, immutable"`. If an object key already exists, the upload asserts that the existing bytes match the local build. It will fail rather than silently overwrite.
- **Rollbacks**: If a released plugin version is broken, increment its patch version in `plugin.json` (e.g. `1.0.1` -> `1.0.2`), submit a fix PR, and merge. Alternatively, mark the version revoked in the ClassroomIO database using the admin CLI.

