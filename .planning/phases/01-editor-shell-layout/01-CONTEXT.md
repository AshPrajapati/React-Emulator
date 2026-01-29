# Phase 1: Editor Shell + Layout - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Monaco editor with split-pane UI — the shell before transformation exists. User sees a professional code editor on the left and preview placeholder on the right. Code flows to state but no transformation or execution yet.

</domain>

<decisions>
## Implementation Decisions

### Split Pane Behavior
- Default split ratio: 50/50 (equal space for editor and preview)
- Allow full collapse: user can drag to collapse either pane entirely
- Resize handle: always visible draggable bar between panes
- Layout: always side-by-side (no responsive stacking on mobile)

### Editor Appearance
- Theme: dark theme (VS Code dark style)
- Line numbers: visible, always shown in gutter
- Minimap: hidden (more space for code)
- Font size: 14px

### Starter Code
- Content: Hello World minimal component
- Style: clean code, no comments
- Imports: show explicit import statements (e.g., `import React from 'react'`)

### Preview Placeholder
- Initial state: empty box matching editor theme (dark)
- Background: matches editor theme (dark preview for dark editor)

### Claude's Discretion
- Preview pane header/toolbar presence and design
- Exact resize handle styling
- Specific starter code implementation

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User wants a VS Code-like experience with clean, professional feel.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-editor-shell-layout*
*Context gathered: 2026-01-29*
