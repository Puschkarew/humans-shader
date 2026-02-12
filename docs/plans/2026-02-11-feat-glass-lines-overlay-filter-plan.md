---
title: feat: Add brightness-reactive glass lines overlay filter
type: feat
date: 2026-02-11
brainstorm: /Users/vladimirpuskarev/Documents/Humans Refresh/docs/brainstorms/2026-02-11-glass-lines-overlay-brightness-reactive-brainstorm.md
---

# feat: Add brightness-reactive glass lines overlay filter

## Overview
Add a new full-frame "glass lines" filter that overlays vertical line texture across the final rendered frame. The effect must be user-toggleable via a dedicated checkbox and tunable through panel controls. For MVP, line intensity scales linearly by brightness (not motion speed), with a subtle optical irregularity for a less synthetic look.

## Problem Statement / Motivation
Current visuals do not include the "vertical glass lines" style seen in the reference video. Existing controls already allow rich particle and post-process tuning, but there is no dedicated, reusable overlay filter. The goal is to add this style as an optional, controllable layer without disrupting current color/contour quality or performance behavior.

## Found Brainstorm Context (Step 0)
Found brainstorm from **2026-02-11**: **glass-lines-overlay-brightness-reactive**. Using as context for planning.

Key locked decisions from brainstorm:
- Full-frame overlay scope (not particle-only).
- Brightness-only adaptation for MVP.
- Linear response curve.
- Approach B: include slight optical irregularity.
- Controls: `Enabled`, `Brightness Influence`, `Line Strength`, `Line Width/Spacing`.
- Follow existing persisted-controls behavior (last saved state restored).

