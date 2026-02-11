---
title: fix: Improve particle center color fidelity and edge smoothness control
type: fix
date: 2026-02-11
brainstorm: docs/brainstorms/2026-02-11-particle-color-falloff-brainstorm.md
---

# fix: Improve particle center color fidelity and edge smoothness control

## Overview
Fix particle color rendering so `PARTICLE_CENTER_COLOR = #FFFFFF` is perceived as white (with optional slight tint), and add an explicit `Edge Smoothness` control for wider and more predictable center-to-edge transition shaping.

## Problem Statement / Motivation
Current behavior couples color/profile output too tightly across shader stages, so white center selection can look non-white after final compositing. Edge transition shaping is also constrained because only `Softness` is user-facing while edge falloff behavior is effectively fixed.

This limits art direction control and makes tuning non-intuitive.

## Proposed Solution
1. Add a dedicated particle parameter: `PARTICLE_EDGE_SMOOTHNESS`.
2. Use `Softness` for core intensity/profile behavior and `Edge Smoothness` for boundary transition behavior.
3. Adjust final compositing so near-white centers remain perceptually white at the particle core while preserving the existing artistic look (subtle tint is still allowed).
4. Keep changes in the existing pipeline (no new render pass).

## Technical Considerations
- Rendering pipeline already runs multi-pass (`renderReveal` → `renderSine` → `renderShatter` → `renderBokeh` → `renderOutput`), so changes should remain in existing shader/config plumbing to avoid perf regression.
- `revealFragmentSource` currently computes `profile` and color mix from `uSoftness`; this is the right insertion point for independent edge transition control.
- `outputFragmentSource` currently multiplies/boosts particle contribution against background; this stage likely causes perceived white loss and needs calibrated handling for high-alpha bright center values.
- Configuration is persisted in localStorage (`bokeh-controls-v4-particle`), so adding a new key must preserve backward compatibility for existing saved configs.

## Stakeholders
- End users tuning visuals in the control panel.
- Design/art direction stakeholders who need predictable particle gradients.
- Developers maintaining shader and control logic in a single-file WebGL implementation.

## SpecFlow Analysis (User Flows and Gaps)
### Primary flows
1. User sets center color to white and expects white-looking core during animation.
2. User adjusts `Edge Smoothness` and observes independent boundary transition changes without losing `Softness` behavior.
3. User resets controls and expects defaults to restore intended look.
4. User reloads page and expects persisted values to remain stable.

### Edge cases
- `Edge Smoothness` at min/max should not produce hard artifacts, banding, or fully flat particles.
- White center behavior should remain acceptable with `BG_TEXTURE_ENABLED` on and off.
- Behavior should remain coherent with reduced motion mode (`renderOnce`) and continuous animation (`drawFrame`).
- Existing saved config objects (without new key) should load safely with a default value.

### Clarifications to lock during implementation
- UI label strategy: numeric only vs helper hint (`Sharp ↔ Dreamy`).
- Visual acceptance baseline: whether to use a reference screenshot for sign-off.

## Acceptance Criteria
- [ ] `Edge Smoothness` control exists in `Particle` group and persists via localStorage.
- [ ] With `PARTICLE_CENTER_COLOR = #FFFFFF`, particle core is visually white in both static render and animated render.
- [ ] `Softness` and `Edge Smoothness` produce visibly distinct effects and are not redundant.
- [ ] Transition range is wide: user can dial from noticeably sharper edge to very soft edge.
- [ ] `Reset` returns both parameters to intended defaults.
- [ ] No additional render passes are introduced.
- [ ] No noticeable FPS regression on current default settings.

## Success Metrics
- Visual QA pass confirms white-center perception target under default background settings.
- Visual QA pass confirms edge transition range at low/mid/high `Edge Smoothness` values.
- No new runtime errors in browser console during control interaction and animation loop.

## Dependencies & Risks
- **Risk:** Over-correcting center white may wash out scene style.
  - **Mitigation:** Preserve subtle tint allowance and tune against existing look.
- **Risk:** Parameter overlap (`Softness` vs `Edge Smoothness`) can confuse users.
  - **Mitigation:** Keep behavioral separation explicit in parameter mapping; add helper text only if needed.
- **Risk:** Saved configs from older sessions miss new key.
  - **Mitigation:** Ensure robust default fallback through existing config merge path.

## Implementation Outline
### Phase 1: Shader and uniform contract
- [x] `index.html`: extend particle config/defaults with `PARTICLE_EDGE_SMOOTHNESS`.
- [x] `index.html`: add reveal shader uniform for edge smoothness and wire uniform location.
- [x] `index.html`: update reveal-stage profile/edge transition mapping to separate responsibilities.
- [x] `index.html`: adjust output-stage compositing for white-center fidelity while keeping subtle tint.

### Phase 2: Controls and state behavior
- [x] `index.html`: add `Edge Smoothness` entry to `CONTROL_DEFS` in `Particle` section.
- [x] `index.html`: ensure `applyConfigChange` includes new control in reveal reset triggers.
- [x] `index.html`: validate reset and persisted-load behavior for older/newer config payloads.

### Phase 3: Verification
- [ ] `index.html`: verify animated mode (`drawFrame`) and reduced-motion mode (`renderOnce`) both meet criteria.
- [ ] `index.html`: run a manual visual matrix across combinations:
  - center color (`#FFFFFF`, warm off-white, saturated hue)
  - edge color (dark vs light)
  - edge smoothness (low/mid/high)
  - background texture enabled/disabled

Verification note:
- In current headless automation environment, `webgl2` context is unavailable, so particle visuals cannot be validated reliably in-browser here. This phase requires manual check in a regular desktop browser.

## References & Research
### Internal references
- Reveal shader color/profile logic: `index.html:421`
- Reveal profile and center/edge mix math: `index.html:453`
- Output compositing math impacting perceived brightness: `index.html:636`
- Reveal uniform bindings: `index.html:777`
- Output uniform bindings: `index.html:838`
- Render pipeline order (all passes): `index.html:1173`
- Control definitions (`PARTICLE_*` controls): `index.html:1257`
- Config change triggers and reveal reset: `index.html:1324`
- Defaults and localStorage key: `index.html:299`

### Institutional learnings
- No `docs/solutions/` entries currently present in this repository.

### External research decision
- Skipped. Topic is low-risk and local code context is strong; existing implementation patterns are sufficient for planning.
