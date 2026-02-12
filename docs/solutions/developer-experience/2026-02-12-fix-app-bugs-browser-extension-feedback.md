---
module: Agent Debug Workflow
date: 2026-02-12
problem_type: developer_experience
component: tooling
symptoms:
  - Visual parity debugging required many manual screenshot handoffs from the user.
  - The run did not converge quickly because the workflow context was split across skill rules, extension rules, and ad-hoc steps.
  - It was hard to tell when to stay in lightweight browser workflow vs when to switch into strict fix-app-bugs Enhanced flow.
root_cause: missing_workflow_step
resolution_type: workflow_improvement
severity: high
tags: [fix-app-bugs, browser-extension, visual-parity, workflow, debugging, agent-experience]
---

# Feedback: `fix-app-bugs` + Browser Extension Workflow (for next AI agent)

## Goal
Передать следующему агенту конкретный список улучшений, чтобы визуальные баги (как glass/reference parity) проходили быстрее, с меньшим количеством ручных шагов и с более предсказуемым качеством доказательств.

## Context
- Date: 2026-02-12
- Domain: WebGL visual parity debugging (`glass` effect mismatch)
- Inputs observed:
  - Reference/current videos and many screenshot pairs.
  - Workflow docs:
    - `/Users/vladimirpuskarev/.codex/skills/fix-app-bugs/SKILL.md`
    - `/Users/vladimirpuskarev/Library/Mobile Documents/com~apple~CloudDocs/Codex/Browser Extension/AGENTS.md`
    - `/Users/vladimirpuskarev/.codex/skills/fix-app-bugs/references/final-report-template.md`

## What Worked
1. `fix-app-bugs` has strong guardrails:
   - explicit instrumentation gate,
   - fallback mode rules,
   - required final report format.
2. Browser extension docs clearly separate `Core mode` and `Enhanced mode`.
3. The process encourages evidence over assumptions, which is correct for visual regressions.

## Main Frictions
1. **Mode selection overhead at session start**
   - Repeated uncertainty: should this task run in lightweight Core flow or strict Enhanced flow.
   - Result: delayed execution and extra coordination.

2. **Too much manual evidence transfer for visual parity**
   - User had to share many screenshots manually.
   - Missing one-command capture bundle for parity checkpoints (reference/current/diff/metrics in one place).

3. **No standard artifact schema for visual cases**
   - For parity tasks, evidence can be scattered (images in chat, local outputs, ad-hoc notes).
   - Hard to hand off consistently between agents.

4. **High reporting friction for iterative visual tuning**
   - Full strict reporting is excellent for final bug closure, but heavy during exploratory cycles.
   - A lightweight interim report format is missing.

5. **Weak bridge between extension commands and fix-app-bugs expectations**
   - Extension and skill both document commands well, but not as a single "visual parity happy path".
   - New agent has to compose workflow manually each time.

## Improvement Backlog (handoff to next AI agent)

### P1: Add single-command Visual Parity Bundle
**Target:** browser extension + CLI wrapper  
**Action:**
- Add a command (example): `npm run agent:parity-bundle -- --session <id> --reference <path> --label <name>`
- Command should capture:
  - headed screenshot,
  - optional headless screenshot,
  - `compare-reference` artifacts (`runtime.json`, `metrics.json`, `summary.json`),
  - compact markdown summary.
**Done when:**
- One command creates a deterministic folder with all artifacts.
- Folder path is printed in terminal and ready to paste into reports/plans.

### P1: Add explicit mode decision helper
**Target:** `fix-app-bugs` skill + extension docs  
**Action:**
- Add a 5-7 line decision tree at top of both docs:
  - "Use Core when ...",
  - "Use Enhanced when ...",
  - "Switch trigger conditions".
**Done when:**
- Another agent can choose mode in under 30 seconds without asking clarification questions.

### P1: Add visual-debug starter script
**Target:** `fix-app-bugs` scripts  
**Action:**
- Create a wrapper script that:
  - runs guarded bootstrap,
  - validates app URL match,
  - runs minimal scenario capture,
  - prints next command based on mode (`browser-fetch` vs `terminal-probe`).
**Done when:**
- Agent can start a visual bug session with one command and zero manual sequencing.

### P2: Introduce interim report format for iterative loops
**Target:** `fix-app-bugs` references  
**Action:**
- Add `interim-visual-report-template.md` with 3 blocks:
  - Hypothesis delta,
  - Evidence delta,
  - Next step.
- Keep 5-block report mandatory only for final closure.
**Done when:**
- Iteration notes stay structured without forcing full final template each cycle.

### P2: Define standard evidence folder contract
**Target:** extension + skill docs  
**Action:**
- Standardize directory pattern, example:
  - `output/parity/<date>-<ticket-or-topic>/<run-id>/`
- Required files:
  - `actual.png`, `reference.png`, `diff.png`,
  - `runtime.json`, `metrics.json`, `summary.json`,
  - `notes.md`.
**Done when:**
- Handoffs between agents always include the same predictable artifact shape.

### P3: Add "visual mismatch stop rule"
**Target:** workflow docs  
**Action:**
- Add explicit threshold for abandoning style-tuning branch (for example after N failed parity cycles).
- Require conversion into rollback + retrospective plan when threshold is hit.
**Done when:**
- Team avoids endless tuning loops with no convergence.

## Suggested implementation order for next AI agent
1. P1 parity bundle command.
2. P1 mode decision helper in both docs.
3. P1 visual-debug starter script.
4. P2 interim report template + evidence folder contract.
5. P3 stop-rule update.

## Validation checklist for improvements
- [ ] New agent can reproduce a visual parity run end-to-end without manual screenshot exchange.
- [ ] Mode choice is explicit and documented at run start.
- [ ] Artifacts are complete and machine-checkable.
- [ ] Final closure still supports required 5-block report for Enhanced runs.

## References
- `/Users/vladimirpuskarev/.codex/skills/fix-app-bugs/SKILL.md`
- `/Users/vladimirpuskarev/.codex/skills/fix-app-bugs/references/final-report-template.md`
- `/Users/vladimirpuskarev/Library/Mobile Documents/com~apple~CloudDocs/Codex/Browser Extension/AGENTS.md`
- `/Users/vladimirpuskarev/Documents/Humans Refresh/docs/plans/2026-02-12-fix-remove-glass-effect-and-capture-tooling-feedback-plan.md`
