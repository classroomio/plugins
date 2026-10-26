<script lang="ts">
  import { onMount } from "svelte";
  import {
    renderCertificatePreviewDocument,
    normalizeCertificateDesign,
    type CertificateDesignV1,
    type CertificatePreviewData,
  } from "../../kit";

  interface Props {
    design: CertificateDesignV1;
    data: CertificatePreviewData;
  }

  let { design, data }: Props = $props();

  let containerEl = $state<HTMLDivElement | null>(null);
  let scale = $state(0.3);

  const safeDesign = $derived(normalizeCertificateDesign(design));
  const docHtml = $derived(renderCertificatePreviewDocument(safeDesign, data));

  function updateScale() {
    if (!containerEl) return;
    const width = containerEl.clientWidth;
    if (width > 0) {
      scale = width / 1100;
    }
  }

  onMount(() => {
    updateScale();
    const ro = new ResizeObserver(() => updateScale());
    if (containerEl) ro.observe(containerEl);
    return () => ro.disconnect();
  });
</script>

<div bind:this={containerEl} class="thumbnail-stage">
  <div class="thumbnail-scaler" style="transform: scale({scale});">
    <iframe
      title="Certificate Thumbnail"
      srcdoc={docHtml}
      class="thumbnail-frame"
    ></iframe>
  </div>
</div>

<style>
  .thumbnail-stage {
    position: relative;
    width: 100%;
    aspect-ratio: 1100 / 780;
    overflow: hidden;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .thumbnail-scaler {
    position: absolute;
    width: 1100px;
    height: 780px;
    transform-origin: center center;
    pointer-events: none;
  }

  .thumbnail-frame {
    width: 1100px;
    height: 780px;
    border: none;
    background: #ffffff;
    pointer-events: none;
  }
</style>
