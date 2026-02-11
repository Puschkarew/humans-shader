---
status: pending
priority: p2
issue_id: "001"
tags: [code-review, tooling, config]
dependencies: []
---

# Avoid Machine-Specific Browser Debug URL in Repo

## Problem Statement

The review flow updated the tracked Browser Debug config with a machine/session-specific app URL. If committed as-is, teammates may inherit an invalid default target and get bootstrap mismatches.

## Findings

- `appUrl` changed from `http://localhost:3000` to `http://127.0.0.1:4173/index.html` in `/Users/vladimirpuskarev/Documents/Humans Refresh/.codex/browser-debug.json:4`.
- Loopback domain allowlist was expanded in `/Users/vladimirpuskarev/Documents/Humans Refresh/.codex/browser-debug.json:14`.
- This was introduced by `bootstrap_guarded.py --apply-recommended` and is likely environment-specific.

## Proposed Solutions

### Option 1: Revert `.codex/browser-debug.json` before commit

**Approach:** Keep local changes uncommitted and restore repo baseline for shared config.

**Pros:**
- Prevents team-wide config drift.
- No behavior change for app runtime.

**Cons:**
- Local bootstrap may need manual `--actual-app-url` each session.

**Effort:** 5 minutes

**Risk:** Low

---

### Option 2: Keep new URL and standardize local server port in docs

**Approach:** Treat `4173` as project default and update docs/scripts accordingly.

**Pros:**
- Consistent bootstrap target for this static project.

**Cons:**
- Requires process change and team agreement.
- Can still break if someone uses a different port.

**Effort:** 20-30 minutes

**Risk:** Medium

---

### Option 3: Parameterize app URL via env or per-user local override

**Approach:** Keep tracked defaults generic and load user-specific URL from an untracked override.

**Pros:**
- Best long-term flexibility.
- Avoids repeated diffs in tracked config.

**Cons:**
- Requires adding override logic.

**Effort:** 1-2 hours

**Risk:** Medium

## Recommended Action

To be filled during triage.

## Technical Details

**Affected files:**
- `/Users/vladimirpuskarev/Documents/Humans Refresh/.codex/browser-debug.json:4`
- `/Users/vladimirpuskarev/Documents/Humans Refresh/.codex/browser-debug.json:14`

**Related components:**
- `fix-app-bugs` bootstrap flow
- Browser Extension capture domain checks

## Resources

- Review context: local uncommitted diff on `master`
- Skill used: `workflows-review`

## Acceptance Criteria

- [ ] Team confirms whether `.codex/browser-debug.json` is shared-default or local-only.
- [ ] Commit does not include unintended machine-specific URL changes.
- [ ] Browser debug bootstrap still works with agreed project convention.

## Work Log

### 2026-02-11 - Initial Review Capture

**By:** Codex

**Actions:**
- Reviewed uncommitted diffs in `index.html` and `.codex/browser-debug.json`.
- Found one important process risk in tracked debug config.
- Recorded finding as file-based todo.

**Learnings:**
- The shader changes appear functionally coherent.
- Tooling auto-fixes can create commit noise in tracked project config.

## Notes

- This is process/tooling risk, not a runtime particle rendering bug.
