# Certificate Studio External Plugin Porting Plan

## Purpose

This is the execution handoff for porting the Certificate Studio donor from `feat/plugin-system` into the approved external-plugin architecture.

The goal is not to move the old files into a new folder. The goal is to preserve the useful Studio experience while replacing every private dependency with a public contract. The finished Studio must be a credible example of a complex first-party plugin that a third-party developer could also build.

The platform-wide permission naming convention, API catalog, authorization equation, and end-to-end delivery sequence are defined in [`../../prd/plugin-system/public-plugin-api-v1.md`](../../prd/plugin-system/public-plugin-api-v1.md). This port must consume those contracts rather than creating Certificate Studio-only variants.

Start from the current working branch. Do not restart from `main`, reset the branch, or merge the old plugin framework. Use `git show feat/plugin-system:<path>` to inspect donor files without checking out or copying the old architecture wholesale.

## Locked architectural decisions

1. Source lives at `official-plugins/certificate-studio/` in the ClassroomIO repository.
2. The UI is a standalone Svelte 5 + Vite application, compiled to static assets.
3. The UI always runs in the existing sandboxed plugin iframe.
4. The plugin imports no private ClassroomIO code, including `@cio/*`, `$lib/*`, `$features/*`, `$app/*`, `apps/*`, or relative paths outside its directory.
5. The plugin may use public packages such as `@classroomio/plugin-sdk`, `@classroomio/plugin-design`, and the public certificate contract/renderer package described below.
6. Certificate Studio has a separately deployable backend and its own PostgreSQL schema and migrations.
7. Plugin-owned templates are not stored in the ClassroomIO core database.
8. Core certificate issuance, rendering, verification, and course certificate configuration remain core capabilities.
9. When a Studio template is applied to a course, ClassroomIO stores a validated design snapshot. Existing courses and issued certificates must continue working when the plugin is disabled or unavailable.
10. The Official badge never bypasses permissions, sandboxing, backend authentication, tenant checks, audit logging, or lifecycle handling.
11. The initial release is cloud-only and published by ClassroomIO.

## Target architecture

```text
ClassroomIO dashboard
  ├── PluginHostFrame (opaque-origin sandbox)
  │     ├── Studio full-page Svelte UI
  │     └── compact certificate-template picker UI
  │
  ├── public plugin bridge
  │     ├── context/theme/navigation/toast
  │     ├── organization.getProfile()
  │     ├── auth.requestLaunchCode()
  │     └── certificateTemplates.apply()
  │
  └── ClassroomIO API
        ├── verifies installation, grants, user, org, role and resource
        ├── exchanges launch codes with an authenticated plugin backend
        └── validates and snapshots an applied certificate design

Certificate Studio service
  ├── exchanges a one-time launch code server-to-server
  ├── issues a short-lived Studio session
  ├── owns template CRUD and authorization
  ├── owns PostgreSQL tables and migrations
  └── receives signed lifecycle webhooks
```

The browser must never receive a ClassroomIO client secret. The backend must never trust an organization ID, installation ID, user ID, or role supplied directly by the browser. Those values come only from verified launch claims.

## Donor inventory

The donor is reference material, not production code. Its main files are:

- `feat/plugin-system:plugins/certificate/certificate-studio/components/certificate-templates-page.svelte`
- `feat/plugin-system:plugins/certificate/certificate-studio/components/certificate-studio-builder.svelte`
- `feat/plugin-system:plugins/certificate/certificate-studio/components/canvas-stage.svelte`
- `feat/plugin-system:plugins/certificate/certificate-studio/components/canvas-element-zone.svelte`
- `feat/plugin-system:plugins/certificate/certificate-studio/components/inspector-panel.svelte`
- `feat/plugin-system:plugins/certificate/certificate-studio/components/studio-header.svelte`
- `feat/plugin-system:plugins/certificate/certificate-studio/types.ts`
- `feat/plugin-system:apps/api/src/routes/plugins/certificate-studio.ts`
- `feat/plugin-system:apps/api/src/services/plugin/org-certificate-preset.ts`
- `feat/plugin-system:packages/db/src/queries/plugins/org-certificate-preset.ts`
- `feat/plugin-system:apps/dashboard/src/lib/features/plugins/store/org-certificate-presets.svelte.ts`

