# React Emulator

## What This Is

A browser-based React code playground with a two-pane interface: Monaco editor on the left for writing code, live preview on the right that updates as you type. Think CodeSandbox or StackBlitz, but focused on quick React prototyping.

## Core Value

Write React code and instantly see it render — zero setup, zero friction.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Two-pane layout (editor left, preview right)
- [ ] Monaco editor with syntax highlighting
- [ ] Live preview that updates as user types
- [ ] React imports work (`useState`, `useEffect`, etc.)
- [ ] Single file editing

### Out of Scope

- Multiple files — deferred to future phase
- Third-party npm packages — deferred to future phase
- File tree/project management — deferred to future phase
- Saving/sharing code — not in phase 1
- Authentication — pet project, not needed

## Context

Personal pet project for React prototyping. No external users or deployment requirements for now. Focus on getting the core editing and preview loop working smoothly.

## Constraints

- **Tech stack**: Vite + React + Monaco Editor — user preference
- **Scope**: Single file only for phase 1

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monaco over CodeMirror | VS Code familiarity, better React/JSX support | — Pending |
| Vite as build tool | Fast HMR, modern defaults | — Pending |
| Single file first | Reduce complexity, get core loop working | — Pending |

---
*Last updated: 2026-01-29 after initialization*
