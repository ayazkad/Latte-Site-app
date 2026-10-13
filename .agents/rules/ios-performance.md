# iOS 120 FPS Animation & Performance Guidelines

## Core Principles for 120Hz ProMotion (iOS / Safari WebKit)

1. **GPU Layer Promotion**:
   - Always use 3D hardware-accelerated transforms (`translate3d(x, y, z)` or `transform: translate3d(0, 0, 0)`).
   - Pair with `-webkit-backface-visibility: hidden; backface-visibility: hidden;` and `will-change: transform;`.
   - Never animate layout geometry (`top`, `left`, `right`, `bottom`, `width`, `height`, `margin`, `padding`).

2. **No Dynamic CSS Grid / Layout Interpolation**:
   - Avoid `grid-template-rows: 0fr -> 1fr` animations on iOS WebKit as it forces CPU reflow on every frame.
   - Use GPU-backed `max-height` + `opacity` transitions with `cubic-bezier(0.32, 0.72, 0, 1)`.

3. **No Continuous Filter Animations**:
   - Do NOT animate `backdrop-filter: blur(0px -> 12px)` continuously inside keyframes or transitions.
   - Keep `backdrop-filter` static and animate GPU `opacity` or `background-color` instead.

4. **Apple ProMotion Easing Standards**:
   - Use iOS native curves: `cubic-bezier(0.32, 0.72, 0, 1)` or `cubic-bezier(0.22, 1, 0.36, 1)`.
   - Optimal modal/drawer durations: 300ms–500ms.
   - Accordion duration: 300ms–350ms.

5. **Safe Area & Layer Cleanup**:
   - Use `visibility: hidden` when overlays / drawers are inactive to release the WebKit compositor layer from covering safe areas.
