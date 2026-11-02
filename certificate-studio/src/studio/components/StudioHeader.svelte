<script lang="ts">
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import Eye from "@lucide/svelte/icons/eye";
  import Loader2 from "@lucide/svelte/icons/loader-2";
  import Save from "@lucide/svelte/icons/save";
  import Undo from "@lucide/svelte/icons/undo";
  import Redo from "@lucide/svelte/icons/redo";
  import { t } from "../../shared/i18n";

  interface Props {
    templateName: string;
    isSaving: boolean;
    hasUnsavedChanges: boolean;
    canUndo?: boolean;
    canRedo?: boolean;
    onUndo?: () => void;
    onRedo?: () => void;
    onBack: () => void;
    onPreview: () => void;
    onSave: () => void;
  }

  let {
    templateName = $bindable(),
    isSaving,
    hasUnsavedChanges,
    canUndo = false,
    canRedo = false,
    onUndo = () => {},
    onRedo = () => {},
    onBack,
    onPreview,
    onSave,
  }: Props = $props();
</script>

<header class="studio-header">
  <div class="header-left">
    <button
      type="button"
      class="back-btn"
      onclick={onBack}
      title={t("studio.back")}
    >
      <ArrowLeft size={16} />
      <span>{t("studio.back")}</span>
    </button>
    <span class="divider"></span>
    <div class="title-container">
      <label for="template-name">Template Name:</label>
      <input
        id="template-name"
        type="text"
        class="name-input"
        bind:value={templateName}
        placeholder={t("studio.templateNamePlaceholder")}
      />
    </div>
  </div>

  <div class="header-center">
    <button
      type="button"
      class="header-history-btn"
      title="Undo (⌘Z)"
      disabled={!canUndo}
      onclick={onUndo}
    >
      <Undo size={15} />
    </button>
    <button
      type="button"
      class="header-history-btn"
      title="Redo (⇧⌘Z)"
      disabled={!canRedo}
      onclick={onRedo}
    >
      <Redo size={15} />
    </button>
  </div>

  <div class="header-right">
    <button type="button" class="preview-btn" onclick={onPreview}>
      <Eye size={16} />
      <span>{t("studio.preview")}</span>
    </button>

    <button
      type="button"
      class="save-btn"
      disabled={isSaving || !templateName.trim() || !hasUnsavedChanges}
      onclick={onSave}
    >
      {#if isSaving}
        <span class="spinner"><Loader2 size={16} /></span>
        <span>{t("studio.saving")}</span>
      {:else}
        <Save size={15} />
        <span>{t("studio.save")}</span>
      {/if}
    </button>
  </div>
</header>

<style>
  .studio-header {
    min-height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 18px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    z-index: 50;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .back-btn {
    background: transparent;
    border: none;
    color: #475569;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 500;
  }

  .back-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  .divider {
    width: 1px;
    height: 18px;
    background: #e2e8f0;
  }

  .title-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-center {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 2px 4px;
  }

  .header-history-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .header-history-btn:hover:not(:disabled) {
    background: #ffffff;
    color: #0f172a;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .header-history-btn:disabled {
    color: #cbd5e1;
    cursor: not-allowed;
  }

  .title-container label {
    color: #64748b;
    font-size: 12px;
    font-weight: 600;
  }

  .name-input {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #0f172a;
    font-size: 12px;
    font-weight: 600;
    padding: 6px 10px;
    border-radius: 6px;
    outline: none;
    transition: all 0.15s ease;
    width: min(320px, 32vw);
  }

  .name-input:hover {
    border-color: #cbd5e1;
  }

  .name-input:focus {
    border-color: #f59e0b;
    background: #ffffff;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .preview-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    color: #0f172a;
    padding: 6px 12px;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .preview-btn:hover {
    background: #f8fafc;
  }

  .save-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #2563eb;
    border: none;
    color: #ffffff;
    padding: 6px 16px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .save-btn:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .save-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    animation: spin 1s linear infinite;
    display: flex;
    align-items: center;
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
