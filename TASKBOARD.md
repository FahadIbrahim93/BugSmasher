# BugSmasher AAA Transformation Taskboard

## Vision
Deliver a production-hardened arcade survivor with deterministic core logic, typed state boundaries, and repeatable verification.

## Execution Board
| ID | Task | Dependency | Owner | Status |
|---|---|---|---|---|
| G-01 | Baseline type-safety audit | None | Agent | ✅ Done |
| G-02 | Fix user progression schema mismatch | G-01 | Agent | ✅ Done |
| G-03 | Extract upgrade progression service | G-01 | Agent | ✅ Done |
| G-04 | Add deterministic/unit verification suite | G-03 | Agent | ✅ Done |
| G-05 | Define agent collaboration standards | None | Agent | ✅ Done |
| G-06 | Verify lint + build + tests | G-02,G-03,G-04 | Agent | ✅ Done |

## Logbook Protocol
Each execution entry must include:
1. **Task ID**
2. **Summary**
3. **Date/Time (UTC)**
4. **Agent**
5. **Issues/risks discovered**
6. **Acceptance criteria and observed evidence**

## Collaboration/Code Standards
- TypeScript strictness: no new `any` in app-facing state.
- Feature logic extracted from UI components where practical.
- Every gameplay rules change requires automated test evidence.
- No hidden persistence schema changes without explicit migration notes.
- Keep pull requests atomic with reproducible command logs.
