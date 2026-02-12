---
title: fix: Remove glass effect, mark experiment as failed, and capture tooling feedback
type: fix
date: 2026-02-12
brainstorm: /Users/vladimirpuskarev/Documents/Humans Refresh/docs/brainstorms/2026-02-12-glass-reference-parity-continuous-ridges-brainstorm.md
---

# fix: Remove glass effect, mark experiment as failed, and capture tooling feedback

## Overview
Remove the current glass effect from the render pipeline, classify the recent glass parity effort as unsuccessful, and produce structured feedback on the debugging workflow that used `fix-app-bugs` and the browser extension stack. This plan focuses on product outcome quality first: if the effect does not match reference quality, it should be removed rather than tuned indefinitely.

## Problem Statement / Motivation
The current visual result is still perceived as synthetic line artifacts instead of convincing glass behavior. Continuing to polish this branch risks time burn without confidence in convergence. In parallel, the team needs concrete feedback on where the `fix-app-bugs` + browser extension workflow helped, where it slowed execution, and what should change for the next visual-debug cycle.

## Found Brainstorm Context (Step 0)
Found brainstorm from **2026-02-12**: **glass-reference-parity-continuous-ridges**. Using as context for planning.

What carries forward:
- Visual fidelity to reference is the primary acceptance gate.
- Control-set compatibility is secondary and can be changed/removed.
- If parity is not achieved, simplify rather than keep additive complexity.

What changes in this new plan:
- The chosen direction is no longer refinement of glass ridges.
- The direction is explicit rollback/removal plus retrospective documentation.

## Repository & Learnings Research (Step 1)
### Repo findings
- Glass defaults and persistence keys are centralized in `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:299`.
- Output shader glass logic currently runs inside `outputFragmentSource` in `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:666` and glass ridge composition block starts at `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:724`.
- Output uniform wiring includes glass ridge uniforms in `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:949`.
- Runtime uniform assignment for glass ridge keys happens in `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:1224`.
- Glass controls are schema-defined in `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:1394`.

### Institutional learnings
- Relevant parity lesson: `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/solutions/ui-bugs/contour-noise-not-visible-particle-pipeline-20260211.md:70`.
- Key insight: visual acceptance must be judged in final compositing output, not intermediate intent.
- `critical-patterns.md` was not found in this repository, so no mandatory cross-cutting pattern file is currently available.

### Tooling workflow findings for feedback scope
- `fix-app-bugs` enforces guarded bootstrap, explicit instrumentation mode, and fallback behavior in `/Users/vladimirpuskarev/.codex/skills/fix-app-bugs/SKILL.md:33`.
- `fix-app-bugs` requires five-block final reporting in `/Users/vladimirpuskarev/.codex/skills/fix-app-bugs/SKILL.md:129` and `/Users/vladimirpuskarev/.codex/skills/fix-app-bugs/references/final-report-template.md:3`.
- Browser extension workflow requires explicit `Core mode` vs `Enhanced mode` declaration in `/Users/vladimirpuskarev/Library/Mobile Documents/com~apple~CloudDocs/Codex/Browser Extension/AGENTS.md:17`.

## External Research Decision (Step 1.5)
Decision: **skip external research**.

Reason: this is an internal rollback + process-retrospective task with strong local evidence, no security/payment/privacy risk, and no framework uncertainty that requires outside best-practice lookup.

## Stakeholders
- End users/design stakeholders: need clean visuals without the failed glass artifact.
- Developers: need a clear rollback target and reduced shader/control complexity.
- Agent/tooling maintainers: need actionable feedback on `fix-app-bugs` and browser extension workflow quality.

## SpecFlow Analysis (Step 3)
### User Flow Overview
1. Reviewer opens app and confirms current glass artifact mismatch against reference.
2. Glass effect is removed from runtime behavior and controls.
3. Reviewer re-checks baseline scene and confirms no residual glass lines/ridges.
4. Team records this attempt as an unsuccessful experiment with evidence links.
5. Team captures structured feedback on debugging workflow (what worked, what failed, what to improve).
6. Follow-up issue(s) for tooling improvements are created from that feedback.

