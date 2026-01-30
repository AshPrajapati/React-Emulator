# Roadmap: React Emulator

## Overview

Build a browser-based React code playground with zero-friction editing and instant preview. Start with the editor shell and split-pane layout, add JSX transformation pipeline with Babel, integrate sandboxed preview execution with React hooks, strengthen error handling for graceful failures, then polish with persistence and console output. Each phase delivers a coherent capability that unblocks the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Editor Shell + Layout** - Monaco editor with split-pane UI ✓
- [ ] **Phase 2: Transformation Pipeline** - Babel JSX-to-JS transformation
- [ ] **Phase 3: Preview Execution** - Sandboxed iframe with React rendering
- [ ] **Phase 4: Error Handling** - Multi-layer error capture and display
- [ ] **Phase 5: Polish & Persistence** - localStorage, console output, formatting

## Phase Details

### Phase 1: Editor Shell + Layout
**Goal**: User has a professional code editor with split-pane layout
**Depends on**: Nothing (first phase)
**Requirements**: EDIT-01, EDIT-02, EDIT-03
**Success Criteria** (what must be TRUE):
  1. User sees Monaco editor with JSX syntax highlighting
  2. User sees split-pane layout with editor left, preview placeholder right
  3. User can resize the split pane by dragging divider
  4. Code typed in editor flows to state (no transformation yet)
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Initialize Vite project and integrate Monaco editor ✓
- [x] 01-02-PLAN.md — Implement split-pane layout and verify editor shell ✓

### Phase 2: Transformation Pipeline
**Goal**: JSX code transforms to executable JavaScript
**Depends on**: Phase 1 (need editor output to transform)
**Requirements**: None (enables PREV requirements)
**Success Criteria** (what must be TRUE):
  1. User code with JSX syntax transforms to plain JavaScript
  2. Transformation happens after 300ms debounce (not every keystroke)
  3. React/hooks are auto-injected (user doesn't need manual imports)
  4. Transform errors are caught and don't crash the app
**Plans**: 1 plan

Plans:
- [ ] 02-01-PLAN.md — Babel integration and debounced transformation

### Phase 3: Preview Execution
**Goal**: Transformed code executes in isolated preview with React support
**Depends on**: Phase 2 (need transformed code to execute)
**Requirements**: PREV-01, PREV-02, PREV-03
**Success Criteria** (what must be TRUE):
  1. Preview updates automatically as user types (with debounce)
  2. Preview runs in sandboxed iframe (sandbox="allow-scripts" only)
  3. React hooks work in preview (useState, useEffect, useRef, etc.)
  4. User can write React components and see them render live
**Plans**: TBD

Plans:
- [ ] 03-01: TBD during planning

### Phase 4: Error Handling
**Goal**: Syntax and runtime errors display gracefully without crashing
**Depends on**: Phase 3 (need execution to handle errors)
**Requirements**: PREV-04, PREV-05, PREV-06
**Success Criteria** (what must be TRUE):
  1. User sees error message when code has syntax errors (transform failures)
  2. User sees error message when code throws runtime errors (execution failures)
  3. User can view console.log output in a console panel
  4. Errors in preview don't crash editor or lose user code
**Plans**: TBD

Plans:
- [ ] 04-01: TBD during planning

### Phase 5: Polish & Persistence
**Goal**: Code persists across sessions and formatting/reset tools work
**Depends on**: Phase 4 (need stable execution before polish)
**Requirements**: PERS-01, PERS-02
**Success Criteria** (what must be TRUE):
  1. Code persists in localStorage across browser refresh
  2. User can reset editor to default starter code
  3. User can format code with Prettier
  4. Console panel displays logs/warnings/errors from preview
**Plans**: TBD

Plans:
- [ ] 05-01: TBD during planning

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Editor Shell + Layout | 2/2 | Complete ✓ | 2026-01-29 |
| 2. Transformation Pipeline | 0/1 | Not started | - |
| 3. Preview Execution | 0/TBD | Not started | - |
| 4. Error Handling | 0/TBD | Not started | - |
| 5. Polish & Persistence | 0/TBD | Not started | - |