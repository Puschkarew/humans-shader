---
title: fix: Align glass effect to continuous reference ridges
type: fix
date: 2026-02-12
brainstorm: /Users/vladimirpuskarev/Documents/Humans Refresh/docs/brainstorms/2026-02-12-glass-reference-parity-continuous-ridges-brainstorm.md
---

# fix: Align glass effect to continuous reference ridges

## Overview
Replace the current glass-lines look (regular segmented/dotted marks) with a continuous vertical ridge aesthetic that matches the reference family more closely. The effect should stay visible across the full frame, keep moderate optical irregularity, and avoid pixel-discrete stroke artifacts.

## Problem Statement / Motivation
Current output diverges from the reference: lines read as repeated short marks instead of smooth glass ridges. This breaks the intended style and makes the filter feel synthetic. The goal is parity in visual language, not preserving the current parameter set.

## Found Brainstorm Context (Step 0)
Found brainstorm from **2026-02-12**: **glass-reference-parity-continuous-ridges**. Using as context for planning.

Locked decisions from brainstorm/user dialog:
- Continuous, visible vertical ridges across the whole frame.
- Moderate optical irregularity (natural glass feel, not heavy wobble).
- Visual result is primary; controls may be replaced.
- Acceptance target: close to reference with tolerance, not pixel-perfect match.

Planning assumptions locked in this pass:
- Replace legacy `GLASS_LINES_*` with `GLASS_RIDGES_*` naming.
- Expose a minimal control set only: `Enabled`, `Ridge Strength`, `Ridge Spacing`, `Ridge Distortion`.
- Keep brightness response as an internal bounded multiplier (no separate user-facing control in MVP).
- Use fixed visual checkpoints at ~0.5s / ~1.5s / ~2.5s in both videos for repeatable side-by-side review.