| Donor dependency | Donor use | Required replacement |
| --- | --- | --- |
| `$app/navigation`, `$app/state` | page routing and URL parameters | In-memory or hash router owned by the plugin; `client.navigation` only for host navigation |
| `$lib/utils/store/org` | organization ID, name, logo | Bridge context for identity and `client.organization.getProfile()` for approved display fields |
| `$features/plugins` preset store | template CRUD and caching | Plugin-owned API client calling the Certificate Studio backend |
| `$features/ui`, `@cio/ui` | dialogs, inputs, buttons, page shell, unsaved-change UI | Svelte components owned by the plugin and semantic styles from `@classroomio/plugin-design` |
| `$lib` translations | all visible copy | Plugin-owned locale dictionaries selected from bridge context locale |
| `@cio/certificates` | design types, defaults, normalization, preview | Public `@classroomio/certificate-kit` package |
| `@lucide/svelte` | icons | Public npm dependency; allowed |
| core `org_certificate_preset` table | template persistence | Certificate Studio service database |
| core `/plugins/certificate-studio/presets` routes | template CRUD | Certificate Studio service `/v1/templates` routes |
| core capability store | enablement | Standard plugin installation status and grants |
| direct course-editor preset store | presents and applies templates | `certificate.templates` iframe contribution and an apply-template bridge command |
| `confirm()` | deletion confirmation | Accessible plugin-owned confirmation dialog |
| host `UnsavedChanges` | navigation protection | Plugin-local dirty-state prompt plus a public host dirty-state bridge contract if host navigation must be blocked |

The following donor behavior should be preserved:

- list, create, edit, clone, preview, and delete organization templates;
- starter templates;
- template naming and unsaved-change state;
- border, typography, background, badge, QR-code, signatory, copy, and element-position controls;
- canvas zoom, fit, selection, dragging, resizing, centering, and reset behavior;
- responsive full-page editor;
- applying a template to a course through the course certificate editor.

Do not preserve donor implementation details that cross the plugin boundary.

## Required repository layout

Create this structure incrementally:

```text
official-plugins/certificate-studio/
├── plugin.json
├── package.json
├── README.md
├── PORTING_PLAN.md
├── vite.config.ts
├── tsconfig.json
├── studio.html
├── picker.html
├── src/
│   ├── shared/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── config.ts
│   │   ├── i18n.ts
│   │   └── types.ts
│   ├── studio/
│   │   ├── main.ts
│   │   ├── StudioApp.svelte
│   │   └── components/
│   └── picker/
│       ├── main.ts
│       └── TemplatePicker.svelte
└── service/
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── app.ts
    │   ├── auth.ts
    │   ├── config.ts
    │   ├── db.ts
    │   ├── routes/
    │   └── repositories/
    ├── migrations/
    │   └── 0001_initial.sql
    └── tests/
```

The UI and service may be separate workspace packages if that produces cleaner build and deployment boundaries. If so, add explicit workspace entries under `official-plugins/certificate-studio/*`. Do not add a generic example workspace or restore the deleted `plugins/` directory.

## Execution order

Do not start by copying the donor components. Complete the platform contracts first, then the service, then the UI.

### Step 1 — Add the public certificate contract and renderer

Create a publishable package named `@classroomio/certificate-kit`. It is a public API package even if its source initially lives under `packages/`.

It must contain:

- the versioned certificate design schema;
- TypeScript types inferred from that schema;
- default designs and supported renderer/template IDs;
- normalization and compatibility functions;
- a browser-safe preview renderer usable by the plugin;
- no dashboard stores, API services, database types, authentication state, or SvelteKit imports.

Refactor core certificate rendering to consume the same schema and normalization rules. There must be one canonical design format shared through a public package, not two similar interfaces maintained by hand.

Keep actual certificate issuance, authenticity, PDF generation, and verification in core. The public package may render a preview but must not issue or verify credentials.

Add contract tests covering:

- every built-in template;
- valid donor designs;
- unknown fields and malformed colors, dimensions, URLs, and signatories;
- maximum design size and collection limits;
- forward-compatible version handling;
- preview/core rendering compatibility for the same normalized design.

Do not let the Studio proceed until this package builds independently and the dashboard consumes its public contract successfully.

### Step 2 — Complete and harden remote-backend launch authentication

The current launch-code implementation is a useful prototype but is insufficient for a shared multi-tenant plugin service. It currently uses installation-scoped client secrets and does not fully enforce every binding described by the RFC.

Implement a registry-owned backend client identity for the plugin itself:

