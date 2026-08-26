# CLAUDE.md — can-compliance

## Project Overview
Compliance-focused monorepo (pnpm workspace).

## Technology Stack
pnpm workspace monorepo. Use `pnpm install --frozen-lockfile` and `pnpm build`.

## CI
`pnpm install --frozen-lockfile && pnpm build`.

## AI Agent Rules
- Add dependencies to the specific workspace package that needs them, not the root, unless genuinely shared.
- This repo has not had a full security/architecture audit in this engagement — verify auth/data patterns directly rather than assuming.

## Definition of Done
`pnpm build` passes across the whole workspace.
