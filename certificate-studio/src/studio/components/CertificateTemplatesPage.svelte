<script lang="ts">
  import { onMount } from "svelte";
  import Award from "@lucide/svelte/icons/award";
  import Plus from "@lucide/svelte/icons/plus";
  import Pencil from "@lucide/svelte/icons/pencil";
  import Copy from "@lucide/svelte/icons/copy";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import Loader2 from "@lucide/svelte/icons/loader-2";
  import ArrowRight from "@lucide/svelte/icons/arrow-right";
  import X from "@lucide/svelte/icons/x";
  import Compass from "@lucide/svelte/icons/compass";
  import {
    STARTER_TEMPLATES,
    type StarterTemplateMeta,
    type CertificatePreviewData,
  } from "@classroomio/certificate-kit";
  import type { ClassroomIOClient } from "@classroomio/plugin-sdk";
  import type { OrganizationProfile, StudioTemplate } from "../../shared/types";
  import { StudioApiClient } from "../../shared/api";
  import { t } from "../../shared/i18n";
  import CertificateThumbnail from "./CertificateThumbnail.svelte";

  interface Props {
    client: ClassroomIOClient;
    api: StudioApiClient;
    profile: OrganizationProfile | null;
  }

  let { client, api, profile }: Props = $props();

  let templates = $state<StudioTemplate[]>([]);
  let isLoading = $state(true);
  let errorMessage = $state<string | null>(null);

  let isCatalogOpen = $state(false);
  let templateToDelete = $state<StudioTemplate | null>(null);
  let isDeleting = $state(false);
  let isCloningId = $state<string | null>(null);

  async function loadTemplates() {
    isLoading = true;
    errorMessage = null;
    try {
      templates = await api.listTemplates();
    } catch (err: unknown) {
      errorMessage =
        err instanceof Error ? err.message : "Failed to load templates";
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    void loadTemplates();
  });

  function getPreviewData(template: StudioTemplate): CertificatePreviewData {
    return {
      recipientName: "Jane Doe",
      courseName: "Sample Leadership Course",
      courseDescription:
        template.description ||
        "For demonstrating mastery of senior management frameworks and strategic excellence.",
      orgName: profile?.name || "ClassroomIO Academy",
      orgLogoUrl: profile?.avatarUrl ?? undefined,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      }),
      certificateId: "CIO-SAMPLE-001",
    };
  }

  function handleCreateBlank() {
    isCatalogOpen = false;
    window.location.hash = "#/editor/new";
  }

  function handleSelectStarter(starter: StarterTemplateMeta) {
    isCatalogOpen = false;
    window.location.hash = `#/editor/new?starter=${starter.id}`;
  }

  function handleEdit(template: StudioTemplate) {
    window.location.hash = `#/editor/${template.id}`;
  }

  async function handleClone(template: StudioTemplate) {
    isCloningId = template.id;
    try {
      const cloned = await api.cloneTemplate(template.id);
      templates = [cloned, ...templates];
      void client.ui.toast({
        message: `Cloned as "${cloned.name}"`,
        variant: "success",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to clone template";
      void client.ui.toast({ message: msg, variant: "error" });
    } finally {
      isCloningId = null;
    }
  }

  async function confirmDelete() {
    if (!templateToDelete) return;
    isDeleting = true;
    try {
      await api.deleteTemplate(templateToDelete.id);
      templates = templates.filter((t) => t.id !== templateToDelete?.id);
      void client.ui.toast({ message: "Template deleted", variant: "success" });
      templateToDelete = null;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete template";
      void client.ui.toast({ message: msg, variant: "error" });
    } finally {
      isDeleting = false;
    }
  }

  function getBadgeClass(style: string): string {
    const s = style.toLowerCase();
    if (s.includes("victorian")) return "tag-victorian";
    if (s.includes("deco")) return "tag-artdeco";
    if (s.includes("noir")) return "tag-noir";
    if (s.includes("minimal")) return "tag-minimal";
    return "tag-raw";
  }
</script>

<div class="page-container">
  <header class="page-header">
    <div class="header-text">
      <div class="title-with-badge">
        <Award size={24} class="header-icon" />
        <h1 class="page-title">{t("studio.title")}</h1>
      </div>
      <p class="page-subtitle">{t("studio.subtitle")}</p>
    </div>

    <div class="header-actions">
      <button
        type="button"
        class="browse-btn"
        onclick={() => (isCatalogOpen = true)}
      >
        <Compass size={16} />
        <span>Browse</span>
      </button>
      <button type="button" class="create-btn" onclick={handleCreateBlank}>
        <Plus size={16} />
        <span>Create</span>
      </button>
    </div>
  </header>

  <main class="page-body">
    {#if isLoading}
      <div class="state-container">
        <div class="spinner"><Loader2 size={28} /></div>
        <p class="state-text">Loading certificate templates...</p>
      </div>
    {:else if errorMessage}
      <div class="state-container error">
        <p class="error-text">{errorMessage}</p>
        <button type="button" class="retry-btn" onclick={loadTemplates}
          >Retry</button
        >
      </div>
    {:else if templates.length === 0}
      <div class="empty-state">
        <div class="empty-icon"><Award size={48} /></div>
        <h3 class="empty-title">{t("studio.noTemplates")}</h3>
        <p class="empty-desc">{t("studio.noTemplatesDesc")}</p>
        <div class="header-actions">
          <button
            type="button"
            class="browse-btn"
            onclick={() => (isCatalogOpen = true)}
          >
            <Compass size={16} />
            <span>Browse</span>
          </button>
          <button type="button" class="create-btn" onclick={handleCreateBlank}>
            <Plus size={16} />
            <span>Create</span>
          </button>
        </div>
      </div>
    {:else}
      <div class="templates-grid">
        {#each templates as template (template.id)}
          <div class="template-card">
            <div class="preview-thumbnail">
              <CertificateThumbnail
                design={template.design}
                data={getPreviewData(template)}
              />
            </div>

            <div class="card-details">
              <div class="card-header-row">
                <h3 class="template-name" title={template.name}>
                  {template.name}
                </h3>
                <span class="style-badge">{template.design.templateId}</span>
              </div>
              <p class="card-meta">
                Updated {new Date(template.updatedAt).toLocaleDateString()}
              </p>

              <div class="card-actions">
                <button
                  type="button"
                  class="action-btn primary"
                  onclick={() => handleEdit(template)}
                >
                  <Pencil size={13} />
                  <span>{t("studio.edit")}</span>
                </button>

                <button
                  type="button"
                  class="action-btn"
                  disabled={isCloningId === template.id}
                  onclick={() => handleClone(template)}
                  title={t("studio.clone")}
                >
                  {#if isCloningId === template.id}
                    <Loader2 size={13} class="spinner" />
                  {:else}
                    <Copy size={13} />
                  {/if}
                  <span>{t("studio.clone")}</span>
                </button>

                <button
                  type="button"
                  class="action-btn danger"
                  onclick={() => (templateToDelete = template)}
                  title={t("studio.delete")}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>

{#if isCatalogOpen}
  <div
    class="modal-backdrop"
    role="presentation"
    onclick={() => (isCatalogOpen = false)}
    onkeydown={(e) => {
      if (e.key === "Escape") isCatalogOpen = false;
    }}
  >
    <div
      class="modal-card wide"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      onclick={(event) => event.stopPropagation()}
      onkeydown={(event) => event.stopPropagation()}
    >
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Choose a starter design</h2>
          <p class="modal-subtitle">
            Select a curated certificate style to jump-start your design.
          </p>
        </div>
        <button
          type="button"
          class="close-btn"
          onclick={() => (isCatalogOpen = false)}
        >
          <X size={18} />
        </button>
      </div>

      <div class="starters-grid">
        <button
          type="button"
          class="starter-card blank"
          onclick={handleCreateBlank}
        >
          <div class="starter-blank-icon"><Plus size={26} /></div>
          <h4 class="starter-name">Start from blank</h4>
          <p class="starter-desc">
            Start with clean canvas and custom elements
          </p>
        </button>

        {#each STARTER_TEMPLATES as starter}
          <button
            type="button"
            class="starter-card"
            onclick={() => handleSelectStarter(starter)}
          >
            <div class="starter-tag {getBadgeClass(starter.style)}">
              {starter.style.toUpperCase()}
            </div>
            <h4 class="starter-name">{starter.name}</h4>
            <p class="starter-desc">{starter.description}</p>
            <div class="starter-footer">
              <span>Use template</span>
              <ArrowRight size={13} />
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

{#if templateToDelete}
  <div class="floating-delete-bar" role="alertdialog" aria-modal="true">
    <div class="delete-bar-info">
      <span class="delete-danger-badge"><Trash2 size={16} /></span>
      <div class="delete-bar-text">
        <strong class="delete-bar-title">Delete "{templateToDelete.name}"?</strong>
        <span class="delete-bar-sub">This template will be permanently removed.</span>
      </div>
    </div>
    <div class="delete-bar-actions">
      <button
        type="button"
        class="btn-cancel"
        disabled={isDeleting}
        onclick={() => (templateToDelete = null)}
      >
        Cancel
      </button>
      <button
        type="button"
        class="btn-delete"
        disabled={isDeleting}
        onclick={confirmDelete}
      >
        {#if isDeleting}
          <span class="spinner"><Loader2 size={13} /></span>
          <span>Deleting...</span>
        {:else}
          <span>Delete template</span>
        {/if}
      </button>
    </div>
  </div>
{/if}

<style>
  .page-container {
    min-height: 100vh;
    background: var(--cio-background, #f8fafc);
    color: var(--cio-foreground, #0f172a);
    font-family: inherit;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px 32px;
    border-bottom: 1px solid var(--cio-border, #e2e8f0);
    background: var(--cio-surface, #ffffff);
  }

  .title-with-badge {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  :global(.header-icon) {
    color: var(--cio-accent, #2563eb);
  }

  .page-title {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
    color: var(--cio-foreground, #0f172a);
  }

  .page-subtitle {
    margin: 4px 0 0 36px;
    font-size: 13px;
    color: var(--cio-foreground-muted, #64748b);
  }

  .create-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--cio-accent, #2563eb);
    color: #ffffff;
    border: none;
    padding: 9px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: opacity 0.15s ease;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .browse-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #ffffff;
    color: #334155;
    border: 1px solid #e2e8f0;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

  .browse-btn :global(svg) {
    color: #d97706;
  }

  .browse-btn:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .create-btn:hover {
    opacity: 0.92;
  }

  .page-body {
    padding: 32px;
    max-width: 1400px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .state-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    gap: 12px;
  }

  .state-text {
    color: var(--cio-foreground-muted, #64748b);
    font-size: 14px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
    background: var(--cio-surface, #ffffff);
    border: 1px dashed var(--cio-border, #cbd5e1);
    border-radius: 16px;
  }

  .empty-icon {
    color: var(--cio-foreground-muted, #94a3b8);
    margin-bottom: 16px;
  }

  .empty-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px;
    color: var(--cio-foreground, #0f172a);
  }

  .empty-desc {
    font-size: 13px;
    color: var(--cio-foreground-muted, #64748b);
    max-width: 440px;
    margin: 0 0 24px;
  }

  .templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }

  .template-card {
    background: var(--cio-surface, #ffffff);
    border: 1px solid var(--cio-border, #e2e8f0);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition:
      transform 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .template-card:hover {
    border-color: #cbd5e1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .preview-thumbnail {
    position: relative;
    width: 100%;
    aspect-ratio: 1100 / 780;
    overflow: hidden;
    border-bottom: 1px solid var(--cio-border, #e2e8f0);
  }

  .card-details {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .card-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .template-name {
    font-size: 14px;
    font-weight: 600;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--cio-foreground, #0f172a);
  }

  .style-badge {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    color: #475569;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .card-meta {
    font-size: 12px;
    color: var(--cio-foreground-muted, #64748b);
    margin: 0;
  }

  .card-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    color: #334155;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .action-btn:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .action-btn.primary {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1d4ed8;
  }

  .action-btn.primary:hover {
    background: #dbeafe;
    border-color: #93c5fd;
  }

  .action-btn.danger {
    padding: 6px 8px;
    color: #ef4444;
  }

  .action-btn.danger:hover {
    background: #fef2f2;
    border-color: #fecaca;
  }

  /* Modal */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    width: 100%;
    max-width: 520px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }

  .modal-card.wide {
    max-width: 820px;
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 24px;
    border-bottom: 1px solid #e2e8f0;
  }

  .modal-title {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
    color: #0f172a;
  }

  .modal-subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    color: #64748b;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    padding: 4px;
    border-radius: 6px;
    cursor: pointer;
  }

  .close-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  .starters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 16px;
    padding: 24px;
    max-height: 70vh;
    overflow-y: auto;
  }

  .starter-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 18px;
    text-align: left;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    transition: all 0.15s ease;
  }

  .starter-card:hover {
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
    transform: translateY(-2px);
  }

  .starter-card.blank {
    align-items: center;
    justify-content: center;
    text-align: center;
    border-style: dashed;
    background: #f8fafc;
  }

  .starter-card.blank:hover {
    border-style: solid;
    background: #ffffff;
  }

  .starter-blank-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #64748b;
    border-radius: 999px;
    background: #e2e8f0;
    margin-bottom: 6px;
  }

  .starter-tag {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
    letter-spacing: 0.04em;
    margin-bottom: 2px;
  }

  .tag-victorian {
    background: #fef3c7;
    color: #b45309;
  }

  .tag-artdeco {
    background: #ffedd5;
    color: #c2410c;
  }

  .tag-noir {
    background: #1e293b;
    color: #f8fafc;
  }

  .tag-minimal {
    background: #f1f5f9;
    color: #475569;
  }

  .tag-raw {
    background: #fee2e2;
    color: #b91c1c;
  }

  .starter-name {
    font-size: 14px;
    font-weight: 700;
    margin: 0;
    color: #0f172a;
  }

  .starter-desc {
    font-size: 12px;
    color: #64748b;
    margin: 0;
    line-height: 1.45;
    flex: 1;
  }

  .starter-footer {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #2563eb;
    margin-top: 8px;
  }

  .error-text {
    color: #ef4444;
    font-size: 14px;
  }

  .retry-btn {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #0f172a;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

  .modal-desc {
    padding: 0 24px;
    font-size: 14px;
    color: #64748b;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 24px;
    border-top: 1px solid #e2e8f0;
  }

  .btn-secondary {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    color: #334155;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-danger {
    background: #ef4444;
    border: none;
    color: #ffffff;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
  }


  .floating-delete-bar {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 24px;
    background: #0f172a;
    color: #ffffff;
    padding: 10px 18px;
    border-radius: 12px;
    box-shadow:
      0 20px 25px -5px rgba(15, 23, 42, 0.4),
      0 8px 10px -6px rgba(15, 23, 42, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.12);
    z-index: 500;
    animation: slideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    max-width: 90vw;
  }

  .delete-bar-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .delete-danger-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.25);
  }

  .delete-bar-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .delete-bar-title {
    font-size: 13px;
    font-weight: 600;
    color: #f8fafc;
  }

  .delete-bar-sub {
    font-size: 11px;
    color: #94a3b8;
  }

  .delete-bar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-cancel {
    background: #1e293b;
    border: 1px solid #334155;
    color: #cbd5e1;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-cancel:hover:not(:disabled) {
    background: #334155;
    color: #ffffff;
  }

  .btn-delete {
    background: #dc2626;
    border: none;
    color: #ffffff;
    padding: 7px 16px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s ease;
  }

  .btn-delete:hover:not(:disabled) {
    background: #b91c1c;
  }

  .btn-delete:disabled,
  .btn-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translate(-50%, 12px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }

  :global(.spinner) {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
