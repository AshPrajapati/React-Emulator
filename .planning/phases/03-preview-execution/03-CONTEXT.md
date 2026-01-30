# Phase 3: Preview Execution - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Sandboxed iframe execution of transformed JSX code with React rendering. User writes React components in the editor and sees them render live in the preview pane. Error handling display is Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Render Behavior
- Auto-detect exported component (find any exported component or JSX expression)
- Render single component only (not multiple top-level components)
- Show error overlay when render fails (red message overlays preview)

### React Environment
- React 18 (latest version)
- Keep simple — React core only, no ReactDOM advanced APIs
- Sandboxed iframe with `sandbox="allow-scripts"` only

### Preview Appearance
- Dark background (#1e1e1e) matching VS Code/editor theme
- Consistent with existing dark theme aesthetic

### Hot Reload Feel
- Simple approach — full re-render on code change is acceptable
- No state preservation required (clean slate each update)

### Claude's Discretion
- Which React hooks to expose (sensible defaults for playground)
- Re-render strategy (full vs incremental)
- Transition effects or flash handling
- Exact error overlay styling

</decisions>

<specifics>
## Specific Ideas

- Keep implementation simple — this is a pet project playground
- Match the dark aesthetic already established in Phase 1

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-preview-execution*
*Context gathered: 2026-01-30*