- provision a client ID and hashed secret for `com.classroomio.certificate-studio`;
- store only the hash in ClassroomIO;
- expose the raw secret exactly once to deployment automation, never to a dashboard user or iframe;
- authenticate the backend by plugin identity during launch-code exchange;
- verify that the consumed code belongs to an installation of that plugin;
- support secret rotation and revocation;
- audit creation, rotation, failed exchange, and revocation.

This is platform credential data, so its table belongs to core. It is not Certificate Studio domain data. Follow the repository rule of one core migration per PR and ensure its journal timestamp is later than `main`.

Harden launch-code creation and exchange so that ClassroomIO verifies:

- installation exists, is active, and is approved;
- installation belongs to the trusted organization context;
- authenticated user belongs to that organization;
- requested contribution target is declared by the installed version;
- requested backend audience matches the manifest backend origin;
- required grants are active;
- code is bound to plugin, version, installation, user, organization, contribution, audience, and handshake nonce;
- code expires within 60 seconds and can be consumed only once;
- role/capability claims are derived by ClassroomIO rather than supplied by the iframe.

The exchange response must include only the claims needed by the backend:

```ts
interface VerifiedPluginLaunchClaims {
  pluginId: string;
  versionId: string;
  installationId: string;
  organizationId: string;
  userId: string;
  organizationRole: 'admin' | 'tutor' | 'student';
  contributionTarget: 'plugin.page' | 'certificate.templates';
  audience: string;
  grantedScopes: string[];
  expiresAt: string;
}
```

Do not return the backend credential or a reusable ClassroomIO session to the browser.

Add tests for replay, expiration, wrong backend client, wrong plugin, wrong organization, disabled/revoked installation, undeclared target, audience mismatch, and insufficient role.

### Step 3 — Make manifest network policy effective at runtime

Certificate Studio UI must call its remote service. The current development asset response uses `connect-src 'none'`, so declaring `networkAccess.allowedDomains` alone is not enough.

Update plugin artifact serving/hosting so CSP is generated from the validated installed manifest:

- default remains `connect-src 'none'`;
- add only exact declared HTTPS origins;
- never accept paths, wildcards, credentials, or caller-supplied CSP fragments;
- keep scripts self-hosted and disallow arbitrary remote code;
- add tests proving undeclared origins remain blocked.

The backend should accept bearer authorization without cookies. Because the sandbox has an opaque origin, use CORS suitable for credential-free bearer requests, restrict allowed methods/headers, and rely on the short-lived unguessable token rather than cross-site cookies. Never enable `Access-Control-Allow-Credentials` with a wildcard origin.

### Step 4 — Add missing public bridge APIs

Add runtime-validated operations to `@classroomio/plugin-sdk`, the host bridge, dashboard API wrapper, and API routes.

#### `organization.getProfile()`

Permission: `organization.profile:read`.

Return only:

```ts
interface PluginOrganizationProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  locale: string;
}
```

Do not expose the full organization row or settings blob.

#### `certificateTemplates.apply()`

Available only inside a `certificate.templates` contribution with a host-bound course resource. The plugin must not choose an arbitrary organization or course ID.

Suggested request:

```ts
interface ApplyCertificateTemplateRequest {
  externalTemplateId: string;
  externalTemplateVersion: number;
  name: string;
  design: CertificateDesignV1;
}
```

The host/API must:

1. require `certificate.template:write`;
2. require an active, approved installation;
3. require an organization admin or authorized course manager;
4. bind the operation to the course resource supplied by the host surface;
5. validate and normalize `design` using `@classroomio/certificate-kit`;
6. store a complete snapshot in the existing core course certificate configuration;
7. record source metadata without making rendering depend on the remote plugin;
8. emit an audit record;
9. return the normalized snapshot version.

Never let the iframe call a general internal course API or pass an unrestricted course ID.

#### Optional `ui.setDirty()`

If closing or navigating away from the plugin page must trigger the host’s unsaved-change guard, add a small `ui.setDirty({ dirty: boolean })` bridge operation. The host owns the browser navigation warning. This operation grants no data access.

Validate every bridge payload at runtime. TypeScript casts alone are not validation.

### Step 5 — Define the production manifest

Create `official-plugins/certificate-studio/plugin.json` with:

- plugin ID `com.classroomio.certificate-studio`;
- a remote backend at the production Studio service origin;
- exact network origin allowlisting;
- a full-page `studio` entrypoint;
- a compact `templatePicker` entrypoint;
- organization-settings navigation pointing to the Studio page;
- a `certificate.templates` custom slot for the picker;
- required permissions only;
- lifecycle event subscriptions;
- a truthful customer-data policy and privacy URL.