### Flow Permutations Matrix
| Flow | Context | Expected result |
|---|---|---|
| Visual baseline check | `BG_TEXTURE_ENABLED=1` | No glass pattern, stable background/particle output |
| Visual baseline check | `BG_TEXTURE_ENABLED=0` | No glass pattern, no regression in particle readability |
| Reload persistence | Existing saved config had `GLASS_RIDGES_*` keys | App ignores old glass keys without errors |
| Reduced-motion path | `prefers-reduced-motion` enabled | Render output remains clean and consistent |
| Feedback run in Core mode | extension only | Feedback includes non-guarded workflow observations |
| Feedback run in Enhanced mode | extension + `fix-app-bugs` | Feedback includes bootstrap/mode/cleanup/reporting friction |

### Missing Elements & Gaps
- **Category:** Experiment tracking policy  
  **Gap:** No single “failed experiment” template currently exists in this repo.  
  **Impact:** Risk of inconsistent postmortems.
- **Category:** Tooling feedback schema  
  **Gap:** No standardized feedback rubric currently exists for `fix-app-bugs` + extension pairing.  
  **Impact:** Feedback may be anecdotal and hard to act on.

### Critical Questions Requiring Clarification
1. **Important:** Should failed experiment status live under `docs/solutions/` (with `resolution_type: unsuccessful`) or in a dedicated `docs/retros/` space?  
   Assumption if unanswered: keep it in `docs/solutions/workflow-issues/` for discoverability.
2. **Important:** Is one combined feedback document enough, or do we need separate feedback docs for Core mode and Enhanced mode?  
   Assumption if unanswered: one doc with two clearly separated sections.

## Proposed Solution
Ship a rollback-first issue:
- Remove glass effect behavior and controls from the active app path.
- Keep non-glass particle pipeline behavior intact.
- Add a concise failed-experiment record with links to reference/current captures.
- Produce a structured tooling feedback memo with explicit findings and prioritized improvement actions for `fix-app-bugs` and browser extension usage.

## Technical Considerations
- Keep rollback targeted to glass-specific keys/logic only; avoid unrelated shader refactors.
- Validate that stale localStorage keys do not break boot or produce undefined behavior.
- Keep final visual validation at output stage and include headed evidence.
- Use the existing five-block reporting expectations from `fix-app-bugs` when evaluating Enhanced mode run quality.

## Acceptance Criteria
- [ ] `index.html` no longer applies glass ridge compositing logic in the output pass (`/Users/vladimirpuskarev/Documents/Humans Refresh/index.html`).
- [ ] `index.html` no longer exposes `GLASS_RIDGES_*` controls in `CONTROL_DEFS` (`/Users/vladimirpuskarev/Documents/Humans Refresh/index.html`).
- [ ] App renders without visual glass lines/ridges in baseline and textured scenes.
- [ ] Existing saved configs containing old glass keys do not cause runtime errors.
- [ ] A failed experiment document is created and linked from this plan (target: `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/solutions/workflow-issues/2026-02-12-glass-reference-parity-unsuccessful.md`).
- [ ] Tooling feedback document is created with sections: strengths, friction points, evidence quality, and prioritized improvements (target: `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/solutions/developer-experience/2026-02-12-fix-app-bugs-browser-extension-feedback.md`).
- [ ] Feedback explicitly compares `Core mode` vs `Enhanced mode` usage implications.

## Success Metrics
- Visual sign-off confirms that the previous glass artifact is fully absent.
- No new regressions are reported in particle contour/background readability after glass removal.
- Feedback doc yields at least 3 concrete, implementable tooling improvements with clear owners/follow-up issues.

## Dependencies & Risks
- **Risk:** Removing glass may unintentionally alter unrelated color/composite balance.  
  **Mitigation:** compare before/after captures at fixed checkpoints.
- **Risk:** Retrospective becomes subjective.  
  **Mitigation:** require evidence links and command/output excerpts per finding.
