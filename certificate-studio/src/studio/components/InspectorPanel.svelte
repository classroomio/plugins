<script lang="ts">
  import {
    PALETTE_SWATCHES,
    FONT_OPTIONS,
    type CertificateDesignV1,
    type CertificateShapeObject,
  } from "../../kit";
  import Layout from "@lucide/svelte/icons/layout";
  import Square from "@lucide/svelte/icons/square";
  import Type from "@lucide/svelte/icons/type";
  import Award from "@lucide/svelte/icons/award";
  import QrCodeIcon from "@lucide/svelte/icons/qr-code";
  import PenTool from "@lucide/svelte/icons/pen-tool";
  import Palette from "@lucide/svelte/icons/palette";
  import Plus from "@lucide/svelte/icons/plus";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import Shapes from "@lucide/svelte/icons/shapes";
  import Circle from "@lucide/svelte/icons/circle";
  import Minus from "@lucide/svelte/icons/minus";
  import Frame from "@lucide/svelte/icons/frame";
  import Lock from "@lucide/svelte/icons/lock";
  import Unlock from "@lucide/svelte/icons/unlock";
  import Copy from "@lucide/svelte/icons/copy";
  import RotateCw from "@lucide/svelte/icons/rotate-cw";
  import ArrowUp from "@lucide/svelte/icons/arrow-up";
  import ArrowDown from "@lucide/svelte/icons/arrow-down";
  import ChevronsUp from "@lucide/svelte/icons/chevrons-up";
  import ChevronsDown from "@lucide/svelte/icons/chevrons-down";
  import type {
    OrganizationProfile,
    StudioElementId,
    ToolCategory,
  } from "../../shared/types";

  interface Props {
    design: CertificateDesignV1;
    selectedTool: ToolCategory;
    selectedElement: StudioElementId | null;
    onSelectElement: (element: StudioElementId | null) => void;
    profile?: OrganizationProfile | null;
  }

  let {
    design = $bindable(),
    selectedTool,
    selectedElement,
    onSelectElement,
    profile = null,
  }: Props = $props();

  const toolTabs: Array<{
    id: ToolCategory;
    label: string;
    icon: typeof Layout;
  }> = [
    { id: "borders", label: "Borders", icon: Square },
    { id: "typography", label: "Typography", icon: Type },
    { id: "layout", label: "Copy & Layout", icon: Layout },
    { id: "shapes", label: "Shapes", icon: Shapes },
    { id: "badges", label: "Badges", icon: Award },
    { id: "qrcode", label: "QR Code", icon: QrCodeIcon },
    { id: "signatories", label: "Signatories", icon: PenTool },
    { id: "background", label: "Background", icon: Palette },
  ];

  const selectedShape = $derived(
    design.shapes?.find((s) => s.id === selectedElement) ?? null,
  );

  function updateSelectedShape(
    updater: (shape: CertificateShapeObject) => CertificateShapeObject,
  ) {
    if (!selectedElement) return;
    design.shapes = (design.shapes ?? []).map((s) => {
      if (s.id !== selectedElement) return s;
      return updater(s);
    });
  }

  function updateShapeFrame(
    field: "x" | "y" | "width" | "height" | "rotation",
    val: number,
  ) {
    updateSelectedShape((s) => ({
      ...s,
      frame: {
        ...s.frame,
        [field]: val,
      },
    }));
  }

  function centerShapeHorizontal() {
    if (!selectedShape) return;
    updateShapeFrame("x", Math.round((1100 - selectedShape.frame.width) / 2));
  }

  function centerShapeVertical() {
    if (!selectedShape) return;
    updateShapeFrame("y", Math.round((780 - selectedShape.frame.height) / 2));
  }

  function rotateShapeBy(degrees: number) {
    if (!selectedShape) return;
    let next = (selectedShape.frame.rotation + degrees) % 360;
    if (next > 180) next -= 360;
    if (next <= -180) next += 360;
    updateShapeFrame("rotation", next);
  }

  function bringShapeToFront() {
    if (!selectedElement) return;
    const maxZ = Math.max(
      ...(design.shapes ?? []).map((s) => s.zIndex ?? 0),
      0,
    );
    updateSelectedShape((s) => ({ ...s, zIndex: maxZ + 1 }));
  }

  function sendShapeToBack() {
    if (!selectedElement) return;
    const minZ = Math.min(
      ...(design.shapes ?? []).map((s) => s.zIndex ?? 0),
      0,
    );
    updateSelectedShape((s) => ({ ...s, zIndex: Math.max(0, minZ - 1) }));
  }

  function bringShapeForward() {
    updateSelectedShape((s) => ({ ...s, zIndex: (s.zIndex ?? 0) + 1 }));
  }

  function sendShapeBackward() {
    updateSelectedShape((s) => ({
      ...s,
      zIndex: Math.max(0, (s.zIndex ?? 0) - 1),
    }));
  }

  function toggleShapeLock() {
    updateSelectedShape((s) => ({ ...s, locked: !s.locked }));
  }

  function duplicateSelectedShape() {
    if (!selectedShape) return;
    const dup: CertificateShapeObject = {
      ...JSON.parse(JSON.stringify(selectedShape)),
      id: `shape-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      frame: {
        ...selectedShape.frame,
        x: Math.min(1100 - selectedShape.frame.width, selectedShape.frame.x + 20),
        y: Math.min(780 - selectedShape.frame.height, selectedShape.frame.y + 20),
      },
      zIndex: (design.shapes?.length ?? 0) + 1,
    };
    design.shapes = [...(design.shapes ?? []), dup];
    onSelectElement(dup.id);
  }

  function deleteSelectedShape() {
    if (!selectedElement) return;
    design.shapes = (design.shapes ?? []).filter((s) => s.id !== selectedElement);
    onSelectElement(null);
  }

  function addShape(shapeType: "rectangle" | "ellipse" | "line" | "frame") {
    const newShape: CertificateShapeObject = {
      id: `shape-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      objectType: "shape",
      shape: shapeType,
      frame: {
        x: shapeType === "line" ? 250 : 380,
        y: shapeType === "line" ? 390 : 280,
        width: shapeType === "line" ? 600 : shapeType === "ellipse" ? 180 : 260,
        height: shapeType === "line" ? 4 : shapeType === "ellipse" ? 180 : 160,
        rotation: 0,
      },
      fill:
        shapeType === "line" || shapeType === "frame"
          ? { type: "none" }
          : { type: "solid", color: "#e2e8f0" },
      stroke:
        shapeType === "line"
          ? { color: "#0f172a", width: 2, style: "solid" }
          : shapeType === "frame"
            ? { color: "#2563eb", width: 3, style: "solid" }
            : null,
      borderRadius: shapeType === "rectangle" ? 12 : 0,
      opacity: 1,
      locked: false,
      zIndex: (design.shapes?.length ?? 0) + 5,
    };
    design.shapes = [...(design.shapes ?? []), newShape];
    onSelectElement(newShape.id);
  }

  const REQUIRED_ELEMENT_IDS: ReadonlySet<StudioElementId> = new Set([
    "recipient",
    "course",
    "background",
  ]);

  const elementLayers: Array<{ id: StudioElementId; label: string }> = [
    { id: "header", label: "Organization Name" },
    { id: "title", label: "Certificate Title" },
    { id: "subtitle", label: "Presentation Line" },
    { id: "recipient", label: "Recipient Name" },
    { id: "course", label: "Course Title" },
    { id: "description", label: "Course Description" },
    { id: "date", label: "Conferment Date" },
    { id: "badge", label: "Badge & Seal" },
    { id: "signatories", label: "Signatures" },
    { id: "qrCode", label: "Credential Reference" },
    { id: "border", label: "Border" },
    { id: "background", label: "Background" },
  ];

  const activeToolLabel = $derived(
    toolTabs.find((tool) => tool.id === selectedTool)?.label ?? selectedTool,
  );

  const defaultLayouts: Partial<
    Record<
      StudioElementId,
      { x: number; y: number; width: number; height: number }
    >
  > = {
    header: { x: 160, y: 76, width: 780, height: 30 },
    title: { x: 140, y: 112, width: 820, height: 52 },
    subtitle: { x: 160, y: 170, width: 780, height: 24 },
    recipient: { x: 160, y: 210, width: 780, height: 78 },
    course: { x: 180, y: 312, width: 740, height: 55 },
    description: { x: 210, y: 382, width: 680, height: 60 },
    date: { x: 330, y: 492, width: 440, height: 24 },
    badge: { x: 498, y: 636, width: 104, height: 104 },
    signatories: { x: 110, y: 648, width: 880, height: 78 },
    "signatory-0": { x: 110, y: 648, width: 220, height: 78 },
    "signatory-1": { x: 770, y: 648, width: 220, height: 78 },
    "signatory-2": { x: 440, y: 648, width: 220, height: 78 },
    qrCode: { x: 840, y: 652, width: 184, height: 48 },
  };

  function selectedLayoutValue(field: "x" | "y" | "width" | "height"): number {
    if (!selectedElement) return 0;

    return (
      design.elements?.[selectedElement]?.[field] ??
      defaultLayouts[selectedElement]?.[field] ??
      0
    );
  }

  function updateSelectedLayout(
    field: "x" | "y" | "width" | "height",
    value: number,
  ) {
    if (!selectedElement) return;
    const fallback = defaultLayouts[selectedElement] ?? {
      x: 0,
      y: 0,
      width: 120,
      height: 40,
    };
    design.elements = {
      ...design.elements,
      [selectedElement]: {
        ...fallback,
        ...design.elements?.[selectedElement],
        enabled: true,
        positionMode: "custom",
        [field]: value,
      },
    };
  }

  function centerSelectedElement() {
    if (!selectedElement) return;
    const width = selectedLayoutValue("width");
    updateSelectedLayout("x", Math.round((1100 - width) / 2));
  }

  function centerSelectedElementVertically() {
    if (!selectedElement) return;
    const height = selectedLayoutValue("height");
    updateSelectedLayout("y", Math.round((780 - height) / 2));
  }

  function resetSelectedElement() {
    if (!selectedElement || !design.elements) return;

    const nextElements = { ...design.elements };
    delete nextElements[selectedElement];
    design.elements = nextElements;
  }

  function addSignatory() {
    if (!design.signatories) design.signatories = [];
    if (design.signatories.length >= 3) return;
    const nextIndex = design.signatories.length;
    design.signatories = [
      ...design.signatories,
      {
        id: `sig-${crypto.randomUUID()}`,
        name: "",
        role: "",
        enabled: true,
      },
    ];
    design.elements = {
      ...design.elements,
      signatories: { ...design.elements?.signatories, enabled: true },
    };
    onSelectElement(`signatory-${nextIndex}` as StudioElementId);
  }

  function removeSignatory(index: number) {
    if (!design.signatories) return;
    design.signatories = design.signatories.filter(
      (_, itemIndex) => itemIndex !== index,
    );
    const nextElements = { ...design.elements };
    for (
      let itemIndex = index;
      itemIndex < design.signatories.length;
      itemIndex += 1
    ) {
      const sourceId = `signatory-${itemIndex + 1}`;
      const targetId = `signatory-${itemIndex}`;
      if (nextElements[sourceId])
        nextElements[targetId] = nextElements[sourceId];
      else delete nextElements[targetId];
    }
    delete nextElements[`signatory-${design.signatories.length}`];
    design.elements = nextElements;
    onSelectElement(
      design.signatories.length
        ? (`signatory-${Math.max(0, index - 1)}` as StudioElementId)
        : null,
    );
  }

  function toggleElement(id: StudioElementId) {
    if (REQUIRED_ELEMENT_IDS.has(id)) return;

    const isEnabled = design.elements?.[id]?.enabled !== false;
    design.elements = {
      ...design.elements,
      [id]: { ...design.elements?.[id], enabled: !isEnabled },
    };
    if (id === "signatories") {
      if (isEnabled && selectedElement?.startsWith("signatory-")) {
        onSelectElement(null);
      } else if (!isEnabled) {
        onSelectElement("signatory-0");
      }
      return;
    }
    if (id === "qrCode") {
      design.qrCode = {
        enabled: !isEnabled,
        position: design.qrCode?.position ?? "bottom_right",
      };
    }
    if (!isEnabled) onSelectElement(id);
    else if (selectedElement === id) onSelectElement(null);
  }

  const backgroundSwatches = [
    { label: "Parchment", primary: "#FAF8F2", secondary: "#F3EDE0" },
    { label: "White", primary: "#FFFFFF", secondary: "#F5F5F7" },
    { label: "Cream", primary: "#FFFDF5", secondary: "#F7F1DF" },
    { label: "Antique", primary: "#F5F2EB", secondary: "#EAE3D6" },
    { label: "Pearl", primary: "#F7F5F0", secondary: "#EDE7DC" },
    { label: "Noir", primary: "#111215", secondary: "#1E2026" },
    { label: "Midnight", primary: "#0B132B", secondary: "#1C2541" },
    { label: "Forest", primary: "#0D2818", secondary: "#19442B" },
  ];
