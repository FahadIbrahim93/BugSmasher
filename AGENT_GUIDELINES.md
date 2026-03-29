# Agent Guidelines

## Product Goals
- Prioritize responsive gameplay and deterministic combat progression.
- Maintain cloud-save stability and backward-compatible user data.
- Treat lint/build/test as release gates.

## Coding Standards
- Keep UI logic in React components; move game rules into domain modules.
- Prefer typed interfaces over anonymous object shapes.
- Ensure upgrade logic is centralized and test-covered.
- Avoid dead code and unused imports in runtime files.

## Testing Policy
- Required checks before merge:
  1. `npm run lint`
  2. `npm run test`
  3. `npm run build`
- Tests must validate both happy-path and failure/edge constraints.

## Communication Protocol
- Use task IDs from `TASKBOARD.md` in implementation notes.
- Document blockers with direct command output.
- If a check is skipped due environment constraints, record exact reason.
