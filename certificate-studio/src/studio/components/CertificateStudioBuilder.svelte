<script lang="ts">
  import { onMount, untrack } from "svelte";
  import Loader2 from "@lucide/svelte/icons/loader-2";
  import X from "@lucide/svelte/icons/x";
  import {
    DEFAULT_CERTIFICATE_DESIGN_V1,
    STARTER_TEMPLATES,
    normalizeCertificateDesign,
    renderCertificatePreviewDocument,
    type CertificateDesignV1,
    type CertificatePreviewData,
  } from "@classroomio/certificate-kit";
  import type { ClassroomIOClient } from "@classroomio/plugin-sdk";
  import type {
    ToolCategory,
    StudioElementId,
    OrganizationProfile,
    StudioTemplate,
  } from "../../shared/types";
  import { StudioApiClient } from "../../shared/api";
  import { t } from "../../shared/i18n";
  import StudioHeader from "./StudioHeader.svelte";
  import CanvasStage from "./CanvasStage.svelte";
  import InspectorPanel from "./InspectorPanel.svelte";

  interface Props {
    templateId?: string | null;
    starterId?: string | null;
    client: ClassroomIOClient;
    api: StudioApiClient;
    profile: OrganizationProfile | null;
  }

  let {
    templateId = null,
    starterId = null,
    client,
    api,
    profile,
  }: Props = $props();

  let activeTemplate = $state<StudioTemplate | null>(null);
  let isLoading = $state(untrack(() => Boolean(templateId)));
  let isSaving = $state(false);
  let isPreviewModalOpen = $state(false);
  let showExitPrompt = $state(false);
  let previewScale = $state(1);

  let templateName = $state("Untitled Certificate");

  function createStudioDesign(source: unknown): CertificateDesignV1 {
    const normalizedDesign = normalizeCertificateDesign(source);
    const defaultSignatories = DEFAULT_CERTIFICATE_DESIGN_V1.signatories.map(
      (signatory) => ({ ...signatory }),
    );

    return {
      ...normalizedDesign,
      rendererTemplateId: "modular",
      signatories:
        normalizedDesign.signatories.length > 0
          ? normalizedDesign.signatories
          : defaultSignatories,
    };
  }

  let design = $state<CertificateDesignV1>(
    untrack(() => {
      if (starterId) {
        const match = STARTER_TEMPLATES.find((s) => s.id === starterId);
        if (match) return createStudioDesign(match.initialDesign);
      }
      return createStudioDesign(DEFAULT_CERTIFICATE_DESIGN_V1);
    }),
  );

  let savedSnapshot = $state("");
  let hasUnsavedChanges = $derived(
    Boolean(
      savedSnapshot &&
        JSON.stringify({ name: templateName, design }) !== savedSnapshot,
    ),
  );

  $effect(() => {
    void client.ui.setDirty(hasUnsavedChanges);
  });

  let zoom = $state(0.75);
  let selectedTool = $state<ToolCategory>("borders");
  let selectedElement = $state<StudioElementId | null>("border");

  function handleSelectElement(element: StudioElementId | null) {
    selectedElement = element;
    if (!element) return;

    if (["header", "title", "subtitle", "recipient", "date"].includes(element))
      selectedTool = "typography";
    else if (["course", "description"].includes(element))
      selectedTool = "layout";
    else if (element === "badge") selectedTool = "badges";
    else if (element.startsWith("signatory")) selectedTool = "signatories";
    else if (element === "qrCode") selectedTool = "qrcode";
    else if (element === "background") selectedTool = "background";
    else selectedTool = "borders";
  }

  function handleSelectTool(tool: ToolCategory) {
    selectedTool = tool;
    if (tool === "typography") selectedElement = "title";
    else if (tool === "layout") selectedElement = "course";
    else if (tool === "badges") selectedElement = "badge";
    else if (tool === "signatories") selectedElement = "signatories";
    else if (tool === "qrcode") selectedElement = "qrCode";
    else if (tool === "background") selectedElement = "background";
    else selectedElement = "border";
  }

  function calculateAutoFitZoom(): number {
    if (typeof window === "undefined") return 0.75;
    const availableWidth = window.innerWidth - 350 - 64;
    const availableHeight = window.innerHeight - 56 - 64;
    const scaleX = availableWidth / 1100;
    const scaleY = availableHeight / 780;
    return Math.max(0.4, Math.min(1.2, Math.min(scaleX, scaleY) * 0.95));
  }

  function observePreviewViewport(node: HTMLElement) {
    function updateScale() {
      const styles = window.getComputedStyle(node);
      const horizontalPadding =
        Number.parseFloat(styles.paddingLeft) +
        Number.parseFloat(styles.paddingRight);
      const verticalPadding =
        Number.parseFloat(styles.paddingTop) +
        Number.parseFloat(styles.paddingBottom);
      const widthScale = (node.clientWidth - horizontalPadding) / 1100;
      const heightScale = (node.clientHeight - verticalPadding) / 780;
      previewScale = Math.min(widthScale, heightScale, 1);
    }

    const observer = new ResizeObserver(updateScale);
    observer.observe(node);
    updateScale();

    return {
      destroy() {
        observer.disconnect();
      },
    };
  }

  onMount(async () => {
    zoom = calculateAutoFitZoom();

    if (templateId) {
      try {
        activeTemplate = await api.getTemplate(templateId);
        templateName = activeTemplate.name;
        design = createStudioDesign(activeTemplate.design);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to load template";
        void client.ui.toast({ message: msg, variant: "error" });
      } finally {
        isLoading = false;
      }
    } else if (starterId) {
      const match = STARTER_TEMPLATES.find((s) => s.id === starterId);
      if (match) {
        templateName = `${match.name} Template`;
      }
    }

    savedSnapshot = JSON.stringify({ name: templateName, design });
  });

  const previewData: CertificatePreviewData = $derived({
    recipientName: "Jane Doe",
    courseName: "Executive Leadership & Strategy",
    courseDescription:
      design.descriptionOverride ||
      "For demonstrating mastery of senior management frameworks and strategic excellence.",
    orgName: profile?.name || "ClassroomIO Academy",
    orgLogoUrl: profile?.avatarUrl ?? undefined,
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    }),
    certificateId: "CIO-SAMPLE-001",
  });

  async function handleSave() {
    if (!templateName.trim()) return;
    isSaving = true;

    try {
      if (activeTemplate) {
        const cleanDesign = JSON.parse(JSON.stringify(design));
        const updated = await api.updateTemplate(activeTemplate.id, {
          name: templateName.trim(),
          design: cleanDesign,
        });
        activeTemplate = updated;
      } else {
        const cleanDesign = JSON.parse(JSON.stringify(design));
        const created = await api.createTemplate({
          name: templateName.trim(),
          designVersion: 1,
          design: cleanDesign,
        });
        activeTemplate = created;
        window.location.hash = `#/editor/${created.id}`;
      }

      savedSnapshot = JSON.stringify({ name: templateName, design });
      void client.ui.toast({ message: t("studio.saved"), variant: "success" });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save template";
      void client.ui.toast({ message: msg, variant: "error" });
    } finally {
      isSaving = false;
    }
  }

  function handleDiscard() {
    if (savedSnapshot) {
      try {
        const snapshot = JSON.parse(savedSnapshot);
        templateName = snapshot.name;
        design = createStudioDesign(snapshot.design);
      } catch {
        // Fallback
      }
    }
  }

  function handleBack() {
    if (hasUnsavedChanges) {
      showExitPrompt = true;
      return;
    }
    window.location.hash = "#/";
  }

  function handleCancelUnsaved() {
    handleDiscard();
    showExitPrompt = false;
  }

  async function handleSaveUnsaved() {
    await handleSave();
    showExitPrompt = false;
  }
