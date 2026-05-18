<!-- Copyright (c) 2025 Apple Inc. Licensed under MIT License. -->
<script lang="ts" module>
  interface Props<Tooltip> {
    /** 像素位置。 */
    location: Point;
    /** 点目标的高度。 */
    targetHeight: number;
    /** 是否允许指针交互。 */
    allowInteraction: boolean;

    tooltip: Tooltip;
    customTooltip: CustomComponent<HTMLDivElement, { tooltip: Tooltip }>;
    /** Y 方向边距。 */
    margin?: number;
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import type { Point } from "../utils.js";
  import { customComponentAction, customComponentProps } from "./custom_component_helper.js";
  import type { CustomComponent } from "./types.js";

  type Tooltip = $$Generic;

  let { location, targetHeight, allowInteraction, tooltip, customTooltip, margin = 4 }: Props<Tooltip> = $props();

  let parentContainer: HTMLDivElement;
  let container: HTMLDivElement;

  let action = $derived(customComponentAction(customTooltip));
  let instanceProps = $derived(customComponentProps(customTooltip, { tooltip: tooltip }));

  onMount(() => {
    $effect.pre(() => {
      let capturedAction = action;
      let instance: any | null = null;

      $effect.pre(() => {
        container.style.left = "0px";
        container.style.top = "0px";
        container.style.pointerEvents = allowInteraction ? "auto" : "none";

        if (instance == null) {
          instance = capturedAction(container, instanceProps);
        } else {
          instance.update?.(instanceProps);
        }

        function updatePosition(width: number, height: number, xMin: number, xMax: number, yMax: number) {
          let px = location.x;
          let py = location.y;
          let yMin = 2;
          let anchorX = width / 2;
          if (px - anchorX < xMin) {
            anchorX = px - xMin;
          }
          if (px - anchorX > xMax - width) {
            anchorX = px - xMax + width;
          }

          let top = py - targetHeight - margin - height;
          let bottom = top + height;
          if (top < yMin) {
            let topBelow = py + targetHeight + margin;
            let bottomBelow = topBelow + height;
            if (bottomBelow <= yMax || bottom > yMax) {
              top = topBelow;
              bottom = bottomBelow;
            }
          }
          if (bottom > yMax) {
            top = Math.max(yMin, yMax - height);
          }
          container.style.left = px - anchorX + "px";
          container.style.top = top + "px";
        }

        function reposition() {
          let parentRect = parentContainer.getBoundingClientRect();
          let { width, height } = container.getBoundingClientRect();
          updatePosition(width, height, 2, parentRect.width - 2, parentRect.height - 2);
        }

        reposition();

        // Tooltip content can change size after Svelte mounts nested renderers.
        let req: number | null = requestAnimationFrame(() => {
          req = null;
          reposition();
        });
        let resizeObserver = new ResizeObserver(() => {
          if (req != null) {
            cancelAnimationFrame(req);
          }
          req = requestAnimationFrame(() => {
            req = null;
            reposition();
          });
        });
        resizeObserver.observe(container);
        resizeObserver.observe(parentContainer);

        return () => {
          if (req != null) {
            cancelAnimationFrame(req);
          }
          resizeObserver.disconnect();
        };
      });

      return () => {
        instance?.destroy?.();
        container.replaceChildren();
      };
    });
  });
</script>

<div
  bind:this={parentContainer}
  style:position="absolute"
  style:inset="0"
  style:width="100%"
  style:height="100%"
  style:pointer-events="none"
>
  <div
    bind:this={container}
    style:display="flex"
    style:position="absolute"
    style:width="fit-content"
    style:height="fit-content"
    style:z-index="100"
  ></div>
</div>