Expected contribution shape:

```json
{
  "runtime": {
    "ui": {
      "entrypoints": {
        "studio": { "renderMode": "custom", "resource": "dist/studio.html" },
        "templatePicker": { "renderMode": "custom", "resource": "dist/picker.html" }
      }
    },
    "backend": {
      "type": "remote",
      "baseUrl": "https://certificate-studio.services.classroomio.com",
      "webhookPath": "/v1/webhooks/classroomio"
    }
  },
  "permissions": {
    "required": [
      "organization.profile:read",
      "certificate.template:read",
      "certificate.template:write"
    ],
    "optional": ["certificate.issued:read"]
  },
  "networkAccess": {
    "allowedDomains": ["https://certificate-studio.services.classroomio.com"]
  },
  "events": {
    "subscriptions": ["plugin.uninstalled", "organization.deleted"]
  },
  "contributes": {
    "navigation": [
      {
        "id": "certificate-studio-navigation",
        "title": "Certificate Studio",
        "location": "organization.settings",
        "page": "certificate-studio",
        "icon": "award",
        "visibility": "organization.admin"
      }
    ],
    "pages": [
      {
        "id": "certificate-studio",
        "entrypoint": "studio",
        "title": "Certificate Studio"
      }
    ],
    "slots": [
      {
        "id": "certificate-studio-template-picker",
        "target": "certificate.templates",
        "renderMode": "custom",
        "entrypoint": "templatePicker",
        "title": "Organization certificate templates"
      }
    ]
  }
}
```

Confirm the final scopes against the implemented APIs. Do not add `plugin.storage:*` if all domain data is in the Studio service. Do not request `course.metadata:write` if the narrow apply-template operation is sufficient.

### Step 6 — Build the plugin-owned service

Use public npm dependencies only. A small TypeScript HTTP framework and PostgreSQL client are sufficient. Do not import any core route, service, query, schema, error class, or environment module.

#### Initial database schema

The plugin migration should create at least:

```text
installations
  installation_id       text primary key
  organization_id       text not null
  status                text not null
  installed_at          timestamptz not null
  uninstall_requested_at timestamptz null
  purge_after            timestamptz null

certificate_templates
  id                     uuid primary key
  installation_id        text not null references installations
  name                   varchar(128) not null
  description            varchar(500) null
  design_version         integer not null
  design                 jsonb not null
  revision               integer not null default 1
  is_active              boolean not null default true
  created_by             text not null
  created_at             timestamptz not null
  updated_at             timestamptz not null

processed_webhook_events
  event_id               text primary key
  event_type             text not null
  processed_at           timestamptz not null
```

Every template query must include `installation_id`. Add a unique active-name constraint scoped to an installation if product behavior requires it. Validate design JSON before every write and after every read/migration.

Do not copy the donor `org_certificate_preset` migration into core.

#### Service routes

Implement:

- `GET /health`;
- `POST /v1/session/exchange`;
- `GET /v1/templates`;
- `POST /v1/templates`;
- `GET /v1/templates/:templateId`;
- `PUT /v1/templates/:templateId`;
- `DELETE /v1/templates/:templateId` as a soft delete;
- `POST /v1/templates/:templateId/clone`;
- `POST /v1/webhooks/classroomio`.

`POST /v1/session/exchange` accepts a one-time launch code, exchanges it server-to-server with ClassroomIO using the backend client secret, and returns a short-lived Studio bearer token. Keep that token in iframe memory only. The token must contain or reference verified installation, organization, user, role, scopes, and expiry.

All template writes require an admin claim. Reads also remain installation-scoped. Use generic not-found responses for cross-tenant IDs.

Add request size limits, rate limits, structured logs, health checks, and audit entries for create/update/clone/delete/apply-relevant actions. Never log launch codes, secrets, or bearer tokens.

### Step 7 — Wire lifecycle events correctly

The present event code does not yet emit the required lifecycle events from installation and organization workflows. Implement and test:

- automatic subscription registration from the validated manifest during installation;
- `plugin.installed` after a committed installation;
- `plugin.disabled` and `plugin.enabled` on status changes;
- `plugin.uninstalled` after uninstall;
- `organization.deleted` from the organization deletion workflow;
- signed delivery, retry, idempotency, and dead-letter behavior.

The Studio webhook must verify the raw-body signature and deduplicate by event ID before changing data.