## Repository & Learnings Research (Step 1)
### Repo findings
- Runtime config, defaults, and persistence are centralized in one file and support safe parameter reshaping: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:299`.
- Final compositing happens in output shader; glass is already applied there and is the right ownership point for parity tuning: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:666`.
- Existing glass implementation uses sinus stripe distance plus modulation that currently produces segmented marks: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:724`.
- Uniform wiring and assignments are centralized, so swapping glass params is low-friction: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:922`, `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:1197`.
- UI controls are schema-driven and can remove/replace controls without structural rewrites: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:1367`.

### Institutional learnings
- Relevant solution: `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/solutions/ui-bugs/contour-noise-not-visible-particle-pipeline-20260211.md:1`.
- Key carryover: when detail must survive post-processing, apply/tune it in final output compositing and validate final-frame visibility, not only shader intent (`Prevention` section): `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/solutions/ui-bugs/contour-noise-not-visible-particle-pipeline-20260211.md:70`.
- `critical-patterns.md` is currently missing, so no cross-cutting required pattern file to apply.

### Supporting artifacts
- Reference video: `/Users/vladimirpuskarev/Library/Caches/com.apple.SwiftUI.Drag-116C8AAA-BED1-4CCB-A44A-09268AC98F7D/CleanShot 2026-02-11 at 22.18.12.mp4`
- Current result video: `/Users/vladimirpuskarev/Library/Caches/com.apple.SwiftUI.Drag-B7EDB4C4-412A-4427-90C0-BEE71A121007/CleanShot 2026-02-12 at 12.44.37.mp4`

## External Research Decision (Step 1.5)
Decision: **skip external research**.

Reason: this is an internal visual parity fix on an existing WebGL pipeline with strong local precedents, low domain risk, and sufficient repository evidence.

## SpecFlow Analysis (Step 3)
### User Flow Overview
1. User enables glass effect and immediately sees continuous vertical ridges.
2. User adjusts strength/spacing and sees predictable, non-segmented change.
3. User observes lines in dark/mid/bright zones; bright areas can intensify but dark zones keep presence.
4. User toggles effect off and gets baseline output with no visual regression.
5. User reloads page and gets last chosen glass settings.
6. User in reduced-motion mode sees the same style language as animated mode.

### Flow Permutations Matrix
| Flow | Context | Expected result |
|---|---|---|
| Glass off | Any scene | No ridge contribution |
| Glass on + dark scene | Low luminance frame | Ridges still visible, lower intensity |
| Glass on + bright scene | High luminance frame | Ridges intensify without becoming segmented |
| Glass on + mixed contrast | Combined zones | Smooth global continuity, no dotted columns |
| Animation vs reduced motion | `drawFrame` vs `renderOnce` | Same ridge character and spacing behavior |
| Different resolutions | 2242x1260, 3840x2160 | Similar perceived spacing/density |

### Missing Elements & Gaps
- **Category:** Visual acceptance protocol
  **Gap:** Need to keep checkpoint-based review discipline during implementation.
  **Impact:** Without it, acceptance can drift back to subjective frame picking.
- **Category:** Performance guardrail
  **Gap:** No explicit frame-time budget for revised ridge math.
  **Impact:** Risk of unnoticed regression on high resolution.

### Critical Questions Requiring Clarification
1. **Important:** What frame-time increase at defaults is acceptable on the current machine?  
   Why it matters: parity fixes can silently become too expensive at 4K.  
   Default assumption: treat any clearly noticeable regression as failure and tune down complexity.

## Proposed Solution
Rebuild the glass effect as a continuous ridge field in the output pass, replacing segmented stripe behavior with smooth vertical banding and low-frequency optical warp. Keep brightness as a secondary multiplier so lines remain present across all luminance zones. Replace legacy glass controls with a minimal ridge-focused set (`Enabled`, `Ridge Strength`, `Ridge Spacing`, `Ridge Distortion`) and retire controls that do not map to the new behavior.

## Technical Considerations
- Keep all ridge logic in `outputFragmentSource` to preserve final-frame detail ownership.
- Guarantee exact bypass path when glass is disabled.
- Use low-frequency distortion only; avoid high-frequency modulation that reads as dotted marks.
- Prefer minimal control surface to enforce consistent look and YAGNI.
- Preserve current config persistence flow; if keys are renamed, unknown old keys are naturally ignored by current load logic.

## Acceptance Criteria
- [ ] Glass effect reads as continuous vertical ridges, not discrete dotted/segmented strokes.
- [ ] Ridges are visible across the full frame (dark, mid, bright), with brightness only modulating intensity.
- [ ] Optical irregularity is moderate and stable (natural glass feel, no strong wobble artifacts).
- [ ] Legacy glass controls are replaced with exactly four ridge controls: `Enabled`, `Ridge Strength`, `Ridge Spacing`, `Ridge Distortion`.
- [ ] New controls update rendering live and persist across reload/reset through existing config lifecycle.
- [ ] Disabled state matches baseline output with no regressions in particle/background behavior.
- [ ] Reduced-motion rendering preserves the same ridge style as animated mode.
- [ ] No shader compile/runtime errors during control interaction.

## Success Metrics
- Visual sign-off passes on matched checkpoints from both provided videos (same moments compared side-by-side).
- User confirms style is in the same visual family as the reference with acceptable tolerance.
- No noticeable frame-time regression at default settings on the current test machine.

## Dependencies & Risks
- **Risk:** Over-darkening or over-contrast can crush base color gradients.  
  **Mitigation:** conservative defaults and capped ridge contribution.
- **Risk:** Resolution-dependent spacing drift.  
  **Mitigation:** drive spacing in pixel-aware terms and verify at both captured resolutions.
- **Risk:** Scope creep through excessive control additions.  
  **Mitigation:** enforce minimal control set in MVP and defer extras.

## Implementation Outline
### Phase 1: Parameter Contract and Control Surface
- [x] Define new ridge config keys and defaults in `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html`: `GLASS_RIDGES_ENABLED`, `GLASS_RIDGES_STRENGTH`, `GLASS_RIDGES_SPACING`, `GLASS_RIDGES_DISTORTION`.
- [x] Remove legacy `GLASS_LINES_*` controls from `CONTROL_DEFS` and add exactly four minimal ridge controls.
- [x] Wire new output uniforms and runtime config assignment.

### Phase 2: Output Shader Ridge Logic
- [x] Replace segmented stripe generation with continuous ridge profile logic in `outputFragmentSource`.
- [x] Introduce low-frequency optical warp to avoid perfectly rigid geometry while keeping stability.
- [x] Keep brightness response secondary and bounded so ridges remain visible in darker zones.
- [x] Validate exact no-op behavior when effect is disabled.

### Phase 3: Visual Tuning and Verification
- [ ] Compare side-by-side against reference/current videos at fixed checkpoints (~0.5s, ~1.5s, ~2.5s each run).
- [ ] Tune default ridge parameters for closest style match within accepted tolerance.
- [ ] Verify behavior at both captured resolutions and in reduced-motion path.

### Phase 4: Final Validation and Documentation
- [ ] Run manual interaction sweep for new controls (toggle, extremes, reset, reload persistence).
- [ ] Confirm no regressions in existing particle contour/background texture look.
- [ ] Capture follow-up learning in `docs/solutions/` if new gotcha/pattern is discovered.

## AI-Era Notes
- Brainstorm-first workflow was used to lock the target visual outcome before defining implementation phases.
- Visual parity remains a human-reviewed gate; automated checks are supportive but not sufficient for artistic acceptance.

## References & Research
### Internal References
- Config defaults and persistence: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:299`
- Output compositing shader: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:666`
- Current glass-lines math block: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:724`
- Output uniform registry: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:922`
- Output uniform assignment at render time: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:1197`
- Dynamic control definitions: `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:1367`

### Institutional Learnings
- `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/solutions/ui-bugs/contour-noise-not-visible-particle-pipeline-20260211.md:1`

### Related Work
- Brainstorm input: `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/brainstorms/2026-02-12-glass-reference-parity-continuous-ridges-brainstorm.md`
- Prior glass-lines plan: `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/plans/2026-02-11-feat-glass-lines-overlay-filter-plan.md`
