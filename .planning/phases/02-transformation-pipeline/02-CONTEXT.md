# Phase 2: Transformation Pipeline - Context

**Gathered:** 2026-01-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Babel JSX-to-JS transformation — taking user code from the editor and converting it to executable JavaScript. This phase focuses on the transformation logic only; preview execution is Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Import Handling
- User must write explicit imports (e.g., `import React from 'react'`)
- React resolves to the bundled React (not CDN)
- If user imports unavailable packages (like axios), show clear error message: "[package] is not available"
- Only React and React hooks are available for now

### Transform Feedback
- No loading indicator during transformation (it's fast enough)
- Preview updates silently when transformation succeeds

### Claude's Discretion
- Success confirmation UX (subtle or none)
- Whether to show transformed JS code for debugging (hidden by default is fine)
- Exact error message format for unavailable imports

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard Babel standalone approaches. User expects imports to work like a real React app.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-transformation-pipeline*
*Context gathered: 2026-01-29*