On uninstall:

1. immediately reject new Studio sessions;
2. mark the service installation inactive;
3. retain templates for the manifest’s declared recovery period;
4. purge after the deadline with a tested scheduled job;
5. keep course certificate snapshots in core because they no longer depend on Studio.

Do not expose webhook secrets through an ordinary browser-facing admin response in the final production flow. Provision them to the backend securely.

### Step 8 — Port the Studio UI

Only after Steps 1–7 have stable contracts, port the donor UX into standalone components.

Recommended internal routes:

```text
list
editor/new
editor/:templateId
```

Use an in-memory or hash router. Do not use SvelteKit or `$app/*`.

Initialization flow:

1. establish the plugin bridge;
2. read host context and theme;
3. request a 60-second launch code for the declared Studio backend audience;
4. send it to `/v1/session/exchange`;
5. retain the returned Studio token in memory;
6. fetch organization profile through the bridge;
7. fetch templates from the Studio backend;
8. render the list or editor.

If the Studio token expires, request a fresh launch code through the bridge and retry once. Never persist either token in `localStorage`, `sessionStorage`, IndexedDB, a URL, or plugin storage.

Port the components by behavior rather than by import substitution:

- `certificate-templates-page.svelte` becomes the list/catalog view;
- `certificate-studio-builder.svelte` becomes the editor coordinator;
- `canvas-stage.svelte` and `canvas-element-zone.svelte` retain interaction behavior;
- `inspector-panel.svelte` is split into smaller tool panels where practical;
- `studio-header.svelte` uses plugin-owned controls and save state;
- donor translations become plugin-owned locale files;
- donor confirmation and preview dialogs become accessible plugin-owned dialogs;
- preview rendering comes only from `@classroomio/certificate-kit`.

Use semantic `--cio-*` tokens and `@classroomio/plugin-design`. Avoid copied dashboard Tailwind classes because they are not a stable public design contract. The UI must support light/dark themes, keyboard use, reduced motion, responsive widths, and RTL-safe layout.

Preserve explicit save behavior. Do not autosave each drag event. Track a saved snapshot, expose dirty state to the host if the bridge supports it, and update the snapshot only after a successful backend response.

### Step 9 — Build the course template picker

Mount `PluginSlotRenderer` at the existing core certificate editor’s template panel using:

```svelte
<PluginSlotRenderer
  target="certificate.templates"
  resource={{ type: 'course', id: courseId }}
/>
```

The compact picker must:

1. establish its own short-lived Studio session;
2. list active templates for the verified installation;
3. show lightweight previews;
4. call `client.certificateTemplates.apply(...)` when an authorized user chooses one;
5. display the normalized host response;
6. notify the core certificate editor to refresh through an explicit host callback/event rather than importing its store.

The picker must not receive `courseApi`, `certificateEditorStore`, `$currentOrg`, or an entire course object.

### Step 10 — Catalog, release, and install flow

Add a reproducible release pipeline that:

- validates the manifest against the production schema;
- builds both UI entrypoints;
- runs UI/service tests;
- scans dependencies and secrets;
- produces an SBOM and file inventory;
- hashes and signs immutable UI/service artifacts;
- registers the version in the catalog as ClassroomIO-published;
- deploys the service before activating the UI version;
- supports canary, rollback, version pinning, disable, revoke, and uninstall.

Official means prelisted, not preinstalled. An organization admin enables Certificate Studio from the Plugins catalog, reviews its permissions, and receives its navigation/page contributions only after installation is active and approved.

Do not introduce a source-tree scanner as the production catalog. Local manifest discovery may remain a development convenience; production installation must use registered immutable versions.

## Security tests that are mandatory

- another organization cannot list, fetch, update, clone, delete, or apply a template by guessing its ID;
- a non-admin cannot mutate templates;
- an iframe cannot apply a template to a course other than its host-bound resource;
- missing grants are rejected server-side;
- disabled, revoked, or uninstalled installations cannot launch or use existing sessions;
- a launch code is single-use, short-lived, audience-bound, target-bound, and plugin-bound;
- backend client rotation invalidates the old secret;
- malformed or oversized designs are rejected;
- undeclared network origins are absent from CSP;
- webhook signatures, timestamp tolerance, and idempotency are enforced;
- uninstall prevents new access immediately and purges plugin data after retention;
- existing core certificate snapshots still render with the plugin offline.

## UI acceptance tests