</script>

<aside class="inspector-panel">
  <header class="inspector-header">
    <strong>INSPECTOR / PROPERTIES</strong>
    <span>{activeToolLabel}</span>
  </header>

  <section class="layers-section">
    <div class="layers-heading">
      <strong>ELEMENTS & LAYERS</strong>
      <button type="button" onclick={() => onSelectElement(null)}
        >Deselect</button
      >
    </div>
    <div class="layer-list">
      {#each elementLayers as layer}
        {@const isRequired = REQUIRED_ELEMENT_IDS.has(layer.id)}
        <button
          type="button"
          class:active={selectedElement === layer.id ||
            (layer.id === "signatories" &&
              selectedElement?.startsWith("signatory-"))}
          class:hidden={!isRequired && design.elements?.[layer.id]?.enabled === false}
          onclick={() => {
            if (!isRequired && design.elements?.[layer.id]?.enabled === false) {
              toggleElement(layer.id);
              return;
            }
            onSelectElement(
              layer.id === "signatories" ? "signatory-0" : layer.id,
            );
          }}
        >
          {layer.label}
          {#if !isRequired}
            <span
              class="toggle-dot"
              class:is-hidden={design.elements?.[layer.id]?.enabled === false}
              role="button"
              tabindex="0"
              aria-label="Toggle {layer.label}"
              onclick={(event) => {
                event.stopPropagation();
                toggleElement(layer.id);
              }}
              onkeydown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  event.stopPropagation();
                  toggleElement(layer.id);
                }
              }}
            ></span>
          {/if}
        </button>
      {/each}

      {#if (design.shapes?.length ?? 0) > 0}
        <div class="layer-subheading">Shapes</div>
        {#each (design.shapes ?? []) as shape}
          <button
            type="button"
            class="shape-layer-item"
            class:active={selectedElement === shape.id}
            onclick={() => onSelectElement(shape.id)}
          >
            <span class="shape-layer-label">
              <Shapes size={12} />
              {shape.shape.charAt(0).toUpperCase() + shape.shape.slice(1)}
            </span>
            <span class="shape-layer-meta">
              {#if shape.locked}
                <span class="locked-icon"><Lock size={11} /></span>
              {/if}
              <small>z:{shape.zIndex}</small>
            </span>
          </button>
        {/each}
      {/if}
    </div>
  </section>

  <div class="panel-content">
    {#if selectedShape}
      <section class="shape-inspector-card">
        <div class="shape-inspector-header">
          <div class="shape-title-badge">
            {#if selectedShape.shape === 'rectangle'}
              <Square size={14} />
            {:else if selectedShape.shape === 'ellipse'}
              <Circle size={14} />
            {:else if selectedShape.shape === 'line'}
              <Minus size={14} />
            {:else}
              <Frame size={14} />
            {/if}
            <strong>{selectedShape.shape.charAt(0).toUpperCase() + selectedShape.shape.slice(1)}</strong>
          </div>
          <div class="shape-header-actions">
            <button
              type="button"
              class="icon-action-btn"
              title={selectedShape.locked ? "Unlock shape" : "Lock shape"}
              onclick={toggleShapeLock}
            >
              {#if selectedShape.locked}
                <span class="locked-icon"><Lock size={13} /></span>
              {:else}
                <Unlock size={13} />
              {/if}
            </button>
            <button
              type="button"
              class="icon-action-btn"
              title="Duplicate shape"
              onclick={duplicateSelectedShape}
            >
              <Copy size={13} />
            </button>
            <button
              type="button"
              class="icon-action-btn danger"
              title="Delete shape"
              onclick={deleteSelectedShape}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <!-- Frame / Position & Dimensions -->
        <div class="tool-section">
          <h4 class="section-title">Dimensions & Transform</h4>
          <div class="position-grid">
            <label>
              <span>X (px)</span>
              <input
                type="number"
                disabled={selectedShape.locked}
                value={selectedShape.frame.x}
                oninput={(e) => updateShapeFrame('x', Number((e.target as HTMLInputElement).value))}
              />
            </label>
            <label>
              <span>Y (px)</span>
              <input
                type="number"
                disabled={selectedShape.locked}
                value={selectedShape.frame.y}
                oninput={(e) => updateShapeFrame('y', Number((e.target as HTMLInputElement).value))}
              />
            </label>
            <label>
              <span>Width (px)</span>
              <input
                type="number"
                min="1"
                disabled={selectedShape.locked}
                value={selectedShape.frame.width}
                oninput={(e) => updateShapeFrame('width', Math.max(1, Number((e.target as HTMLInputElement).value)))}
              />
            </label>
            <label>
              <span>Height (px)</span>
              <input
                type="number"
                min="1"
                disabled={selectedShape.locked}
                value={selectedShape.frame.height}
                oninput={(e) => updateShapeFrame('height', Math.max(1, Number((e.target as HTMLInputElement).value)))}
              />
            </label>
          </div>

          <div class="field-group mt-2">
            <div class="flex-between">
              <label class="field-label" for="shape-rotation">Rotation</label>
              <span class="field-val-hint">{selectedShape.frame.rotation}°</span>
            </div>
            <div class="slider-row">
              <input
                id="shape-rotation"
                type="range"
                min="-180"
                max="180"
                disabled={selectedShape.locked}
                value={selectedShape.frame.rotation}
                oninput={(e) => updateShapeFrame('rotation', Number((e.target as HTMLInputElement).value))}
              />
              <button
                type="button"
                class="small-btn"
                title="Rotate 90 degrees"
                disabled={selectedShape.locked}
                onclick={() => rotateShapeBy(90)}
              >
                <RotateCw size={12} /> +90°
              </button>
            </div>
          </div>

          {#if !selectedShape.locked}
            <div class="position-actions">
              <button type="button" onclick={centerShapeHorizontal}>Center Horizontally</button>
              <button type="button" onclick={centerShapeVertical}>Center Vertically</button>
            </div>
          {/if}
        </div>

        <!-- Fill section -->
        {#if selectedShape.shape !== 'line'}
          <div class="tool-section">
            <h4 class="section-title">Fill</h4>
            <div class="type-selector">
              <button
                type="button"
                class:active={selectedShape.fill.type === 'none'}
                disabled={selectedShape.locked}
                onclick={() => updateSelectedShape((s) => ({ ...s, fill: { type: 'none' } }))}
              >
                None
              </button>
              <button
                type="button"
                class:active={selectedShape.fill.type === 'solid'}
                disabled={selectedShape.locked}
                onclick={() => updateSelectedShape((s) => ({ ...s, fill: { type: 'solid', color: '#2563eb' } }))}
              >
                Solid
              </button>
              <button
                type="button"
                class:active={selectedShape.fill.type === 'linear-gradient'}
                disabled={selectedShape.locked}
                onclick={() =>
                  updateSelectedShape((s) => ({
                    ...s,
                    fill: {
                      type: 'linear-gradient',
                      angle: 90,
                      stops: [
                        { offset: 0, color: '#3b82f6' },
                        { offset: 1, color: '#1d4ed8' },
                      ],
                    },
                  }))}
              >
                Gradient
              </button>
            </div>

            {#if selectedShape.fill.type === 'solid'}
              <div class="field-group mt-2">
                <span class="field-label">Fill Color</span>
                <div class="color-field">
                  <input
                    type="color"
                    class="color-picker"
                    disabled={selectedShape.locked}
                    value={selectedShape.fill.color}
                    oninput={(e) => {
                      const color = (e.target as HTMLInputElement).value;
                      updateSelectedShape((s) => ({ ...s, fill: { type: 'solid', color } }));
                    }}
                  />
                  <input
                    class="field-input color-value"
                    disabled={selectedShape.locked}
                    value={selectedShape.fill.color}
                    oninput={(e) => {
                      const color = (e.target as HTMLInputElement).value;
                      if (/^#[0-9a-fA-F]{3,8}$/.test(color)) {
                        updateSelectedShape((s) => ({ ...s, fill: { type: 'solid', color } }));
                      }
                    }}
                  />
                </div>
                <div class="swatches-grid">
                  {#each PALETTE_SWATCHES.slice(0, 10) as color}
                    <button
                      type="button"
                      class="swatch-btn"
                      style="background-color: {color};"
                      disabled={selectedShape.locked}
                      onclick={() => updateSelectedShape((s) => ({ ...s, fill: { type: 'solid', color } }))}
                      aria-label="Set fill {color}"
                    ></button>
                  {/each}
                </div>
              </div>
            {:else if selectedShape.fill.type === 'linear-gradient'}
              <div class="field-group mt-2">
                <div class="flex-between">
                  <label class="field-label" for="grad-angle">Gradient Angle</label>
                  <span class="field-val-hint">{selectedShape.fill.angle ?? 90}°</span>
                </div>
                <input
                  id="grad-angle"
                  type="range"
                  min="0"
                  max="360"
                  disabled={selectedShape.locked}
                  value={selectedShape.fill.angle ?? 90}
                  oninput={(e) => {
                    const angle = Number((e.target as HTMLInputElement).value);
                    updateSelectedShape((s) => {
                      if (s.fill.type !== 'linear-gradient') return s;
                      return { ...s, fill: { ...s.fill, angle } };
                    });
                  }}
                />
              </div>

              <div class="stops-grid">
                <div class="stop-col">
                  <span class="stop-label">Start Color (0%)</span>
                  <div class="color-field">
                    <input
                      type="color"
                      class="color-picker"
                      disabled={selectedShape.locked}
                      value={selectedShape.fill.stops[0]?.color ?? '#3b82f6'}
                      oninput={(e) => {
                        const color = (e.target as HTMLInputElement).value;
                        updateSelectedShape((s) => {
                          if (s.fill.type !== 'linear-gradient') return s;
                          const nextStops = [...s.fill.stops];
                          nextStops[0] = { offset: 0, color };
                          return { ...s, fill: { ...s.fill, stops: nextStops } };
                        });
                      }}
                    />
                    <input
                      class="field-input color-value"
                      disabled={selectedShape.locked}
                      value={selectedShape.fill.stops[0]?.color ?? '#3b82f6'}
                      oninput={(e) => {
                        const color = (e.target as HTMLInputElement).value;
                        if (/^#[0-9a-fA-F]{3,8}$/.test(color)) {
                          updateSelectedShape((s) => {
                            if (s.fill.type !== 'linear-gradient') return s;
                            const nextStops = [...s.fill.stops];
                            nextStops[0] = { offset: 0, color };
                            return { ...s, fill: { ...s.fill, stops: nextStops } };
                          });
                        }
                      }}
                    />
                  </div>
                </div>

                <div class="stop-col">
                  <span class="stop-label">End Color (100%)</span>
                  <div class="color-field">
                    <input
                      type="color"
                      class="color-picker"
                      disabled={selectedShape.locked}
                      value={selectedShape.fill.stops[1]?.color ?? '#1d4ed8'}
                      oninput={(e) => {
                        const color = (e.target as HTMLInputElement).value;
                        updateSelectedShape((s) => {
                          if (s.fill.type !== 'linear-gradient') return s;
                          const nextStops = [...s.fill.stops];
                          nextStops[1] = { offset: 1, color };
                          return { ...s, fill: { ...s.fill, stops: nextStops } };
                        });
                      }}
                    />
                    <input
                      class="field-input color-value"
                      disabled={selectedShape.locked}
                      value={selectedShape.fill.stops[1]?.color ?? '#1d4ed8'}
                      oninput={(e) => {
                        const color = (e.target as HTMLInputElement).value;
                        if (/^#[0-9a-fA-F]{3,8}$/.test(color)) {
                          updateSelectedShape((s) => {
                            if (s.fill.type !== 'linear-gradient') return s;
                            const nextStops = [...s.fill.stops];
                            nextStops[1] = { offset: 1, color };
                            return { ...s, fill: { ...s.fill, stops: nextStops } };
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Stroke section -->
        <div class="tool-section">
          <h4 class="section-title">Stroke</h4>
          <div class="type-selector">
            <button
              type="button"
              class:active={!selectedShape.stroke}
              disabled={selectedShape.locked}
              onclick={() => updateSelectedShape((s) => ({ ...s, stroke: null }))}
            >
              None
            </button>
            <button
              type="button"
              class:active={selectedShape.stroke?.style === 'solid'}
              disabled={selectedShape.locked}
              onclick={() =>
                updateSelectedShape((s) => ({
                  ...s,
                  stroke: { color: s.stroke?.color ?? '#0f172a', width: s.stroke?.width || 2, style: 'solid' },
                }))}
            >
              Solid
            </button>
            <button
              type="button"
              class:active={selectedShape.stroke?.style === 'dashed'}
              disabled={selectedShape.locked}
              onclick={() =>
                updateSelectedShape((s) => ({
                  ...s,
                  stroke: { color: s.stroke?.color ?? '#0f172a', width: s.stroke?.width || 2, style: 'dashed' },
                }))}
            >
              Dashed
            </button>
          </div>

          {#if selectedShape.stroke}
            <div class="field-group mt-2">
              <div class="flex-between">
                <label class="field-label" for="stroke-width">Stroke Width</label>
                <span class="field-val-hint">{selectedShape.stroke.width}px</span>
              </div>
              <input
                id="stroke-width"
                type="range"
                min="1"
                max="24"
                disabled={selectedShape.locked}
                value={selectedShape.stroke.width}
                oninput={(e) => {
                  const width = Number((e.target as HTMLInputElement).value);
                  updateSelectedShape((s) => {
                    if (!s.stroke) return s;
                    return { ...s, stroke: { ...s.stroke, width } };
                  });
                }}
              />
            </div>

            <div class="field-group">
              <span class="field-label">Stroke Color</span>
              <div class="color-field">
                <input
                  type="color"
                  class="color-picker"
                  disabled={selectedShape.locked}
                  value={selectedShape.stroke.color}
                  oninput={(e) => {
                    const color = (e.target as HTMLInputElement).value;
                    updateSelectedShape((s) => {
                      if (!s.stroke) return s;
                      return { ...s, stroke: { ...s.stroke, color } };
                    });
                  }}
                />
                <input
                  class="field-input color-value"
                  disabled={selectedShape.locked}
                  value={selectedShape.stroke.color}
                  oninput={(e) => {
                    const color = (e.target as HTMLInputElement).value;
                    if (/^#[0-9a-fA-F]{3,8}$/.test(color)) {
                      updateSelectedShape((s) => {
                        if (!s.stroke) return s;
                        return { ...s, stroke: { ...s.stroke, color } };
                      });
                    }
                  }}
                />
              </div>
            </div>
          {/if}
        </div>

        <!-- Corner Radius (Rectangle and Frame) -->
        {#if selectedShape.shape === 'rectangle' || selectedShape.shape === 'frame'}
          <div class="tool-section">
            <h4 class="section-title">Corner Radius</h4>
            <div class="flex-between">
              <label class="field-label" for="corner-radius">Border Radius</label>
              <span class="field-val-hint">{selectedShape.borderRadius}px</span>
            </div>
            <input
              id="corner-radius"
              type="range"
              min="0"
              max="100"
              disabled={selectedShape.locked}
              value={selectedShape.borderRadius}
              oninput={(e) => {
                const borderRadius = Number((e.target as HTMLInputElement).value);
                updateSelectedShape((s) => ({ ...s, borderRadius }));
              }}
            />
          </div>
        {/if}

        <!-- Opacity -->
        <div class="tool-section">
          <h4 class="section-title">Opacity</h4>
          <div class="flex-between">
            <label class="field-label" for="shape-opacity">Layer Opacity</label>
            <span class="field-val-hint">{Math.round(selectedShape.opacity * 100)}%</span>
          </div>
          <input
            id="shape-opacity"
            type="range"
            min="0"
            max="100"
            disabled={selectedShape.locked}
            value={Math.round(selectedShape.opacity * 100)}
            oninput={(e) => {
              const opacity = Number((e.target as HTMLInputElement).value) / 100;
              updateSelectedShape((s) => ({ ...s, opacity }));
            }}
          />
        </div>

        <!-- Layer Ordering (Z-Index) -->
        <div class="tool-section">
          <h4 class="section-title">Layer Order (Z-Index)</h4>
          <div class="layer-order-grid">
            <button
              type="button"
              class="z-order-btn"
              title="Bring to Front"
              onclick={bringShapeToFront}
            >
              <ChevronsUp size={14} />
              <span>Front</span>
            </button>
            <button
              type="button"
              class="z-order-btn"
              title="Bring Forward"
              onclick={bringShapeForward}
            >
              <ArrowUp size={14} />
              <span>Forward</span>
            </button>
            <button
              type="button"
              class="z-order-btn"
              title="Send Backward"
              onclick={sendShapeBackward}
            >
              <ArrowDown size={14} />
              <span>Backward</span>
            </button>
            <button
              type="button"
              class="z-order-btn"
              title="Send to Back"
              onclick={sendShapeToBack}
            >
              <ChevronsDown size={14} />
              <span>Back</span>
            </button>
          </div>
          <div class="flex-between mt-2">
            <span class="field-label">Current Z-Index:</span>
            <input
              type="number"
              class="z-number-input"
              value={selectedShape.zIndex}
              oninput={(e) => {
                const zIndex = Number((e.target as HTMLInputElement).value);
                updateSelectedShape((s) => ({ ...s, zIndex }));
              }}
            />
          </div>
        </div>
      </section>
    {:else if selectedElement && defaultLayouts[selectedElement]}
      <section class="selection-card">
        <div class="selection-title">
          <strong
            >{elementLayers.find((layer) => layer.id === selectedElement)
              ?.label ?? selectedElement}</strong
          >
          <span
            >{design.elements?.[selectedElement]?.positionMode === "custom"
              ? "Custom (X, Y)"
              : "Auto"}</span
          >
        </div>
        <div class="position-grid">
          {#each ["x", "y", "width", "height"] as field}
            <label>
              <span
                >{field === "x"
                  ? "X Position (px)"
                  : field === "y"
                    ? "Y Position (px)"
                    : `${field[0].toUpperCase()}${field.slice(1)} (px)`}</span
              >
              <input
                type="number"
                value={selectedLayoutValue(
                  field as "x" | "y" | "width" | "height",
                )}
                oninput={(event) =>
                  updateSelectedLayout(
                    field as "x" | "y" | "width" | "height",
                    Number((event.target as HTMLInputElement).value),
                  )}
              />
            </label>
          {/each}
        </div>
        <div class="position-actions">
          <button type="button" onclick={centerSelectedElement}
            >Center Horizontally</button
          >
          <button type="button" onclick={centerSelectedElementVertically}
            >Center Vertically</button
          >
          <button type="button" onclick={resetSelectedElement}
            >Reset Position</button
          >
        </div>
      </section>
    {/if}

    {#if selectedTool === "borders"}
      <div class="tool-section">
        <h4 class="section-title">Border Style</h4>
        <div class="field-group">
          <label class="field-label" for="border-style">Style</label>
          <select
            id="border-style"
            class="field-select"
            value={design.border?.style ?? "victorian"}
            onchange={(e) => {
              if (!design.border)
                design.border = { style: "victorian", width: 12 };
              design.border.style = (e.target as HTMLSelectElement)
                .value as any;
            }}
          >
            <option value="victorian">Victorian Classic</option>
            <option value="double_gold">Double Gold Rules</option>
            <option value="geometric">Geometric Art Deco</option>
            <option value="minimal">Minimal Hairline</option>
          </select>
        </div>

        <div class="field-group">
          <label class="field-label" for="border-width"
            >Width ({design.border?.width ?? 12}px)</label
          >
          <input
            id="border-width"
            type="range"
            min="2"
            max="32"
            value={design.border?.width ?? 12}
            class="field-slider"
            oninput={(e) => {
              if (!design.border)
                design.border = { style: "victorian", width: 12 };
              design.border.width = Number(
                (e.target as HTMLInputElement).value,
              );
            }}
          />
        </div>

        <div class="field-group">
          <span class="field-label">Border Accent Color</span>
          <div class="swatches-grid">
            {#each PALETTE_SWATCHES as color}
              <button
                type="button"
                class="swatch-btn"
                title={color}
                aria-label="Color {color}"
                class:is-active={(design.border?.primaryColor ??
                  design.accentColor) === color}
                style="background-color: {color};"
                onclick={() => {
                  if (!design.border)
                    design.border = { style: "victorian", width: 12 };
                  design.border.primaryColor = color;
                  design.accentColor = color;
                }}
              ></button>
            {/each}
          </div>
          <div class="color-field">
            <input
              type="color"
              class="color-picker"
              aria-label="Custom border color"
              value={design.border?.primaryColor ?? design.accentColor}
              oninput={(event) => {
                if (!design.border)
                  design.border = { style: "victorian", width: 12 };
                const nextColor = (event.target as HTMLInputElement).value;
                design.border.primaryColor = nextColor;
                design.accentColor = nextColor;
              }}
            />
            <input
              class="field-input color-value"
              value={design.border?.primaryColor ?? design.accentColor}
              oninput={(event) => {
                if (!design.border)
                  design.border = { style: "victorian", width: 12 };
                design.border.primaryColor = (
                  event.target as HTMLInputElement
                ).value;
              }}
            />
          </div>
        </div>
      </div>
    {:else if selectedTool === "typography"}
      <div class="tool-section">
        <h4 class="section-title">Typography</h4>

        <div class="field-group">
          <label class="field-label" for="font-title">Title Font</label>
          <select
            id="font-title"
            class="field-select"
            value={design.typography?.titleFont ?? "Bodoni Moda"}
            onchange={(e) => {
              if (!design.typography) design.typography = {};
              design.typography.titleFont = (
                e.target as HTMLSelectElement
              ).value;
            }}
          >
            {#each FONT_OPTIONS as font}
              <option value={font.value}>{font.label}</option>
            {/each}
          </select>
        </div>

        <div class="field-group">
          <label class="field-label" for="font-recipient">Recipient Font</label>
          <select
            id="font-recipient"
            class="field-select"
            value={design.typography?.recipientFont ?? "Great Vibes"}
            onchange={(e) => {
              if (!design.typography) design.typography = {};
              design.typography.recipientFont = (
                e.target as HTMLSelectElement
              ).value;
            }}
          >
            {#each FONT_OPTIONS as font}
              <option value={font.value}>{font.label}</option>
            {/each}
          </select>
        </div>

        <div class="field-group">
          <label class="field-label" for="font-body">Body Font</label>
          <select
            id="font-body"
            class="field-select"
            value={design.typography?.bodyFont ?? "Cormorant Garamond"}
            onchange={(e) => {
              if (!design.typography) design.typography = {};
              design.typography.bodyFont = (
                e.target as HTMLSelectElement
              ).value;
            }}
          >
            {#each FONT_OPTIONS as font}
              <option value={font.value}>{font.label}</option>
            {/each}
          </select>
        </div>

        <div class="field-group">
          <label class="field-label" for="font-color">Font Color</label>
          <div class="color-field">
            <input
              id="font-color"
              type="color"
              class="color-picker"
              value={design.typography?.primaryColor ?? "#1a1a2e"}
              oninput={(event) => {
                if (!design.typography) design.typography = {};
                design.typography.primaryColor = (
                  event.target as HTMLInputElement
                ).value;
              }}
            />
            <input
              class="field-input color-value"
              value={design.typography?.primaryColor ?? "#1a1a2e"}
              oninput={(event) => {
                if (!design.typography) design.typography = {};
                design.typography.primaryColor = (
                  event.target as HTMLInputElement
                ).value;
              }}
            />
          </div>
        </div>
      </div>
    {:else if selectedTool === "layout"}
      <div class="tool-section">
        <h4 class="section-title">Copy & Wording</h4>

        <div class="field-group">
          <label class="field-label" for="copy-title">Certificate Title</label>
          <input
            id="copy-title"
            type="text"
            class="field-input"
            value={design.title}
            oninput={(e) =>
              (design.title = (e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="field-group">
          <label class="field-label" for="copy-subtitle"
            >Presentation Subtitle</label
          >
          <input
            id="copy-subtitle"
            type="text"
            class="field-input"
            value={design.subtitle}
            oninput={(e) =>
              (design.subtitle = (e.target as HTMLInputElement).value)}
          />
        </div>

        <div class="field-group">
          <label class="field-label" for="copy-desc">Default Description</label>
          <textarea
            id="copy-desc"
            class="field-textarea"
            rows="3"
            value={design.descriptionOverride ?? ""}
            oninput={(e) =>
              (design.descriptionOverride = (
                e.target as HTMLTextAreaElement
              ).value)}
          ></textarea>
        </div>

        <div class="field-group">
          <label class="field-label" for="copy-org"
            >Organization Name Override</label
          >
          <input
            id="copy-org"
            type="text"
            class="field-input"
            value={design.copy?.organizationName ?? ""}
            placeholder="Use organization name"
            oninput={(event) => {
              if (!design.copy) design.copy = {};
              design.copy.organizationName = (
                event.target as HTMLInputElement
              ).value;
            }}
          />
        </div>

        <div class="field-group">
          <label class="field-label" for="copy-completion"
            >Completion Label</label
          >
          <input
            id="copy-completion"
            type="text"
            class="field-input"
            value={design.copy?.completion ?? ""}
            placeholder="For successful completion of"
            oninput={(event) => {
              if (!design.copy) design.copy = {};
              design.copy.completion = (event.target as HTMLInputElement).value;
            }}
          />
        </div>

        <div class="field-group">
          <label class="field-label" for="copy-date">Date Label</label>
          <input
            id="copy-date"
            type="text"
            class="field-input"
            value={design.copy?.dateLabel ?? ""}
            placeholder="Date of Conferment:"
            oninput={(event) => {
              if (!design.copy) design.copy = {};
              design.copy.dateLabel = (event.target as HTMLInputElement).value;
            }}
          />
        </div>
      </div>
    {:else if selectedTool === "badges"}
      <div class="tool-section">
        <h4 class="section-title">Badge & Seal</h4>

        <div class="field-group">
          <label class="field-label" for="badge-style">Badge Style</label>
          <select
            id="badge-style"
            class="field-select"
            value={design.badge?.style ?? "gold_seal"}
            onchange={(e) => {
              if (!design.badge) design.badge = { style: "gold_seal" };
              design.badge.style = (e.target as HTMLSelectElement).value as any;
            }}
          >
            <option value="gold_seal">Gold Embossed Seal</option>
            <option value="org_logo">Organization Logo</option>
            <option value="ribbon">Achievement Ribbon</option>
            <option value="crest">Heraldic Crest</option>
            <option value="wax_stamp">Wax Stamp</option>
            <option value="custom">Custom Image</option>
            <option value="none">No Badge</option>
          </select>
        </div>

        {#if design.badge?.style !== "none"}
          <div class="field-group">
            <label class="field-label" for="badge-label"
              >Badge Ribbon Text</label
            >
            <input
              id="badge-label"
              type="text"
              class="field-input"
              value={design.badge?.label ?? ""}
              oninput={(e) => {
                if (!design.badge) design.badge = { style: "gold_seal" };
                design.badge.label = (e.target as HTMLInputElement).value;
              }}
            />
          </div>

          {#if design.badge?.style === "org_logo"}
            <div class="organization-logo-card">
              {#if profile?.avatarUrl}
                <img src={profile.avatarUrl} alt={profile.name} />
              {:else}
                <span>{profile?.name?.charAt(0).toUpperCase() ?? "O"}</span>
              {/if}
              <div>
                <strong>{profile?.name ?? "Organization logo"}</strong>
                <small
                  >{profile?.avatarUrl
                    ? "Logo available"
                    : "No organization logo uploaded"}</small
                >
              </div>
            </div>
          {/if}

          {#if design.badge?.style === "org_logo" || design.badge?.style === "custom"}
            <div class="field-group">
              <label class="field-label" for="badge-image"
                >Custom Seal URL</label
              >
              <input
                id="badge-image"
                type="url"
                class="field-input"
                value={design.badge?.customImageUrl ?? ""}
                placeholder="https://example.com/logo.png"
                oninput={(event) => {
                  if (!design.badge) design.badge = { style: "custom" };
                  design.badge.customImageUrl = (
                    event.target as HTMLInputElement
                  ).value;
                }}
              />
            </div>
          {/if}

          <div class="field-group">
            <label class="field-label" for="foil-color">Foil Color</label>
            <div class="color-field">
              <input
                id="foil-color"
                type="color"
                class="color-picker"
                value={design.badge?.foilColor ?? design.accentColor}
                oninput={(event) => {
                  if (!design.badge) design.badge = { style: "gold_seal" };
                  design.badge.foilColor = (
                    event.target as HTMLInputElement
                  ).value;
                }}
              />
              <input
                class="field-input color-value"
                value={design.badge?.foilColor ?? design.accentColor}
                oninput={(event) => {
                  if (!design.badge) design.badge = { style: "gold_seal" };
                  design.badge.foilColor = (
                    event.target as HTMLInputElement
                  ).value;
                }}
              />
            </div>
          </div>
        {/if}
      </div>
    {:else if selectedTool === "qrcode"}
      <div class="tool-section">
        <h4 class="section-title">QR Code Verification</h4>

        <div class="field-toggle">
          <label class="toggle-label" for="qr-toggle">
            <input
              id="qr-toggle"
              type="checkbox"
              checked={design.qrCode?.enabled ?? true}
              onchange={(e) => {
                if (!design.qrCode)
                  design.qrCode = { enabled: true, position: "bottom_right" };
                const isEnabled = (e.target as HTMLInputElement).checked;
                design.qrCode.enabled = isEnabled;
                design.elements = {
                  ...design.elements,
                  qrCode: { ...design.elements?.qrCode, enabled: isEnabled },
                };
              }}
            />
            <span>Enable verification QR code</span>
          </label>
        </div>

        {#if design.qrCode?.enabled ?? true}
          <div class="field-group">
            <label class="field-label" for="qr-pos">Position</label>
            <select
              id="qr-pos"
              class="field-select"
              value={design.qrCode?.position ?? "bottom_right"}
              onchange={(e) => {
                if (!design.qrCode)
                  design.qrCode = { enabled: true, position: "bottom_right" };
                design.qrCode.position = (e.target as HTMLSelectElement)
                  .value as any;
              }}
            >
              <option value="bottom_right">Bottom Right</option>
              <option value="bottom_left">Bottom Left</option>
              <option value="center_footer">Center Footer</option>
              <option value="top_right">Top Right</option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label" for="qr-label"
              >Verified Credential Label</label
            >
            <input
              id="qr-label"
              class="field-input"
              value={design.copy?.verifiedCredentialLabel ?? ""}
              placeholder="Credential reference"
              oninput={(event) => {
                if (!design.copy) design.copy = {};
                design.copy.verifiedCredentialLabel = (
                  event.target as HTMLInputElement
                ).value;
              }}
            />
          </div>

          <div class="field-group">
            <label class="field-label" for="id-format"
              >Certificate ID Format</label
            >
            <input
              id="id-format"
              class="field-input"
              value={design.idFormat}
              placeholder={"CIO-{YYYY}-{RANDOM}"}
              oninput={(event) =>
                (design.idFormat = (event.target as HTMLInputElement).value)}
            />
          </div>
        {/if}
      </div>
    {:else if selectedTool === "signatories"}
      <div class="tool-section">
        <div class="section-header-row">
          <h4 class="section-title">Signatories</h4>
          {#if (design.signatories?.length ?? 0) < 3}
            <button
              type="button"
              class="action-btn small"
              onclick={addSignatory}
            >
              <Plus size={14} /> Add
            </button>
          {/if}
        </div>

        {#if (design.signatories?.length ?? 0) === 0}
          <div class="empty-signatories">
            <span>No signatories added</span>
            <button type="button" class="action-btn" onclick={addSignatory}
              >Add first signatory</button
            >
          </div>
        {/if}

        {#each design.signatories ?? [] as sig, idx}
          <div
            class="signatory-card"
            class:is-selected={selectedElement === `signatory-${idx}`}
            role="button"
            tabindex="0"
            onclick={() =>
              onSelectElement(`signatory-${idx}` as StudioElementId)}
            onkeydown={(event) => {
              if (event.key === "Enter")
                onSelectElement(`signatory-${idx}` as StudioElementId);
            }}
          >
            <div class="signatory-header">
              <label class="signatory-toggle">
                <input type="checkbox" bind:checked={sig.enabled} />
                <span class="signatory-num">Signatory {idx + 1}</span>
              </label>
              <button
                type="button"
                class="icon-btn danger"
                title="Remove signatory"
                onclick={() => removeSignatory(idx)}
              >
                <Trash2 size={13} />
              </button>
            </div>

            {#if sig.enabled}
              <div class="field-group">
                <label class="field-label" for="sig-name-{idx}">Name</label>
                <input
                  id="sig-name-{idx}"
                  type="text"
                  class="field-input"
                  bind:value={sig.name}
                  placeholder="Dr. John Doe"
                />
              </div>

              <div class="field-group">
                <label class="field-label" for="sig-role-{idx}"
                  >Role / Title</label
                >
                <input
                  id="sig-role-{idx}"
                  type="text"
                  class="field-input"
                  bind:value={sig.role}
                  placeholder="Dean of Engineering"
                />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {:else if selectedTool === "background"}
      <div class="tool-section">
        <h4 class="section-title">Background Style</h4>

        <div class="field-group">
          <span class="field-label">Background Presets</span>
          <div class="background-swatches">
            {#each backgroundSwatches as swatch}
              <button
                type="button"
                class:is-active={design.background?.primaryColor?.toLowerCase() ===
                  swatch.primary.toLowerCase()}
                title={swatch.label}
                aria-label={swatch.label}
                onclick={() => {
                  if (!design.background)
                    design.background = { style: "parchment" };
                  design.background.primaryColor = swatch.primary;
                  design.background.secondaryColor = swatch.secondary;
                }}
              >
                <span style="background-color: {swatch.primary}"></span>
                <small>{swatch.label}</small>
              </button>
            {/each}
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="bg-style">Style</label>
          <select
            id="bg-style"
            class="field-select"
            value={design.background?.style ?? "parchment"}
            onchange={(e) => {
              if (!design.background)
                design.background = { style: "parchment" };
              design.background.style = (e.target as HTMLSelectElement)
                .value as any;
            }}
          >
            <option value="parchment">Antique Parchment</option>
            <option value="solid">Solid Slate</option>
            <option value="gradient">Soft Gradient</option>
            <option value="guilloche">Guilloche Security Pattern</option>
          </select>
        </div>

        <div class="field-group">
          <label class="field-label" for="background-primary"
            >Primary Color</label
          >
          <div class="color-field">
            <input
              id="background-primary"
              type="color"
              class="color-picker"
              value={design.background?.primaryColor ?? "#faf8f2"}
              oninput={(event) => {
                if (!design.background)
                  design.background = { style: "parchment" };
                design.background.primaryColor = (
                  event.target as HTMLInputElement
                ).value;
              }}
            />
            <input
              class="field-input color-value"
              value={design.background?.primaryColor ?? "#faf8f2"}
              oninput={(event) => {
                if (!design.background)
                  design.background = { style: "parchment" };
                design.background.primaryColor = (
                  event.target as HTMLInputElement
                ).value;
              }}
            />
          </div>
        </div>

        <div class="field-group">
          <label class="field-label" for="background-secondary"
            >Secondary Color</label
          >
          <div class="color-field">
            <input
              id="background-secondary"
              type="color"
              class="color-picker"
              value={design.background?.secondaryColor ?? "#f3ede0"}
              oninput={(event) => {
                if (!design.background)
                  design.background = { style: "parchment" };
                design.background.secondaryColor = (
                  event.target as HTMLInputElement
                ).value;
              }}
            />
            <input
              class="field-input color-value"
              value={design.background?.secondaryColor ?? "#f3ede0"}
              oninput={(event) => {
                if (!design.background)
                  design.background = { style: "parchment" };
                design.background.secondaryColor = (
                  event.target as HTMLInputElement
                ).value;
              }}
            />
          </div>
        </div>
      </div>
    {:else if selectedTool === "shapes"}
      <div class="tool-section">
        <h4 class="section-title">Vector Shapes</h4>
        <p class="section-desc">Add geometric shapes, lines, and frames to the certificate artboard.</p>

        <div class="shape-create-grid">
          <button type="button" class="shape-create-card" onclick={() => addShape('rectangle')}>
            <Square size={20} />
            <span>Rectangle</span>
          </button>
          <button type="button" class="shape-create-card" onclick={() => addShape('ellipse')}>
            <Circle size={20} />
            <span>Ellipse</span>
          </button>
          <button type="button" class="shape-create-card" onclick={() => addShape('line')}>
            <Minus size={20} />
            <span>Line</span>
          </button>
          <button type="button" class="shape-create-card" onclick={() => addShape('frame')}>
            <Frame size={20} />
            <span>Frame</span>
          </button>
        </div>

        {#if (design.shapes?.length ?? 0) > 0}
          <h4 class="section-title mt-4">Canvas Shapes ({(design.shapes?.length ?? 0)})</h4>
          <div class="canvas-shapes-list">
            {#each (design.shapes ?? []) as shape}
              <div
                class="canvas-shape-row"
                class:active={selectedElement === shape.id}
                role="button"
                tabindex="0"
                onclick={() => onSelectElement(shape.id)}
                onkeydown={(e) => {
                  if (e.key === "Enter") onSelectElement(shape.id);
                }}
              >
                <div class="shape-info">
                  {#if shape.shape === 'rectangle'}
                    <Square size={14} />
                  {:else if shape.shape === 'ellipse'}
                    <Circle size={14} />
                  {:else if shape.shape === 'line'}
                    <Minus size={14} />
                  {:else}
                    <Frame size={14} />
                  {/if}
                  <span>{shape.shape.charAt(0).toUpperCase() + shape.shape.slice(1)}</span>
                  <small>z:{shape.zIndex}</small>
                </div>
                <div class="shape-actions">
                  <button
                    type="button"
                    class="tiny-icon-btn"
                    title={shape.locked ? "Unlock" : "Lock"}
                    onclick={(e) => {
                      e.stopPropagation();
                      updateSelectedShape((s) => s.id === shape.id ? { ...s, locked: !s.locked } : s);
                    }}
                  >
                    {#if shape.locked}
                      <span class="locked-icon"><Lock size={12} /></span>
                    {:else}
                      <Unlock size={12} />
                    {/if}
                  </button>
                  <button
                    type="button"
                    class="tiny-icon-btn danger"
                    title="Delete"
                    onclick={(e) => {
                      e.stopPropagation();
                      design.shapes = (design.shapes ?? []).filter((s) => s.id !== shape.id);
                      if (selectedElement === shape.id) onSelectElement(null);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</aside>

<style>
  .inspector-panel {
    width: 350px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    border-left: 1px solid #e2e8f0;
    overflow: hidden;
  }

  .inspector-header {
    min-height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #e2e8f0;
  }

  .inspector-header strong {
    font-size: 10px;
    letter-spacing: 0.08em;
    color: #64748b;
  }

  .inspector-header span {
    padding: 4px 9px;
    border-radius: 999px;
    background: #fef3c7;
    color: #b45309;
    font-size: 10px;
    font-weight: 700;
  }

  .layers-section {
    padding: 14px 16px;
    border-bottom: 1px solid #e2e8f0;
  }

  .layers-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 9px;
  }

  .layers-heading strong {
    font-size: 9px;
    letter-spacing: 0.08em;
    color: #94a3b8;
  }

  .layers-heading button {
    border: 0;
    background: transparent;
    color: #d97706;
    font-size: 10px;
    cursor: pointer;
  }

  .layer-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .layer-list button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    background: #ffffff;
    color: #475569;
    padding: 4px 8px;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
  }

  .layer-list button:hover {
    border-color: #f59e0b;
    color: #92400e;
  }

  .layer-list button.active {
    border-color: #f59e0b;
    background: #f59e0b;
    color: #ffffff;
  }

  .layer-list button.hidden {
    opacity: 0.48;
  }

  .toggle-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: currentColor;
    opacity: 0.75;
    margin-left: 2px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .toggle-dot:hover {
    opacity: 1;
    transform: scale(1.3);
  }

  .toggle-dot.is-hidden {
    background: transparent;
    border: 1.5px solid currentColor;
    opacity: 0.45;
  }


  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .selection-card {
    margin-bottom: 18px;
    padding: 12px;
    border: 1px solid #fde68a;
    border-radius: 10px;
    background: #fffbeb;
  }

  .selection-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .selection-title strong {
    font-size: 10px;
    color: #92400e;
    text-transform: uppercase;
  }

  .selection-title span {
    padding: 3px 6px;
    border-radius: 5px;
    background: #fef3c7;
    color: #92400e;
    font-size: 9px;
    font-family: monospace;
  }

  .position-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .position-grid label {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .position-grid span {
    color: #64748b;
    font-size: 9px;
    font-weight: 600;
  }

  .position-grid input {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    color: #0f172a;
    padding: 6px 8px;
    font-size: 11px;
  }

  .position-actions {
    display: flex;
    gap: 6px;
    margin-top: 10px;
  }

  .position-actions button {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    color: #475569;
    padding: 5px 8px;
    font-size: 9px;
    font-weight: 600;
    cursor: pointer;
  }

  .tool-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--cio-color-text, #f8fafc);
    margin: 0;
  }

  .section-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-label {
    font-size: 11px;
    font-weight: 500;
    color: #64748b;
  }

  .field-input,
  .field-select,
  .field-textarea {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    color: #0f172a;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 13px;
    outline: none;
    transition: border-color 0.15s ease;
  }

  .field-input:focus,
  .field-select:focus,
  .field-textarea:focus {
    border-color: #f59e0b;
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.12);
  }

  .field-slider {
    accent-color: #f59e0b;
  }

  .field-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #0f172a;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .swatches-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .swatch-btn {
    width: 30px;
    height: 30px;
    border-radius: 999px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.1s ease;
  }

  .swatch-btn:hover {
    transform: scale(1.05);
  }

  .swatch-btn.is-active {
    border-color: #ffffff;
    box-shadow: 0 0 0 2px #f59e0b;
  }

  .color-field {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .color-picker {
    width: 32px;
    height: 32px;
    flex: 0 0 32px;
    padding: 0;
    border: 0;
    border-radius: 999px;
    overflow: hidden;
    background: transparent;
    cursor: pointer;
  }

  .color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .color-picker::-webkit-color-swatch {
    border: 1px solid #cbd5e1;
    border-radius: 999px;
  }

  .color-picker::-moz-color-swatch {
    border: 1px solid #cbd5e1;
    border-radius: 999px;
  }

  .color-value {
    min-width: 0;
    flex: 1;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  .signatory-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .signatory-card.is-selected {
    border-color: #f59e0b;
    background: #fffbeb;
    box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.25);
  }

  .signatory-toggle {
    display: flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
  }

  .signatory-toggle input {
    accent-color: #d97706;
  }

  .empty-signatories {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 18px;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 11px;
  }

  .organization-logo-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: #f8fafc;
  }

  .organization-logo-card img,
  .organization-logo-card > span {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    object-fit: contain;
    background: #fef3c7;
    color: #92400e;
    font-weight: 700;
  }

  .organization-logo-card div {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
  }

  .organization-logo-card strong {
    overflow: hidden;
    color: #334155;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .organization-logo-card small {
    color: #64748b;
    font-size: 9px;
  }

  .background-swatches {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .background-swatches button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 5px;
    border: 1px solid transparent;
    border-radius: 7px;
    background: transparent;
    color: #64748b;
    cursor: pointer;
  }

  .background-swatches button.is-active {
    border-color: #f59e0b;
    background: #fffbeb;
  }

  .background-swatches span {
    width: 26px;
    height: 26px;
    border: 1px solid #cbd5e1;
    border-radius: 999px;
  }

  .background-swatches small {
    font-size: 8px;
  }

  .signatory-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .signatory-num {
    font-size: 11px;
    font-weight: 600;
    color: #d97706;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    color: #0f172a;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
  }

  .action-btn:hover {
    background: #f1f5f9;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: #64748b;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
  }

  .icon-btn.danger:hover {
    color: #ef4444;
  }

  .shape-inspector-card {
    background: #f8fafc;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 8px;
    margin-bottom: 12px;
  }

  .shape-inspector-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    background: #f1f5f9;
    border-bottom: 1px solid #e2e8f0;
  }

  .shape-title-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #1e293b;
  }

  .shape-header-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .icon-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 4px;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .icon-action-btn:hover {
    background: #f8fafc;
    color: #0f172a;
    border-color: #94a3b8;
  }

  .icon-action-btn.danger:hover {
    background: #fef2f2;
    color: #dc2626;
    border-color: #f87171;
  }

  .locked-icon {
    color: #f59e0b;
    display: inline-flex;
    align-items: center;
  }

  .flex-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .field-val-hint {
    font-size: 11px;
    color: #64748b;
    font-family: monospace;
  }

  .slider-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  .slider-row input[type="range"] {
    flex: 1;
  }

  .small-btn {
    display: flex;
    align-items: center;
    gap: 3px;
    height: 24px;
    padding: 0 6px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    background: #ffffff;
    color: #475569;
    font-size: 10px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
  }

  .small-btn:hover:not(:disabled) {
    background: #f1f5f9;
    color: #0f172a;
  }

  .stops-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 8px;
  }

  .stop-col {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stop-label {
    font-size: 10px;
    color: #64748b;
    font-weight: 500;
  }

  .layer-order-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    margin-top: 6px;
  }

  .z-order-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 6px 2px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    color: #475569;
    font-size: 9px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .z-order-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
    border-color: #cbd5e1;
  }

  .z-number-input {
    width: 60px;
    height: 24px;
    padding: 0 6px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 11px;
    text-align: right;
  }

  .layer-subheading {
    padding: 8px 12px 4px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #94a3b8;
  }

  .shape-layer-item {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 5px 12px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: #334155;
    font-size: 12px;
    text-align: left;
    cursor: pointer;
  }

  .shape-layer-item:hover {
    background: #f1f5f9;
  }

  .shape-layer-item.active {
    background: #fef3c7;
    color: #b45309;
    font-weight: 600;
  }

  .shape-layer-label {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .shape-layer-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    color: #64748b;
  }

  .shape-create-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 10px;
  }

  .shape-create-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px 8px;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    background: #f8fafc;
    color: #475569;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .shape-create-card:hover {
    background: #ffffff;
    border-color: #2563eb;
    color: #2563eb;
    box-shadow: 0 2px 4px rgba(37, 99, 235, 0.08);
  }

  .section-desc {
    font-size: 11px;
    color: #64748b;
    margin-top: 2px;
  }

  .canvas-shapes-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 8px;
  }

  .canvas-shape-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .canvas-shape-row:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .canvas-shape-row.active {
    background: #fef3c7;
    border-color: #f59e0b;
    color: #b45309;
  }

  .shape-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
  }

  .shape-info small {
    font-size: 10px;
    color: #64748b;
  }

  .shape-actions {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .tiny-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border: none;
    border-radius: 3px;
    background: transparent;
    color: #64748b;
    cursor: pointer;
  }

  .tiny-icon-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  .tiny-icon-btn.danger:hover {
    background: #fef2f2;
    color: #dc2626;
  }
</style>
