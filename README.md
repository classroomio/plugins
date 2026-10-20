# ClassroomIO Plugins

This repository is the source-reviewed release gate for first-party and community ClassroomIO plugins. Developers submit plugin source through a pull request. Pull-request CI builds untrusted review artifacts without production credentials. After merge to protected `main`, a protected workflow rebuilds the same source, proves deterministic digests, uploads immutable assets to R2, and registers the approved versions with ClassroomIO.

Developers do not upload production artifacts or call the production release API.

## Repository layout

- `registry/plugins.json` is the release allowlist. Every plugin has one unique ID and path.
- Each plugin directory contains source, tests, `package.json`, and `plugin.json`.
- `plugin-conformance` is a fixture and has `release: false`.
- `scripts/` contains trusted verification, immutable upload, and release registration helpers.
- `.github/workflows/plugin-pr.yml` validates pull requests without secrets.
- `.github/workflows/release-plugins.yml` releases merged code through the protected `plugin-production` Environment.

The `com.classroomio.*` namespace is reserved for registry entries with `kind: "first-party"`. Community plugins must use an ID controlled by their publisher, such as `com.example.reading-timer`.

Only `linkedin-sharing` is currently release-enabled. The UI plugins remain source-visible but have `release: false` until their declared browser capabilities are implemented end to end in the public SDK and host bridge. CI never infers releases from directories, so incomplete plugins cannot enter production accidentally.

## Local setup

The ClassroomIO boundary packages are not published to npm yet. Until they are, clone this repository beside the public `classroomio` repository so the pinned `link:` dependencies resolve:

```text
Dev/
├── classroomio/
└── classroomio-plugins/
```

Use Node 20.19.3 and pnpm 10.19.0, then run:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm check
pnpm test
pnpm run pack
pnpm release:verify
```

`pnpm run pack` is the only repository release packager. It reads `registry/plugins.json`, rebuilds enabled plugins, and writes deterministic archives and `release-index.json` under `.plugin-artifacts/`. Do not use bare `pnpm pack`; that is pnpm's npm-package tarball command.

## Test a plugin in local ClassroomIO

Run the ClassroomIO API and configure `apps/api/.env`:

```bash
PLUGIN_ARTIFACTS_PATH=/absolute/path/to/classroomio-plugins/.plugin-artifacts
```

Create an organization API key with `plugin:development`. The profile that created it must still be an administrator of the target organization. In the plugin directory, use normal Vite commands for UI work and `seed` only for a packaged ClassroomIO installation:

```bash
npm run dev
npm run build
npm run pack

export CLASSROOMIO_API_URL=http://localhost:3002
export CLASSROOMIO_DEV_TOKEN=<organization-api-key-with-plugin-development-scope>
export CLASSROOMIO_ORG_ID=<organization-id>
npm run seed -- --org "$CLASSROOMIO_ORG_ID"
```

The development endpoint is unavailable in production, writes only to `PLUGIN_ARTIFACTS_PATH`, and limits the installation to the API key's organization.

## Submit a plugin

1. Fork this repository and add one plugin directory.
2. Add its ID, path, kind, and release flag to `registry/plugins.json`.
3. Keep runtime imports inside the public plugin SDK and public browser packages.
4. Add tests and document permissions, network origins, storage, and customer-data retention.
5. Run all local checks and open a pull request.
6. Sign the ClassroomIO CLA when requested.
7. Address source review and the artifact report produced by pull-request CI.

Every change to a released plugin must increment `plugin.json.version`. Never commit `dist/`, `.plugin-artifacts/`, credentials, `.env` files, private keys, or source maps.

## Production release flow

The release workflow runs only after a merge to `main` and uses the protected `plugin-production` Environment. It selects changed registry plugins, rebuilds twice, rejects nondeterministic digests, uploads each asset to:

```text
{pluginId}/{version}/{sha256-digest}/{assetPath}
{pluginId}/{version}/{sha256-digest}/package.tar.gz
```

Existing R2 objects are never overwritten. Identical bytes are accepted as an idempotent retry; different bytes at an existing key fail the release. After upload, the workflow calls `POST /internal/plugin-releases`. The API re-downloads the archive, recomputes its digest, validates the manifest and namespace policy, and atomically registers catalog versions with source and workflow provenance.

## Required GitHub configuration

Create a protected Environment named `plugin-production` with required maintainer approval. Configure:

| Name                          | Type                 | Purpose                                                              |
| ----------------------------- | -------------------- | -------------------------------------------------------------------- |
| `CLASSROOMIO_API_URL`         | Environment secret   | Production ClassroomIO API origin.                                   |
| `PLUGIN_RELEASE_DEPLOY_TOKEN` | Environment secret   | Dedicated release-registration token, at least 32 random characters. |
| `R2_ACCESS_KEY_ID`            | Environment secret   | R2 key ID restricted to the production plugin bucket.                |
| `R2_SECRET_ACCESS_KEY`        | Environment secret   | Matching R2 secret.                                                  |
| `R2_ENDPOINT_URL`             | Environment secret   | `https://<account-id>.r2.cloudflarestorage.com`.                     |
| `PLUGIN_ASSET_BUCKET`         | Environment variable | Production R2 bucket name.                                           |

The API host separately needs matching `PLUGIN_RELEASE_DEPLOY_TOKEN`, `PLUGIN_ASSET_BUCKET`, and the public `PLUGIN_ASSET_ORIGIN`. Apply the branch and Environment protections in `.github/BRANCH_PROTECTION.md` before enabling releases.

## Dependency transition

CI pins the ClassroomIO boundary packages to core commit `70916e365baab864e103c850ceb2a7d38c8821c4` and exposes no secrets to fork pull requests. Once `@classroomio/plugin-sdk`, `@classroomio/plugin-design`, and `@classroomio/certificate-kit` are published, replace every local `link:` with an exact public version, regenerate `pnpm-lock.yaml`, remove the pinned core checkout from both workflows, and make `release:verify` reject all local dependency protocols.
