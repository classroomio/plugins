# Plugins

The official source repository for ClassroomIO plugins.

This repository is the canonical source and release pipeline for ClassroomIO's reviewed plugin
catalog. Plugin changes enter through GitHub pull requests. Contributors submit source code;
ClassroomIO's protected release workflow builds and publishes approved artifacts after merge.

This is not the ClassroomIO application backend or Plugin SDK repository. Those live in
[`classroomio/classroomio`](https://github.com/classroomio/classroomio). Plugins in this repository
are frontend packages or declarative contributions. They do not run their own ClassroomIO backend
and do not receive ClassroomIO credentials. Sandboxed plugin interfaces use the public Plugin SDK
to request permission-checked host capabilities, including installation-scoped plugin storage.

## Plugins in this repository

| Plugin | What it contributes | Data access |
| --- | --- | --- |
| Announcement Banner | An academy banner and organization settings page | Organization and user-scoped plugin storage |
| Certificate Studio | A certificate template picker and organization design page | Certificate template write access and organization-scoped plugin storage |
| Course & Live Calendar | An organization page and course sidebar schedule | Course, lesson, and exercise metadata |
| Creative Landing Templates | A landing-page template picker and public renderer | No ClassroomIO data permission |
| Lesson Policy Acknowledgment | A learner acknowledgment widget after lesson content | User-scoped plugin storage |
| LinkedIn Certificate Sharing | A host-rendered certificate action that opens LinkedIn | No ClassroomIO data permission or stored customer data |
| Reading Time Estimator | A reading-time widget after lesson content | Computed lesson metadata |

All seven plugins are currently release-enabled in [`registry/plugins.json`](registry/plugins.json).
[`plugin-conformance`](plugin-conformance) is a non-releasable fixture used to test the hosted plugin
contract.

## How the repository works

Each plugin owns its source, manifest, dependencies, tests, and build configuration inside one
top-level directory. Its `plugin.json` declares what ClassroomIO may load or render:

- identity, version, compatibility, and packaged assets;
- custom UI entrypoints or host-rendered contributions;
- supported slots, pages, navigation items, templates, or actions;
- required permissions and external network origins;
- whether it stores customer data and how long retained data may remain after uninstall;
- host-managed storage documents and their schemas, when storage is needed.

The registry is the release allowlist. A directory is not publishable merely because it exists in
the repository. Its registry ID must match its manifest ID, `release` must be enabled, and the
repository verification rules must pass.

```text
plugins/
├── .github/workflows/        # Pull-request validation and protected releases
├── registry/plugins.json    # Reviewed plugin and release allowlist
├── scripts/                 # Release verification, upload, and registration
├── announcement-banner/     # One self-contained plugin
├── certificate-studio/
├── course-calendar/
├── landing-templates/
├── lesson-acknowledgment/
├── linkedin-sharing/
├── reading-time/
└── plugin-conformance/       # Test fixture; never released
```

## Contribute through GitHub

### 1. Fork and clone

Fork [`classroomio/plugins`](https://github.com/classroomio/plugins), then clone your fork and add
the upstream repository:

```bash
git clone git@github.com:<your-github-username>/plugins.git
cd plugins
git remote add upstream git@github.com:classroomio/plugins.git
git switch -c feat/<plugin-or-change>
```

The Plugin SDK boundary packages are linked from the ClassroomIO repository until those packages
are published independently. For local builds, clone `classroomio/classroomio` beside this
repository. The following layout matches the GitHub repository names; the sibling ClassroomIO
checkout must be named `classroomio` so the current `link:` dependencies resolve:

```text
workspace/
├── classroomio/
└── plugins/
```

The GitHub workflows pin a specific ClassroomIO commit. For the closest match to CI, use the
`ref` configured for the `classroomio/classroomio` checkout in
[the pull-request workflow](.github/workflows/plugin-pr.yml).

### 2. Install and build

Use the versions declared by [`.nvmrc`](.nvmrc) and `packageManager` in
[`package.json`](package.json). Build the linked SDK once, then install this workspace:

```bash
cd ../classroomio
pnpm install --frozen-lockfile
pnpm --filter @classroomio/plugin-sdk build

cd ../plugins
pnpm install --frozen-lockfile
pnpm build
pnpm check
pnpm test
pnpm run pack
pnpm release:verify
```

Use `pnpm run pack`, not bare `pnpm pack`. The repository command builds every release-enabled
registry entry and writes deterministic archives plus `release-index.json` under the ignored
`.plugin-artifacts/` directory. Bare `pnpm pack` creates an npm package tarball instead.

### 3. Make the plugin change

For an existing plugin:

- keep changes inside that plugin's directory unless a repository-level contract must change;
- increment `plugin.json.version` whenever released plugin code, assets, or behavior changes;
- request only the permissions, storage, and network origins the plugin actually uses;
- add or update tests for behavior changes;
- do not import private ClassroomIO modules such as `@cio/*`, `$lib/*`, or `$app/*`;
- do not import source from another plugin directory.

For a new community plugin:

- use a reverse-domain plugin ID controlled by you, such as `com.example.reading-timer`;
- add one self-contained top-level plugin directory;
- add its ID, path, kind, and reviewed release state to `registry/plugins.json`;
- include `build`, `check`, and `test` scripts before requesting release;
- document permissions, allowed network origins, stored customer data, and retention behavior.

The `com.classroomio.*` namespace is reserved for first-party plugins. Registry inclusion and
catalog release remain subject to maintainer review.

### 4. Open the pull request

Push your branch and open a pull request against `classroomio/plugins:main`. Complete the pull
request template, include manual test steps, and sign the ClassroomIO Contributor License Agreement
when requested.

Pull-request CI runs without production release credentials. It:

1. checks out the plugin source and the pinned ClassroomIO SDK boundary;
2. installs locked dependencies;
3. runs repository checks and tests;
4. builds and verifies all release-enabled plugin archives;
5. rebuilds the archives and compares their digests to prove deterministic output;
6. uploads the review artifacts to GitHub Actions with seven-day retention.

Maintainers review the source, manifest capabilities, data policy, dependency boundary, tests, and
generated artifact report before merge.

## Develop one plugin locally

Most UI plugins expose standard Vite commands. For example:

```bash
pnpm --dir announcement-banner run dev
pnpm --dir announcement-banner run build
pnpm --dir announcement-banner run test
pnpm --dir announcement-banner run pack
```

`dev` serves the plugin interface directly for frontend work. It does not install the plugin into
ClassroomIO.

To test a packaged plugin inside a local ClassroomIO organization, run the local ClassroomIO API,
configure its `PLUGIN_ARTIFACTS_PATH` to point at this repository's `.plugin-artifacts` directory,
and provide an organization API key with `plugin:development`:

```bash
export CLASSROOMIO_API_URL=http://localhost:3002
export CLASSROOMIO_DEV_TOKEN=<organization-api-key>
export CLASSROOMIO_ORG_ID=<organization-id>

pnpm --dir announcement-banner run seed -- --org "$CLASSROOMIO_ORG_ID"
```

The development installation endpoint is unavailable in production and limits the installation to
the API key's organization.

## Release after merge

Contributors do not upload production artifacts and do not call the production registration API.
The [release workflow](.github/workflows/release-plugins.yml) runs from protected `main` through the
`plugin-production` GitHub Environment.

For an approved release, the workflow:

1. repeats the locked install, checks, tests, packaging, verification, and deterministic rebuild;
2. selects eligible release entries affected by the merge and rejects a changed plugin whose
   manifest version was not incremented;
3. uploads assets and archives to immutable, digest-qualified object-storage paths;
4. creates a GitHub build-provenance attestation for the release archives;
5. asks the ClassroomIO internal release API to verify and register the approved versions.

Existing objects are never silently overwritten. A retry is accepted only when the existing bytes
match the locally verified artifact.

Maintainer-only repository protections and production environment requirements are documented in
[`.github/BRANCH_PROTECTION.md`](.github/BRANCH_PROTECTION.md) and [`.env.example`](.env.example).

## Repository rules enforced by verification

Release verification rejects, among other invalid states:

- duplicate registry IDs or paths and manifest/registry ID mismatches;
- first-party namespace misuse or a releasable fixture;
- missing build, check, or test scripts for release-enabled plugins;
- unapproved local dependencies, unpinned external dependencies, and private host imports;
- imports that escape a plugin directory;
- oversized archives, unexpected inventory, links, source maps, environment files, and key files;
- release artifacts whose version, manifest, digest, paths, or extracted bytes do not match the
  canonical release index.

Do not commit `dist/`, `.plugin-artifacts/`, npm tarballs, credentials, local environment files,
private keys, or source maps.