- **Risk:** Scope drift into redesigning tooling immediately.  
  **Mitigation:** this issue only captures feedback and creates follow-up tasks.

## Implementation Outline
### Phase 1: Glass Rollback Scope Definition
- [ ] Confirm all glass touchpoints in `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html` (`DEFAULTS`, uniforms, output shader block, control definitions).
- [ ] Define exact removal scope so non-glass controls and particle pipeline remain untouched.

### Phase 2: Visual Validation After Rollback
- [ ] Capture verification screenshots/video using existing local flow and store artifacts under `/Users/vladimirpuskarev/Documents/Humans Refresh/output/playwright/`.
- [ ] Validate both animated and reduced-motion rendering paths.

### Phase 3: Failed Experiment Documentation
- [ ] Write failed experiment note in `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/solutions/workflow-issues/2026-02-12-glass-reference-parity-unsuccessful.md`.
- [ ] Include: hypothesis, what was tried, why it failed against reference, and decision to remove.
- [ ] Link source evidence files (reference video, current video, checkpoint captures).

### Phase 4: Tooling Feedback Capture (`fix-app-bugs` + browser extension)
- [ ] Create `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/solutions/developer-experience/2026-02-12-fix-app-bugs-browser-extension-feedback.md`.
- [ ] Evaluate workflow against required contracts in `/Users/vladimirpuskarev/.codex/skills/fix-app-bugs/SKILL.md` and `/Users/vladimirpuskarev/Library/Mobile Documents/com~apple~CloudDocs/Codex/Browser Extension/AGENTS.md`.
- [ ] Record concrete findings in four buckets: onboarding friction, instrumentation reliability, evidence quality, report/cleanup overhead.
- [ ] Add prioritized follow-up actions (P1/P2/P3) and candidate owner per action.

## AI-Era Notes
- Rapid iteration created many visual attempts quickly; this plan intentionally formalizes stop criteria and retrospective capture so future agent runs converge faster.
- Human visual judgment remains the final parity gate even when tooling provides metrics.

## References & Research
### Internal References
- `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:299`
- `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:666`
- `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:724`
- `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:949`
- `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:1224`
- `/Users/vladimirpuskarev/Documents/Humans Refresh/index.html:1394`
- `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/brainstorms/2026-02-12-glass-reference-parity-continuous-ridges-brainstorm.md`
- `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/plans/2026-02-12-fix-glass-reference-parity-continuous-ridges-plan.md`
- `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/solutions/ui-bugs/contour-noise-not-visible-particle-pipeline-20260211.md`

### Workflow References
- `/Users/vladimirpuskarev/.codex/skills/fix-app-bugs/SKILL.md:33`
- `/Users/vladimirpuskarev/.codex/skills/fix-app-bugs/SKILL.md:129`
- `/Users/vladimirpuskarev/.codex/skills/fix-app-bugs/references/final-report-template.md:3`
- `/Users/vladimirpuskarev/Library/Mobile Documents/com~apple~CloudDocs/Codex/Browser Extension/AGENTS.md:17`
- `/Users/vladimirpuskarev/Library/Mobile Documents/com~apple~CloudDocs/Codex/Browser Extension/AGENTS.md:47`

### Evidence Artifacts
- `/Users/vladimirpuskarev/Library/Caches/com.apple.SwiftUI.Drag-116C8AAA-BED1-4CCB-A44A-09268AC98F7D/CleanShot 2026-02-11 at 22.18.12.mp4`
- `/Users/vladimirpuskarev/Library/Caches/com.apple.SwiftUI.Drag-B7EDB4C4-412A-4427-90C0-BEE71A121007/CleanShot 2026-02-12 at 12.44.37.mp4`
- `/Users/vladimirpuskarev/Documents/Humans Refresh/output/playwright/ridges-compare/ref_t0.5.png`
- `/Users/vladimirpuskarev/Documents/Humans Refresh/output/playwright/ridges-compare/new_t0.5.png`
