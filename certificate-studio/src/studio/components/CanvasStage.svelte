<script lang="ts">
  import { onDestroy } from "svelte";
  import ZoomIn from "@lucide/svelte/icons/zoom-in";
  import ZoomOut from "@lucide/svelte/icons/zoom-out";
  import Maximize2 from "@lucide/svelte/icons/maximize-2";
  import Layout from "@lucide/svelte/icons/layout";
  import Square from "@lucide/svelte/icons/square";
  import Type from "@lucide/svelte/icons/type";
  import Award from "@lucide/svelte/icons/award";
  import Hash from "@lucide/svelte/icons/hash";
  import PenTool from "@lucide/svelte/icons/pen-tool";
  import Palette from "@lucide/svelte/icons/palette";
  import {
    CERTIFICATE_HEIGHT,
    CERTIFICATE_WIDTH,
    renderCertificatePreviewDocument,
    type CertificatePreviewData,
    type CertificateDesignV1,
  } from "../../kit";
  import type { ToolCategory, StudioElementId } from "../../shared/types";
  import CanvasElementZone from "./CanvasElementZone.svelte";

  interface Props {
    design: CertificateDesignV1;
    previewData: CertificatePreviewData;
    zoom: number;
    selectedTool: ToolCategory;
    selectedElement?: StudioElementId | null;
    onSelectTool: (tool: ToolCategory) => void;
    onSelectElement?: (element: StudioElementId | null) => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFit: () => void;
  }

  let {
    design = $bindable(),
    previewData,
    zoom,
    selectedTool,
    selectedElement = null,
    onSelectTool,
    onSelectElement = () => {},
    onZoomIn,
    onZoomOut,
    onFit,
  }: Props = $props();

  let iframeElement = $state<HTMLIFrameElement | null>(null);
  let hoveredZone = $state<StudioElementId | null>(null);
  let measuredRects = $state<Partial<Record<StudioElementId, ElementRect>>>({});
  let interactionRect = $state<(ElementRect & { id: StudioElementId }) | null>(
    null,
  );
  let measurementVersion = 0;

  interface ElementRect {
    left: number;
    top: number;
    width: number;
    height: number;
  }

  const DEFAULT_RECTS: Record<StudioElementId, ElementRect> = {
    header: { left: 190, top: 76, width: 720, height: 24 },
    title: { left: 140, top: 108, width: 820, height: 44 },
    subtitle: { left: 160, top: 150, width: 780, height: 20 },
    recipient: { left: 160, top: 168, width: 780, height: 74 },
    course: { left: 160, top: 268, width: 780, height: 52 },
    description: { left: 210, top: 326, width: 680, height: 28 },
    date: { left: 350, top: 360, width: 400, height: 22 },
    badge: { left: 498, top: 636, width: 104, height: 104 },
    "signatory-0": { left: 110, top: 648, width: 220, height: 78 },
    "signatory-1": { left: 770, top: 648, width: 220, height: 78 },
    "signatory-2": { left: 440, top: 648, width: 220, height: 78 },
    signatories: { left: 110, top: 648, width: 880, height: 78 },
    qrCode: { left: 869, top: 676, width: 155, height: 41 },
    border: { left: 24, top: 24, width: 1052, height: 732 },
    background: { left: 0, top: 0, width: 1100, height: 780 },
  };

  const previewDoc = $derived(
    renderCertificatePreviewDocument(design, previewData),
  );

  function readElementRects(document: Document) {
    try {
      const certificate =
        document.querySelector("[data-certificate-root]") || document.body;
      if (!certificate) return;

      const certificateRect = certificate.getBoundingClientRect();
      const nextRects: Partial<Record<StudioElementId, ElementRect>> = {};
      document
        .querySelectorAll<HTMLElement>("[data-certificate-element]")
        .forEach((element) => {
          const id = element.dataset.certificateElement as
            | StudioElementId
            | undefined;
          if (!id) return;

          const rect = element.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;

          nextRects[id] = {
            left: Math.round(rect.left - certificateRect.left),
            top: Math.round(rect.top - certificateRect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        });
      if (Object.keys(nextRects).length > 0) {
        measuredRects = nextRects;
      }
    } catch {
      // ContentDocument restricted under sandbox; fallback to calibrated DEFAULT_RECTS
    }
  }

  $effect(() => {
    const _doc = previewDoc;
    void _doc;

    const rafId = requestAnimationFrame(() => {
      void measureElements();
    });
    const timerId1 = setTimeout(() => void measureElements(), 60);
    const timerId2 = setTimeout(() => void measureElements(), 250);

    const doc = iframeElement?.contentDocument;
    if (doc?.fonts?.ready) {
      doc.fonts.ready.then(() => void measureElements()).catch(() => {});
    }

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId1);
      clearTimeout(timerId2);
    };
  });

  async function measureElements() {
    const document = iframeElement?.contentDocument;
    if (!document) return;

    const currentMeasurement = ++measurementVersion;
    readElementRects(document);

    await document.fonts?.ready.catch(() => undefined);
    if (
      currentMeasurement !== measurementVersion ||
      document !== iframeElement?.contentDocument
    )
      return;

    readElementRects(document);
  }

  function getRect(id: StudioElementId): ElementRect {
    if (interactionRect?.id === id) {
      return interactionRect;
    }

    const custom = design.elements?.[id];
    if (
      custom?.positionMode === "custom" &&
      custom.x != null &&
      custom.y != null
    ) {
      return {
        left: custom.x,
        top: custom.y,
        width: custom.width ?? DEFAULT_RECTS[id]?.width ?? 120,
        height: custom.height ?? DEFAULT_RECTS[id]?.height ?? 40,
      };
    }
    return (
      measuredRects[id] ??
      DEFAULT_RECTS[id] ?? { left: 100, top: 100, width: 200, height: 50 }
    );
  }

  let draggingElement = $state<StudioElementId | null>(null);
  let resizingElement = $state<StudioElementId | null>(null);
  let resizeDirection = $state<
    "nw" | "ne" | "sw" | "se" | "top" | "bottom" | "left" | "right"
  >("se");
  let dragStartPointer = { x: 0, y: 0 };
  let dragStartRect = { left: 0, top: 0, width: 0, height: 0 };
  let snapGuideX = $state<number | null>(null);
  let snapGuideY = $state<number | null>(null);

  function previewElement(id: StudioElementId): HTMLElement | null {
    return (
      iframeElement?.contentDocument?.querySelector<HTMLElement>(
        `[data-certificate-element="${id}"]`,
      ) ?? null
    );
  }

  function renderInteractionRect(id: StudioElementId, rect: ElementRect) {
    interactionRect = { id, ...rect };

    const element = previewElement(id);
    if (!element) return;

    const deltaX = rect.left - dragStartRect.left;
    const deltaY = rect.top - dragStartRect.top;
    element.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;

    if (resizingElement) {
      element.style.width = `${rect.width}px`;
      element.style.height = `${rect.height}px`;
    }
  }

  function updateElementLayout(
    id: StudioElementId,
    layout: { x: number; y: number; width: number; height: number },
  ) {
    design.elements = {
      ...design.elements,
      [id]: {
        ...design.elements?.[id],
        enabled: true,
        positionMode: "custom",
        ...layout,
      },
    };
  }

  function handleStartDrag(e: PointerEvent, id: StudioElementId) {
    if (e.button !== 0 || draggingElement || resizingElement) return;

    e.preventDefault();
    draggingElement = id;
    onSelectElement(id);
    dragStartPointer = { x: e.clientX, y: e.clientY };
    dragStartRect = { ...getRect(id) };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
  }

  function handlePointerMove(e: PointerEvent) {
    if (resizingElement) {
      const deltaX = (e.clientX - dragStartPointer.x) / zoom;
      const deltaY = (e.clientY - dragStartPointer.y) / zoom;
      let left = dragStartRect.left;
      let top = dragStartRect.top;
      let width = dragStartRect.width;
      let height = dragStartRect.height;

      if (resizeDirection.includes("e") || resizeDirection === "right")
        width += deltaX;
      if (resizeDirection.includes("s") || resizeDirection === "bottom")
        height += deltaY;
      if (resizeDirection.includes("w") || resizeDirection === "left") {
        left += deltaX;
        width -= deltaX;
      }
      if (resizeDirection.includes("n") || resizeDirection === "top") {
        top += deltaY;
        height -= deltaY;
      }

      width = Math.max(
        48,
        Math.min(CERTIFICATE_WIDTH - left, Math.round(width)),
      );
      height = Math.max(
        24,
        Math.min(CERTIFICATE_HEIGHT - top, Math.round(height)),
      );
      left = Math.max(0, Math.round(left));
      top = Math.max(0, Math.round(top));

      renderInteractionRect(resizingElement, {
        left,
        top,
        width,
        height,
      });
      return;
    }

    if (!draggingElement) return;

    const dx = (e.clientX - dragStartPointer.x) / zoom;
    const dy = (e.clientY - dragStartPointer.y) / zoom;

    let newLeft = Math.max(
      0,
      Math.min(1100 - dragStartRect.width, Math.round(dragStartRect.left + dx)),
    );
    let newTop = Math.max(
      0,
      Math.min(780 - dragStartRect.height, Math.round(dragStartRect.top + dy)),
    );

    const centerX = newLeft + dragStartRect.width / 2;
    const centerY = newTop + dragStartRect.height / 2;
    const snapThreshold = 8;

    if (Math.abs(centerX - CERTIFICATE_WIDTH / 2) <= snapThreshold) {
      newLeft = Math.round((CERTIFICATE_WIDTH - dragStartRect.width) / 2);
      snapGuideX = CERTIFICATE_WIDTH / 2;
    } else {
      snapGuideX = null;
    }

    if (Math.abs(centerY - CERTIFICATE_HEIGHT / 2) <= snapThreshold) {
      newTop = Math.round((CERTIFICATE_HEIGHT - dragStartRect.height) / 2);
      snapGuideY = CERTIFICATE_HEIGHT / 2;
    } else {
      snapGuideY = null;
    }

    renderInteractionRect(draggingElement, {
      left: newLeft,
      top: newTop,
      width: dragStartRect.width,
      height: dragStartRect.height,
    });
  }

  function handlePointerUp() {
    const activeElement = draggingElement ?? resizingElement;
    const finalRect = interactionRect;

    draggingElement = null;
    resizingElement = null;
    interactionRect = null;
    snapGuideX = null;
    snapGuideY = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerCancel);

    if (activeElement && finalRect?.id === activeElement) {
      updateElementLayout(activeElement, {
        x: finalRect.left,
        y: finalRect.top,
        width: finalRect.width,
        height: finalRect.height,
      });
    }
  }

  function handlePointerCancel() {
    const activeElement = draggingElement ?? resizingElement;
    if (activeElement) {
      const element = previewElement(activeElement);
      if (element) {
        element.style.removeProperty("transform");
        element.style.removeProperty("width");
        element.style.removeProperty("height");
      }
    }

    draggingElement = null;
    resizingElement = null;
    interactionRect = null;
    snapGuideX = null;
    snapGuideY = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerCancel);
  }

  function handleStartResize(
    e: PointerEvent,
    id: StudioElementId,
    direction: typeof resizeDirection,
  ) {
    if (e.button !== 0 || draggingElement || resizingElement) return;

    e.preventDefault();
    onSelectElement(id);
    resizingElement = id;
    resizeDirection = direction;
    dragStartPointer = { x: e.clientX, y: e.clientY };
    dragStartRect = { ...getRect(id) };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
  }

  function handleCenterHorizontal(id: StudioElementId) {
    const rect = getRect(id);
    const newLeft = Math.round((1100 - rect.width) / 2);

    updateElementLayout(id, {
      x: newLeft,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
  }

  function handleCenterVertical(id: StudioElementId) {
    const rect = getRect(id);
    updateElementLayout(id, {
      x: rect.left,
      y: Math.round((CERTIFICATE_HEIGHT - rect.height) / 2),
      width: rect.width,
      height: rect.height,
    });
  }

  function handleResetAuto(id: StudioElementId) {
    if (!design.elements) return;
    const nextElements = { ...design.elements };
    delete nextElements[id];
    design.elements = nextElements;
  }

  function handleDelete(id: StudioElementId) {
    design.elements = {
      ...design.elements,
      [id]: { ...design.elements?.[id], enabled: false },
    };
    onSelectElement(null);
  }

  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    }
  });

  function getZoneDefinitions(): Array<{
    id: StudioElementId;
    label: string;
    tool: ToolCategory;
  }> {
    const areSignatoriesEnabled =
      design.elements?.signatories?.enabled !== false;

    const signatoryZones = areSignatoriesEnabled
      ? design.signatories
          .map((signatory, index) => ({ signatory, index }))
          .filter(
            ({ signatory, index }) =>
              signatory.enabled !== false &&
              design.elements?.[(`signatory-${index}` as StudioElementId)]?.enabled !== false,
          )
          .map(({ index }) => ({
            id: `signatory-${index}` as StudioElementId,
            label: `Signatory ${index + 1}`,
            tool: "signatories" as ToolCategory,
          }))
      : [];

    const zones: Array<{
      id: StudioElementId;
      label: string;
      tool: ToolCategory;
    }> = [
      { id: "border", label: "Border", tool: "borders" },
      { id: "header", label: "Organization Name", tool: "typography" },
      { id: "title", label: "Certificate Title", tool: "typography" },
      { id: "subtitle", label: "Presentation Line", tool: "typography" },
      { id: "recipient", label: "Recipient Name", tool: "typography" },
      { id: "course", label: "Course Title", tool: "layout" },
      { id: "description", label: "Course Description", tool: "layout" },
      { id: "date", label: "Conferment Date", tool: "typography" },
      { id: "badge", label: "Badge & Seal", tool: "badges" },
      ...signatoryZones,
      { id: "qrCode", label: "Credential Reference", tool: "qrcode" },
    ];

    return zones.filter(({ id }) => {
      if (id.startsWith("signatory-")) return areSignatoriesEnabled;
      return design.elements?.[id]?.enabled !== false;
    });
  }

  const tools = [
    { id: "layout", label: "Layout", icon: Layout },
    { id: "borders", label: "Borders", icon: Square },
    { id: "typography", label: "Typography", icon: Type },
    { id: "badges", label: "Badges", icon: Award },
    { id: "qrcode", label: "QR Code", icon: Hash },
    { id: "signatories", label: "Signatories", icon: PenTool },
    { id: "background", label: "Background", icon: Palette },
  ] as const;