- empty, loading, error, and populated template-list states;
- create from blank and from every starter template;
- edit, clone, soft-delete, and deletion confirmation;
- all inspector tool categories;
- zero through three signatories;
- badge, QR, border, typography, background, and copy variants;
- drag, resize, center, reset, zoom, and fit behavior;
- preview matches the normalized saved design;
- dirty-state warning and discard behavior;
- expired-session recovery;
- light and dark theme;
- narrow viewport and large editor viewport;
- keyboard-only operation and visible focus;
- reduced motion and RTL layout;
- backend unavailable and plugin disabled states.

## Isolation checks

Run an automated check over `official-plugins/certificate-studio` that fails on:

- `@cio/`, `$lib/`, `$features/`, or `$app/` imports;
- imports from `apps/`, private `packages/`, or paths outside the plugin;
- `file:`, `link:`, or `portal:` dependencies;
- direct ClassroomIO database access;
- dashboard session-cookie assumptions;
- browser storage of launch codes, backend tokens, or client secrets.

The public `@classroomio/*` packages used during monorepo development may use `workspace:*`, but the release process must test the plugin against packed/published artifacts so undeclared source coupling cannot hide behind workspace resolution.

## Verification commands

Use Node 20 as required by the repository. At minimum run:

```bash
pnpm --filter @classroomio/certificate-kit build
pnpm --filter @classroomio/official-plugin-certificate-studio check
pnpm --filter @classroomio/official-plugin-certificate-studio test
pnpm --filter @classroomio/official-plugin-certificate-studio build
pnpm --filter @classroomio/certificate-studio-service test
pnpm --filter @classroomio/certificate-studio-service build
pnpm --filter @classroomio/plugin-sdk test
pnpm --filter @cio/utils test -- plugin-manifest.test.ts
pnpm --filter @cio/api test -- plugin
pnpm --filter @cio/db build
pnpm --filter @cio/api build
pnpm --filter @cio/dashboard^... build
pnpm --filter @cio/dashboard build
pnpm format:check
```

Also validate the built manifest entrypoints exist, serve with the expected CSP, and contain no remote scripts or source-map secrets.

## Suggested delivery slices

Do not ship this as one unreviewable change.

1. **Public certificate kit:** versioned design schema, normalization, preview renderer, and core adoption.
2. **Backend identity and bridge contracts:** hardened launch exchange, CSP, organization profile, apply-template command, and tests.
3. **Studio service:** independent database, migrations, sessions, CRUD, webhooks, retention, and tests.
4. **Studio management UI:** list/catalog/editor/preview with donor interaction parity.
5. **Course picker integration:** `certificate.templates` contribution and snapshot application.
6. **Release lifecycle:** catalog registration, deployment, lifecycle events, canary, rollback, uninstall, and operational documentation.

Each slice must leave the repository buildable. Do not delete or replace the current core certificate editor, renderer, issuance, or verification path while the plugin is incomplete.

## Definition of done

Certificate Studio is complete only when all of the following are true:

- it has its own valid manifest, version, UI artifacts, backend artifact, database migrations, and release record;
- UI and backend build without private ClassroomIO imports;
- all ClassroomIO operations use public, permission-gated contracts;
- backend sessions derive tenant/user/role solely from verified launch claims;
- template data lives outside the core schema;
- the full donor workflow is available through the sandboxed UI;
- a template can be selected from the course certificate editor and is stored as a validated core snapshot;
- core certificate rendering continues when Studio is unavailable or uninstalled;
- lifecycle, retention, audit, tenant-isolation, accessibility, and rollback tests pass;
- an organization admin can discover, review permissions, enable, use, disable, and uninstall the plugin through the normal plugin lifecycle;
- the Official designation changes catalog presentation only, not technical enforcement.

## Explicitly forbidden shortcuts

- Do not restore the deleted root `plugins/` directory.
- Do not copy the donor core migration or create `org_certificate_preset` in the core schema.
- Do not mount donor Svelte components directly in the dashboard.
- Do not import `@cio/certificates`, `@cio/ui`, dashboard stores, internal API clients, or SvelteKit modules from the plugin.
- Do not pass organization, course, certificate, or user records as arbitrary component props.
- Do not expose internal core APIs to the iframe.
- Do not use plugin storage as a substitute for the required relational backend.
- Do not put backend credentials or durable access tokens in the iframe.
- Do not make course rendering fetch a live template from the Studio service.
- Do not mark the port complete while catalog enablement, template application, uninstall behavior, or cross-tenant tests are still simulated.
