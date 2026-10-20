<script lang="ts">
  import type { Snippet } from "svelte";
  import GripVertical from "@lucide/svelte/icons/grip-vertical";
  import AlignCenter from "@lucide/svelte/icons/align-center";
  import AlignCenterVertical from "@lucide/svelte/icons/align-center-vertical";
  import RotateCcw from "@lucide/svelte/icons/rotate-ccw";
  import Trash2 from "@lucide/svelte/icons/trash-2";
  import type {
    StudioElementId,
    ToolCategory,
    ResizeDirection,
  } from "../../shared/types";

  interface Props {
    id: StudioElementId;
    label: string;
    tool: ToolCategory;
    selected: boolean;
    hovered: boolean;
    positionMode?: "auto" | "custom";
    x?: number;
    y?: number;
    left?: number | string;
    top?: number | string;
    width?: number | string;
    height?: number | string;
    canDelete?: boolean;
    onSelect: (id: StudioElementId, tool: ToolCategory) => void;
    onHover: (id: StudioElementId | null) => void;
    onCenterHorizontal?: (id: StudioElementId) => void;
    onCenterVertical?: (id: StudioElementId) => void;
    onResetAuto?: (id: StudioElementId) => void;
    onDelete?: (id: StudioElementId) => void;
    onStartDrag?: (e: PointerEvent, id: StudioElementId) => void;
    onStartResize?: (
      e: PointerEvent,
      id: StudioElementId,
      direction: ResizeDirection,
    ) => void;
    children?: Snippet;
  }

  let {
    id,
    label,
    tool,
    selected,
    hovered,
    positionMode = "auto",
    left = 0,
    top = 0,
    width = 100,
    height = 50,
    canDelete = true,
    onSelect,
    onHover,
    onCenterHorizontal,
    onCenterVertical,
    onResetAuto,
    onDelete,
    onStartDrag,
    onStartResize,
    children,
  }: Props = $props();

  function handlePointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("[data-resize-handle]"))
      return;

    e.preventDefault();
    onSelect(id, tool);
    if (onStartDrag) {
      onStartDrag(e, id);
    }
  }

  const resizeHandles: Array<{
    dir: ResizeDirection;
    style: string;
    edge?: boolean;
  }> = [
    { dir: "nw", style: "top: -8px; left: -8px; cursor: nwse-resize;" },
    { dir: "ne", style: "top: -8px; right: -8px; cursor: nesw-resize;" },
    { dir: "sw", style: "bottom: -8px; left: -8px; cursor: nesw-resize;" },
    { dir: "se", style: "bottom: -8px; right: -8px; cursor: nwse-resize;" },
    {
      dir: "top",
      style:
        "top: -6px; left: 50%; transform: translateX(-50%); cursor: ns-resize;",
      edge: true,
    },
    {
      dir: "bottom",
      style:
        "bottom: -6px; left: 50%; transform: translateX(-50%); cursor: ns-resize;",
      edge: true,
    },
    {
      dir: "left",
      style:
        "left: -6px; top: 50%; transform: translateY(-50%); cursor: ew-resize;",
      edge: true,
    },
    {
      dir: "right",
      style:
        "right: -6px; top: 50%; transform: translateY(-50%); cursor: ew-resize;",
      edge: true,
    },
  ];
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  data-element-id={id}
  class="zone-container"
  class:is-selected={selected}
  class:is-hovered={hovered}
  class:is-border={id === 'border'}
  style="left: {typeof left === 'number'
    ? left + 'px'
    : left}; top: {typeof top === 'number'
    ? top + 'px'
    : top}; width: {typeof width === 'number'
    ? width + 'px'
    : width}; height: {typeof height === 'number' ? height + 'px' : height};"
  onpointerdown={handlePointerDown}
  onpointerenter={() => onHover(id)}
  onpointerleave={() => onHover(null)}
>
  {#if selected || hovered}
    <div class="toolbar" class:toolbar-bottom={id === "border" || (typeof top === "number" && top < 36)} onpointerdown={(e) => e.stopPropagation()}>
      <span class="label">
        <GripVertical size={12} />
        {label}
        {#if positionMode === "custom"}
          <span class="custom-badge">Custom</span>
        {/if}
      </span>

      {#if onCenterHorizontal}
        <button
          type="button"
          class="tool-btn"
          title="Center horizontally"
          onclick={() => onCenterHorizontal(id)}
        >
          <AlignCenter size={13} />
        </button>
      {/if}

      {#if onCenterVertical}
        <button
          type="button"
          class="tool-btn"
          title="Center vertically"
          onclick={() => onCenterVertical(id)}
        >
          <AlignCenterVertical size={13} />
        </button>
      {/if}

      {#if positionMode === "custom" && onResetAuto}
        <button
          type="button"
          class="tool-btn"
          title="Reset to default alignment"
          onclick={() => onResetAuto(id)}
        >
          <RotateCcw size={13} />
        </button>
      {/if}

      {#if canDelete && onDelete}
        <button
          type="button"
          class="tool-btn danger"
          title="Remove element"
          onclick={() => onDelete(id)}
        >
          <Trash2 size={13} />
        </button>
      {/if}
    </div>

    {#each resizeHandles as handle}
      <div
        data-resize-handle
        class="resize-handle"
        class:is-edge={handle.edge}
        style={handle.style}
        onpointerdown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onStartResize?.(e, id, handle.dir);
        }}
      ></div>
    {/each}
  {/if}

  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .zone-container {
    position: absolute;
    box-sizing: border-box;
    cursor: move;
    border: 1px dashed transparent;
    transition: border-color 0.15s ease;
    user-select: none;
    touch-action: none;
    pointer-events: auto;
    z-index: 10;
  }

  .zone-container.is-hovered {
    border: 2px dashed rgba(245, 158, 11, 0.9);
    background-color: rgba(245, 158, 11, 0.08);
  }

  .zone-container.is-selected {
    border: 2px solid #f59e0b;
    background-color: rgba(245, 158, 11, 0.08);
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
    z-index: 30;
  }

  .zone-container.is-border {
    z-index: 5;
  }

  .toolbar.toolbar-bottom {
    bottom: auto;
    top: 6px;
    left: 6px;
    margin-bottom: 0;
  }

  .toolbar {
    position: absolute;
    bottom: 100%;
    left: 0;
    margin-bottom: 6px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 6px;
    background: #1e293b;
    color: #f8fafc;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -2px rgba(0, 0, 0, 0.1);
    white-space: nowrap;
    pointer-events: auto;
  }

  .label {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-right: 4px;
  }

  .custom-badge {
    background: #334155;
    color: #fde68a;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 9px;
  }

  .tool-btn {
    background: transparent;
    border: none;
    color: #cbd5e1;
    padding: 2px 4px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tool-btn:hover {
    background: #334155;
    color: white;
  }

  .tool-btn.danger:hover {
    background: #dc2626;
    color: white;
  }

  .resize-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #ffffff;
    border: 2px solid #d97706;
    border-radius: 2px;
    pointer-events: auto;
    z-index: 40;
  }

  .resize-handle.is-edge {
    border-radius: 999px;
  }

  .resize-handle.is-edge[data-resize-handle] {
    width: 24px;
    height: 10px;
  }

  .resize-handle.is-edge[style*="ew-resize"] {
    width: 10px;
    height: 24px;
  }
</style>