</script>

<div class="stage-viewport">
  <div class="canvas-toolbar">
    <span
      ><strong>CANVAS</strong> (A4 Landscape: 1100 × 780)&nbsp;&nbsp; 297mm × 210mm</span
    >
    <div class="zoom-actions">
      <button
        type="button"
        class="zoom-btn"
        title="Zoom out"
        onclick={onZoomOut}><ZoomOut size={15} /></button
      >
      <span class="zoom-text">{Math.round(zoom * 100)}%</span>
      <button type="button" class="zoom-btn" title="Zoom in" onclick={onZoomIn}
        ><ZoomIn size={15} /></button
      >
      <button
        type="button"
        class="fit-btn"
        title="Fit to screen"
        onclick={onFit}><Maximize2 size={15} /> Fit</button
      >
    </div>
  </div>

  <div class="canvas-scroll">
    <div class="stage-canvas-wrapper" style="transform: scale({zoom});">
      <div class="certificate-canvas">
        <iframe
          bind:this={iframeElement}
          title="Certificate Preview"
          srcdoc={previewDoc}
          class="preview-iframe"
          onload={measureElements}
        ></iframe>

        <div class="overlay-surface">
          {#if snapGuideX != null}
            <div
              class="snap-guide snap-guide-x"
              style:left="{snapGuideX}px"
            ></div>
          {/if}
          {#if snapGuideY != null}
            <div
              class="snap-guide snap-guide-y"
              style:top="{snapGuideY}px"
            ></div>
          {/if}

          {#each getZoneDefinitions() as zone}
            {@const rect = getRect(zone.id)}
            <CanvasElementZone
              id={zone.id}
              label={zone.label}
              tool={zone.tool}
              selected={selectedElement === zone.id}
              hovered={hoveredZone === zone.id}
              positionMode={design.elements?.[zone.id]?.positionMode ?? "auto"}
              left={rect.left}
              top={rect.top}
              width={rect.width}
              height={rect.height}
              onSelect={(id, tool) => {
                onSelectElement(id);
                onSelectTool(tool);
              }}
              onHover={(id) => (hoveredZone = id)}
              onStartDrag={handleStartDrag}
              onStartResize={handleStartResize}
              onCenterHorizontal={handleCenterHorizontal}
              onCenterVertical={handleCenterVertical}
              onResetAuto={handleResetAuto}
              onDelete={handleDelete}
            />
          {/each}
        </div>
      </div>
    </div>
  </div>

  <nav class="tool-dock" aria-label="Certificate tools">
    {#each tools as tool}
      <button
        type="button"
        class:active={selectedTool === tool.id}
        title={tool.label}
        aria-label={tool.label}
        onclick={() => onSelectTool(tool.id)}
      >
        <tool.icon size={18} />
      </button>
    {/each}
  </nav>
</div>

<style>
  .stage-viewport {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;
    background-color: #f8fafc;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .canvas-toolbar {
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 18px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    color: #94a3b8;
    font-size: 10px;
    letter-spacing: 0.04em;
  }

  .canvas-toolbar strong {
    color: #64748b;
  }

  .zoom-actions {
    height: 100%;
    display: flex;
    align-items: center;
    border-left: 1px solid #e2e8f0;
  }

  .canvas-scroll {
    flex: 1;
    min-height: 0;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 38px;
    background-color: #f8fafc;
    background-image: radial-gradient(#dbe3ec 1px, transparent 1px);
    background-size: 18px 18px;
  }

  .zoom-btn {
    background: transparent;
    border: none;
    color: #64748b;
    padding: 0 12px;
    height: 100%;
    border-radius: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .zoom-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  .zoom-text {
    font-size: 12px;
    font-weight: 500;
    color: #475569;
    min-width: 44px;
    text-align: center;
  }

  .fit-btn {
    height: 100%;
    display: flex;
    align-items: center;
    gap: 6px;
    border: 0;
    border-left: 1px solid #e2e8f0;
    background: #fff;
    color: #475569;
    padding: 0 14px;
    font-size: 11px;
    cursor: pointer;
  }
  .fit-btn:hover {
    background: #f1f5f9;
  }

  .stage-canvas-wrapper {
    transform-origin: center center;
    transition: transform 0.1s ease-out;
  }

  .certificate-canvas {
    position: relative;
    width: 1100px;
    height: 780px;
    background: #ffffff;
    box-shadow:
      0 20px 25px -5px rgba(15, 23, 42, 0.16),
      0 8px 10px -6px rgba(15, 23, 42, 0.12);
    border-radius: 4px;
    overflow: hidden;
  }

  .preview-iframe {
    position: absolute;
    inset: 0;
    width: 1100px;
    height: 780px;
    border: none;
    pointer-events: none;
    background: #ffffff;
  }

  .overlay-surface {
    position: absolute;
    inset: 0;
    width: 1100px;
    height: 780px;
    pointer-events: none;
  }

  .snap-guide {
    position: absolute;
    z-index: 100;
    pointer-events: none;
    border-color: #f59e0b;
    border-style: dashed;
  }

  .snap-guide-x {
    top: 0;
    bottom: 0;
    border-left-width: 2px;
  }

  .snap-guide-y {
    left: 0;
    right: 0;
    border-top-width: 2px;
  }

  .tool-dock {
    position: absolute;
    bottom: 18px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 6px;
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
    z-index: 120;
  }
  .tool-dock button {
    width: 38px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: #64748b;
    cursor: pointer;
  }
  .tool-dock button:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
  .tool-dock button.active {
    background: #fef3c7;
    color: #b45309;
  }
</style>
