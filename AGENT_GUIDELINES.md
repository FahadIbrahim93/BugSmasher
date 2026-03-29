# Agent Guidelines

## Product Goals
- Preserve responsive gameplay loop latency and deterministic progression outcomes.
- Keep cloud persistence backward-compatible and privacy-conscious.
- Treat lint, tests, and production build as mandatory release gates.

## Coding Standards
- Gameplay/business rules belong in `src/game/*` domain modules, not React UI glue.
- Prefer explicit interfaces over broad `any` objects at module boundaries.
- Guard stat math with floors/caps where runaway values can break balancing.
- Remove dead/diagnostic logs from production paths unless they are structured and intentional.

## Testing Standards
- Minimum gate checks:
  1. `npm run lint`
  2. `npm run test`
  3. `npm run build`
- Add edge/failure test cases whenever stateful gameplay logic changes.

## Communication & Handoff
- Track work through `TASKBOARD.md` task IDs.
- Record blockers with exact command output snippets.
- Keep commit scope atomic and auditable.