## Repository & Learnings Research (Step 1)
### Repo findings
- Rendering is a multi-pass pipeline ending in `renderOutput`, which already composites final pixel color and is the correct place for final overlay detail: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:1167`.
- Output shader already combines base/background/particle and samples blue noise, making it suitable for adding a line overlay with slight irregularity: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:662`.
- Output uniforms are centrally declared and wired in one place; new filter parameters can follow this contract: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:896`.
- Config defaults and persistence are centralized (`DEFAULTS`, `loadConfig`, `saveConfig`), so new controls naturally inherit autosave/restore behavior: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:299`, `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:361`, `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:383`.
- Control UI is generated from `CONTROL_DEFS` (supports checkbox and range), and runtime changes are already routed through `applyConfigChange`: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:1333`, `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:1402`.

### Institutional learnings
- Relevant solution found: `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/solutions/ui-bugs/contour-noise-not-visible-particle-pipeline-20260211.md`.
- Key insight to reuse: high-frequency visual detail should be applied in final compositing when it must survive blur-like passes.
- Key process insight to reuse: validate both "parameter responsiveness" and "final-frame visibility," not just raw shader math.
- `critical-patterns.md` is currently missing: `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/solutions/patterns/critical-patterns.md`.

### Supporting artifact
- Visual reference video: `/Users/vladimirpuskarev/Library/Application Support/CleanShot/media/media_zgwTHE1zkj/CleanShot 2026-02-11 at 21.58.57.mp4`.

## External Research Decision (Step 1.5)
Decision: **skip external research**.

Reason: this is a low-risk internal visual feature with strong local patterns already present in the output shader, control system, and persistence flow. Existing repository knowledge is sufficient for a reliable implementation plan.

## SpecFlow Analysis (Step 3)
### User Flow Overview
1. User enables `Glass Lines` checkbox and immediately sees vertical line overlay on the full frame.
2. User changes `Line Strength` and observes stronger/weaker overlay amplitude.
3. User changes `Line Width/Spacing` and observes density/frequency changes without breaking readability.
4. User changes `Brightness Influence` and sees line prominence adjust linearly with brighter areas.
5. User resets controls and gets expected default values.
6. User reloads page and sees last-used settings restored.

### Flow Permutations Matrix
| Flow | Context | Expected result |
|---|---|---|
| Enabled = Off | Any scene state | No overlay contribution |
| Enabled = On, low brightness | Dark scene zones | Subtle lines |
| Enabled = On, high brightness | Bright scene zones | Stronger lines (linear increase) |
| Texture on/off | `BG_TEXTURE_ENABLED` both states | Overlay remains stable and visually coherent |
| Motion/reduced motion | `drawFrame` vs `renderOnce` | Same style language, no mode-specific artifacts |

### Missing Elements & Gaps
- **Category:** Visual acceptance baseline  
  **Gap:** No fixed side-by-side acceptance set yet for "looks like glass lines."  
  **Impact:** Subjective tuning can drift.
- **Category:** Optical irregularity scope  
  **Gap:** Not finalized whether irregularity is always-on or needs its own control.  
  **Impact:** Could cause scope creep in MVP.
- **Category:** Performance guardrails  
  **Gap:** No explicit performance budget for the added overlay math.  
  **Impact:** Risk on lower-power devices at high DPR.

### Critical Questions Requiring Clarification
1. **Important:** Should optical irregularity remain fixed internally for MVP, or should it be exposed later as a separate control?  
   Default assumption if unanswered: fixed internal value for MVP (YAGNI).
2. **Important:** What exact acceptance snapshots are used for sign-off?  
   Default assumption if unanswered: use the provided CleanShot video and 3 static captures from the app.

## Proposed Solution
Use Approach B from brainstorm:
1. Add a full-frame vertical line overlay in the output compositing stage.
2. Modulate overlay intensity linearly by per-pixel brightness with user-controlled influence.
3. Add slight optical irregularity so lines feel glass-like rather than purely procedural.
4. Expose four controls in panel UI and persist them through existing config storage.

## Technical Considerations
- Keep implementation in existing output pass to avoid adding render passes.
- Preserve existing color/contour behavior when filter is disabled.
- Use numeric ranges that are easy to tune and safe against extreme artifacts.
- Ensure `applyConfigChange` updates output immediately in non-running or reduced-motion paths.
- Verify no unintended interactions with `BG_TEXTURE_ENABLED`.

## Acceptance Criteria
- [ ] New checkbox `Glass Lines Enabled` exists and toggles filter on/off.
- [ ] `Brightness Influence`, `Line Strength`, and `Line Width/Spacing` controls exist in panel UI.
- [ ] Overlay applies to full frame (not only particle region).
- [ ] Brightness adaptation is linear: brighter zones receive proportionally stronger line effect.
- [ ] Slight optical irregularity is visible and does not create flicker/artifact spikes.
- [ ] Disabled state produces no visual regression versus current baseline.
- [ ] Reset behavior returns all new controls to planned defaults.
- [ ] Saved settings restore on reload via existing localStorage mechanism.
- [ ] Reduced-motion rendering path (`renderOnce`) remains visually consistent with animated path.

## Success Metrics
- Visual QA passes on at least 3 scenarios: dark-dominant frame, bright-dominant frame, mixed-contrast frame.
- Tuning matrix passes for low/mid/high values across all three numeric controls.
- No new WebGL compile/runtime errors during control interactions.
- No noticeable frame-time regression at default settings.

## Dependencies & Risks
- **Risk:** Overlay overwhelms existing particle style.  
  **Mitigation:** conservative defaults and linear influence tuning.
- **Risk:** High-frequency lines shimmer at certain scales.  
  **Mitigation:** introduce controlled irregularity and validate in motion and static modes.
- **Risk:** Scope creep from optional controls (extra knobs).  
  **Mitigation:** keep MVP to 4 controls only; defer extras.

## Implementation Outline
### Phase 1: Contract and defaults
- [x] Update `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html` `DEFAULTS` with `GLASS_LINES_ENABLED`, `GLASS_LINES_BRIGHTNESS_INFLUENCE`, `GLASS_LINES_STRENGTH`, `GLASS_LINES_SPACING`.
- [x] Add output uniforms for new parameters in `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html` `outputUniforms` map.

### Phase 2: Output-stage filter behavior
- [x] Extend `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html` `outputFragmentSource` with full-frame vertical-line overlay logic.
- [x] Add linear brightness-driven modulation and subtle optical irregularity in the same output stage.
- [x] Ensure bypass path is exact when `GLASS_LINES_ENABLED` is off.

### Phase 3: Controls and UX behavior
- [x] Add new control entries in `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html` `CONTROL_DEFS` (checkbox + ranges).
- [x] Ensure `applyConfigChange` triggers immediate visual refresh for these controls.
- [x] Validate autosave/load/reset behavior through existing config lifecycle.

### Phase 4: Verification
- [ ] Run visual matrix against `/Users/vladimirpuskarev/Library/Application Support/CleanShot/media/media_zgwTHE1zkj/CleanShot 2026-02-11 at 21.58.57.mp4`.
- [ ] Validate reduced-motion (`renderOnce`) vs animated (`drawFrame`) consistency.
- [ ] Confirm no regressions in existing contour/noise controls.

## AI-Era Notes
- Brainstorm-first workflow was used to lock product decisions before implementation details.
- Keep manual visual verification mandatory because this effect is perception-driven and not fully testable by static assertions.

## References & Research
### Internal References
- Output fragment shader and current compositing: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:662`
- Output uniform wiring: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:896`
- Output render invocation and uniform assignment: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:1167`
- Config defaults + storage: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:299`
- Config load/save: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:361`
- Dynamic controls registry: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:1333`
- Config change hook: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:1402`

### Institutional Learnings
- `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/solutions/ui-bugs/contour-noise-not-visible-particle-pipeline-20260211.md`

### Related Work
- Brainstorm input: `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/brainstorms/2026-02-11-glass-lines-overlay-brightness-reactive-brainstorm.md`