</script>

<div class="builder-container">
  {#if isLoading}
    <div class="loading-state">
      <Loader2 size={32} class="spinner" />
      <p>Loading certificate design...</p>
    </div>
  {:else}
    <StudioHeader
      bind:templateName
      {isSaving}
      {hasUnsavedChanges}
      onBack={handleBack}
      onPreview={() => (isPreviewModalOpen = true)}
      onSave={handleSave}
    />

    <div class="workspace-body">
      <CanvasStage
        bind:design
        {previewData}
        {zoom}
        {selectedTool}
        {selectedElement}
        onSelectTool={handleSelectTool}
        onSelectElement={handleSelectElement}
        onZoomIn={() =>
          (zoom = Math.min(1.5, Math.round((zoom + 0.1) * 100) / 100))}
        onZoomOut={() =>
          (zoom = Math.max(0.3, Math.round((zoom - 0.1) * 100) / 100))}
        onFit={() => (zoom = calculateAutoFitZoom())}
      />

      <InspectorPanel
        bind:design
        {selectedTool}
        {selectedElement}
        {profile}
        onSelectElement={handleSelectElement}
      />
    </div>
  {/if}
</div>


{#if showExitPrompt && hasUnsavedChanges}
  <div class="floating-save-bar">
    <div class="save-bar-info">
      <span class="warning-badge">!</span>
      <span class="warning-text">Careful — you have unsaved changes</span>
    </div>
    <div class="save-bar-actions">
      <button
        type="button"
        class="btn-cancel"
        disabled={isSaving}
        onclick={handleCancelUnsaved}
      >
        Cancel
      </button>
      <button
        type="button"
        class="btn-save"
        disabled={isSaving || !templateName.trim()}
        onclick={handleSaveUnsaved}
      >
        {#if isSaving}
          <span class="spinner"><Loader2 size={13} /></span>
          <span>Saving...</span>
        {:else}
          <span>Save</span>
        {/if}
      </button>
    </div>
  </div>
{/if}

{#if isPreviewModalOpen}
  <div
    class="preview-backdrop"
    role="presentation"
    onclick={() => (isPreviewModalOpen = false)}
    onkeydown={(e) => {
      if (e.key === "Escape") isPreviewModalOpen = false;
    }}
  >
    <div
      class="preview-modal"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      onclick={(event) => event.stopPropagation()}
      onkeydown={(event) => event.stopPropagation()}
    >
      <div class="preview-header">
        <h3 class="preview-title">{templateName} - Preview</h3>
        <button
          type="button"
          class="close-btn"
          onclick={() => (isPreviewModalOpen = false)}
        >
          <X size={20} />
        </button>
      </div>

      <div class="preview-content" use:observePreviewViewport>
        <div
          class="preview-certificate-wrapper"
          style:transform="scale({previewScale})"
        >
          <iframe
            title="Certificate full preview"
            srcdoc={renderCertificatePreviewDocument(design, previewData)}
            sandbox="allow-same-origin"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .builder-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background: #f8fafc;
    color: #0f172a;
  }

  .loading-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: #64748b;
  }

  .workspace-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }


  .floating-save-bar {
    position: fixed;
    bottom: 70px;
    left: calc(50vw - 175px);
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 18px;
    background: #0f172a;
    color: #ffffff;
    padding: 8px 14px 8px 18px;
    border-radius: 10px;
    box-shadow:
      0 10px 25px -5px rgba(15, 23, 42, 0.4),
      0 8px 10px -6px rgba(15, 23, 42, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 150;
    animation: floatBarIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .save-bar-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .warning-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 9999px;
    background: #f59e0b;
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
  }

  .warning-text {
    font-size: 13px;
    font-weight: 500;
    color: #f8fafc;
    white-space: nowrap;
  }

  .save-bar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-cancel {
    background: #1e293b;
    border: 1px solid #334155;
    color: #cbd5e1;
    padding: 6px 14px;
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

  .btn-save {
    background: #2563eb;
    border: none;
    color: #ffffff;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s ease;
  }

  .btn-save:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .btn-save:disabled,
  .btn-cancel:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @keyframes floatBarIn {
    from {
      opacity: 0;
      transform: translate(-50%, 10px);
    }
    to {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  }

  .preview-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.62);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    z-index: 300;
  }

  .preview-modal {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    width: min(960px, 92vw);
    height: min(760px, 88vh);
    max-height: 88vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  }

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
  }

  .preview-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
  }

  .close-btn {
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
  }

  .preview-content {
    min-height: 0;
    flex: 1;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    overflow: hidden;
  }

  .preview-certificate-wrapper {
    width: 1100px;
    height: 780px;
    background: #ffffff;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    border-radius: 4px;
    overflow: hidden;
    flex: 0 0 auto;
    transform-origin: center;
  }

  .preview-certificate-wrapper iframe {
    width: 100%;
    height: 100%;
    border: 0;
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
