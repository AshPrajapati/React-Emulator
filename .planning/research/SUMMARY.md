# Project Research Summary

**Project:** React Code Playground
**Domain:** Browser-based code playgrounds/emulators
**Researched:** 2026-01-29
**Confidence:** HIGH

## Executive Summary

React code playgrounds follow a well-established 4-component architecture: Editor (Monaco), Transformer (Babel), Executor (iframe), and Preview. The pattern is consistent across major implementations (CodeSandbox, Sandpack, StackBlitz) and optimized for isolation, security, and real-time feedback. For a Vite-based, single-file React playground, the recommended approach uses Monaco Editor with @babel/standalone for in-browser JSX transformation, sandboxed iframe for secure preview isolation, and debounced updates (300ms) to optimize the transformation pipeline.

The technology stack is mature and battle-tested: React 19.2.4 with automatic JSX transform, Monaco Editor (0.55.1) via @monaco-editor/react wrapper (4.6.0), @babel/standalone (7.26.0) for JSX transformation, and esm.sh CDN for npm imports. All major libraries have stable versions with React 19 support and are actively maintained. The architecture is proven in production by major playgrounds and requires no experimental technologies.

Key risks center around security (unsafe iframe execution), performance (transformation on every keystroke), and error handling (async errors not caught by boundaries). These are well-documented pitfalls with proven mitigations: use sandbox="allow-scripts" (never allow-same-origin), implement debouncing before adding transformation, and combine error boundaries with global error listeners. The domain has clear established patterns, making this a low-risk implementation with high confidence in technical decisions.

## Key Findings

### Recommended Stack

The stack leverages industry-standard tools used across all major code playgrounds. Monaco Editor provides the same experience developers know from VS Code, with built-in IntelliSense and syntax highlighting. Babel standalone is the proven choice for in-browser JSX transformation (used by CodePen, JSFiddle, Babel REPL), handling all modern React features including the new automatic JSX transform. The iframe-based preview with postMessage communication is the security standard for isolating untrusted code execution.

**Core technologies:**
- **React 19.2.4** + **react-dom 19.2.4**: Latest stable with new `use` API and form actions — modern framework with automatic JSX transform support
- **@monaco-editor/react 4.6.0**: Monaco integration wrapper — handles lifecycle/cleanup automatically, zero webpack config needed
- **monaco-editor 0.55.1**: Code editor engine — industry standard (VS Code), superior TypeScript/IntelliSense support
- **@babel/standalone 7.26.0**: JSX transformation in browser — standard for browser-based compilation, supports React 19, no build step
- **esm.sh CDN**: Load npm packages in browser — modern ESM CDN with automatic dependency resolution and React 19 support
- **Sandboxed iframe**: Isolate preview code — security isolation prevents access to parent window, standard pattern across all playgrounds
- **react-error-boundary 6.1.0**: Catch React errors — functional component API for error boundaries, better DX than class components
- **Vite 7.3.1**: Build tool — already chosen, fast HMR, modern ESM support

**Alternatives considered and rejected:**
- CodeMirror 6 over Monaco: Less familiar to developers, requires more manual configuration for React features
- Sucrase/esbuild-wasm over Babel: Not designed for browser use / larger bundle and overkill for single-file
- Skypack over esm.sh: Less actively maintained, esm.sh has better React 19 support
- WebContainer over iframe: Overkill (full Node.js runtime not needed), licensing concerns, unnecessary complexity

### Expected Features

Research across major playgrounds (CodeSandbox, StackBlitz, JSFiddle, React.dev, TypeScript Playground) reveals a clear hierarchy of expected features. Table stakes are non-negotiable for a functional playground, differentiators provide competitive advantage, and anti-features should be explicitly avoided as they introduce massive complexity for pet project scope.

**Must have (table stakes):**
- **Live preview updates** — users expect to see changes immediately (debounced 300-500ms)
- **Syntax highlighting** — professional editor feel, provided by Monaco out of box
- **Basic error display** — users need to know when code breaks (runtime + compile errors)
- **Code persistence** — losing work is unacceptable (localStorage minimum)
- **Split-pane layout** — industry standard (editor left, preview right)
- **JSX/React syntax support** — core requirement with Babel transformation
- **Console output** — debug without browser DevTools (intercept console.log/error/warn)
- **Clear/Reset** — recover from broken state
- **Basic formatting** — code should look clean (Prettier integration)

**Should have (competitive):**
- **IntelliSense/autocomplete** — professional DX, Monaco provides this with React types configured
- **Error boundary** — preview doesn't white-screen on error, graceful degradation
- **Theme switching** — dark/light mode for editor and preview
- **Shareable URLs** — encode code in URL or use backend storage for collaboration

**Defer (v2+):**
- **Import external libraries** — requires bundler or advanced CDN resolution (high complexity)
- **Multiple file support** — file tree, module resolution, multiple editors (high complexity)
- **TypeScript support** — type checking and TS transform (medium complexity, not essential for MVP)
- **Hot module reload** — preserve component state across edits (medium complexity)

**Anti-features (explicitly avoid):**
- Multi-user real-time collaboration — massive complexity, low value for pet project
- User accounts/authentication — infrastructure overhead
- Git integration — over-engineered for playground use case
- Deployment features — turns playground into hosting platform
- Full npm package search UI — catalog complexity

### Architecture Approach

The recommended architecture follows the proven 4-component pattern: Editor → Transformer → Executor → Preview. User types in Monaco editor, code flows to TransformLayer which debounces (300ms) then uses Babel to transform JSX to JavaScript, transformed code is sent via postMessage to sandboxed iframe, and React component renders in isolated preview context. Errors bubble to Error Boundary for graceful handling. This unidirectional data flow with iframe isolation prevents user code from accessing parent, allows complete React context reset on updates, and enables proper error isolation.

**Major components:**
1. **EditorPane** — Code input with Monaco, syntax highlighting, onChange events flow raw code string to TransformLayer
2. **TransformLayer** — Debounces (300ms) to prevent rapid transforms, uses @babel/standalone for JSX→JS, handles transformation errors, wraps code with React context
3. **PreviewPane** — Manages iframe lifecycle, sends transformed code via postMessage, handles security with sandbox attribute
4. **PreviewIframe** — Executes user code in isolated context, renders React with createRoot, catches errors with Error Boundary, reports errors back to parent

**Key patterns to follow:**
- **Iframe isolation with srcdoc**: Render preview in sandboxed iframe (sandbox="allow-scripts" only), prevents user code from accessing parent window, allows clean React context reset, used by CodeSandbox, StackBlitz, CodePen
- **Debounced transformation**: Delay code transformation until user stops typing (300ms standard), reduces expensive Babel transforms, prevents jittery preview updates
- **Multi-layer error handling**: Error Boundary for render errors + window.addEventListener('error') for async errors + window.addEventListener('unhandledrejection') for promise rejections
- **Code wrapping**: Inject React and hooks into execution context so users don't need manual imports (`const { useState, useEffect } = React;`)
- **PostMessage communication**: All parent↔iframe communication via postMessage, event-driven and non-blocking

**Anti-patterns to avoid:**
- Direct DOM rendering in parent (security risk, memory leaks)
- eval() without error handling (syntax errors crash preview)
- Transforming on every keystroke (blocks UI, wastes CPU)
- Using iframe.src instead of srcdoc (extra network request, CSP issues)
- Synchronous iframe communication (race conditions, breaks isolation)

### Critical Pitfalls

1. **Unsafe iframe execution without proper sandboxing** — User code executes with full access to parent page, allowing malicious code to steal data or access cookies/localStorage. NEVER combine `allow-same-origin` + `allow-scripts` (defeats sandbox). Use `sandbox="allow-scripts"` only, use postMessage for communication, always validate event.origin. Must be addressed in Phase 1 (MVP) — security is non-negotiable.

2. **No infinite loop protection** — User writes `while(true) {}`, freezing entire browser tab with no recovery except closing tab. For MVP, accept that infinite loops will freeze preview, provide clear "Stop/Refresh" button, use separate iframe that doesn't affect editor. Advanced solutions (loop guards, Web Workers) should be deferred to post-MVP. Phase 1 decision — choose execution model early.

3. **Re-transforming code on every keystroke** — Running Babel transform on every character typed causes severe lag and poor typing experience. Update editor state immediately (no transform needed for typing feedback), debounce transform + render by 300-500ms, only transform when user pauses typing. Must address in Phase 1 — core UX issue, debouncing is simple.

4. **Error boundaries don't catch async errors** — User code throws errors in useEffect, setTimeout, or event handlers. Error boundary doesn't catch them, entire app crashes with white screen. Use multi-layer approach: Error Boundary for render errors + window.addEventListener('error') for async errors + window.addEventListener('unhandledrejection') for promise rejections. Phase 1 — critical for decent error handling, layers 1+2 are simple.

5. **Missing React import with automatic JSX transform** — Code uses JSX but doesn't import React. Works in modern React 17+ with automatic JSX transform, but fails if playground doesn't configure Babel correctly. Use automatic JSX transform in Babel configuration: `presets: [['react', { runtime: 'automatic' }]]`. Phase 1 — affects all JSX code, must decide on transform strategy in MVP.

## Implications for Roadmap

Based on research, suggested phase structure follows the critical dependency chain: establish UI boundaries first, build transformation independently, integrate execution, add error resilience, then optimize. This order allows parallel development where possible while respecting hard dependencies.

### Phase 1: Editor Shell + Layout
**Rationale:** Establishes UI layout and component boundaries before adding complex transformation logic. Monaco integration and basic state flow can be validated independently. No transformation or execution yet — pure UI work.

**Delivers:**
- Monaco editor integrated with @monaco-editor/react
- Split-pane layout (editor left, empty preview iframe right)
- Basic state management (code flows from editor to preview placeholder)
- Monaco configuration (theme, options, syntax highlighting)

**Addresses:**
- Table stakes: Syntax highlighting, split-pane layout
- Sets up proper component boundaries to avoid editor memory leaks (Pitfall 7)
- Establishes separate editor vs preview state to prevent cursor issues (Pitfall 11, 14)

**Avoids:**
- Monaco memory leaks by using @monaco-editor/react wrapper (handles disposal automatically)
- Lost focus issues by keeping editor separate from preview updates
- Cursor jumping by using proper controlled/uncontrolled approach

**Research needed:** None — Monaco React integration is well-documented, standard patterns apply.

### Phase 2: Transformation Pipeline
**Rationale:** Builds core JSX transformation independently of UI/execution. Can be tested in isolation before integration. Establishes debouncing pattern early to prevent performance pitfalls.

**Delivers:**
- @babel/standalone integration with automatic JSX transform
- TransformLayer component with debouncing (300ms)
- Transform error detection and basic display
- Code wrapping to inject React/hooks context

**Uses:**
- @babel/standalone 7.26.0 with React preset
- Automatic JSX runtime configuration (`runtime: 'automatic'`)

**Addresses:**
- Core transformation from JSX to executable JavaScript
- Automatic JSX transform to avoid React import requirement (Pitfall 5)

**Avoids:**
- Re-transforming on every keystroke by implementing debouncing first (Pitfall 3)
- Missing React import errors by configuring automatic transform (Pitfall 5)
- Transform errors breaking the app by wrapping in try-catch

**Research needed:** None — Babel standalone transformation is straightforward, well-documented.

### Phase 3: Preview Execution
**Rationale:** Combines transformation with execution in isolated iframe. Requires transformation from Phase 2 to work. Implements core security pattern with sandboxed iframe.

**Delivers:**
- Sandboxed iframe with srcdoc template
- PostMessage communication between parent and iframe
- Code execution via Function constructor in iframe
- React component rendering with createRoot
- Basic preview refresh on code changes

**Implements:**
- PreviewPane component (manages iframe)
- PreviewIframe template (srcdoc HTML with React runtime)
- PostMessage protocol for code execution

**Addresses:**
- Table stakes: Live preview updates
- End-to-end code execution from editor to preview
- useState/hooks functionality in preview (Pitfall 15)

**Avoids:**
- Unsafe iframe execution by using sandbox="allow-scripts" only (Pitfall 1)
- Preview not refreshing by using srcdoc approach (Pitfall 8)
- Direct DOM manipulation in parent (Anti-pattern 1)

**Research needed:** None — iframe sandboxing and postMessage are standard browser APIs with clear documentation.

### Phase 4: Error Handling & Resilience
**Rationale:** Adds resilience to working system. User code WILL break, so graceful error handling must be included before considering it production-ready.

**Delivers:**
- Error Boundary component in preview iframe
- Global error listeners (window error, unhandledrejection)
- Formatted error display in preview pane
- Transform error messages with line numbers
- Error state management separate from editor state

**Uses:**
- react-error-boundary 6.1.0 for functional error boundaries
- Global window event listeners for async errors
- Babel error location data (line/column numbers)

**Addresses:**
- Table stakes: Basic error display
- Better error messages for transform failures (Pitfall 9)
- Editor state preservation during preview errors (Pitfall 6)

**Avoids:**
- Error boundaries missing async errors by implementing global listeners (Pitfall 4)
- Cryptic transform errors by formatting Babel errors nicely (Pitfall 9)
- Editor losing content when preview crashes (Pitfall 6)

**Research needed:** None — React error boundaries and global error handlers are well-documented patterns.

### Phase 5: Polish & Optimization
**Rationale:** Optimizes working system with table stakes features like persistence, console output, and formatting. These enhance UX but aren't blocking for core functionality.

**Delivers:**
- localStorage code persistence (auto-save on debounce)
- Console output capture with postMessage
- Console panel UI to display logs/errors/warnings
- Format code button with Prettier
- Clear/Reset functionality
- Loading states (transforming, running, error)
- Basic theme switching (Monaco theme configuration)

**Addresses:**
- Table stakes: Code persistence, console output, clear/reset, basic formatting
- Console logs disappearing in preview (Pitfall 12)
- No indication of transform/execution state (Pitfall 13)

**Avoids:**
- Losing user work by implementing auto-save
- Hidden console output by intercepting and displaying logs

**Research needed:** None — localStorage, Prettier integration, console interception are standard patterns.

### Phase Ordering Rationale

- **Phase 1 (Editor) must precede Phase 3 (Execution):** Need editor UI to input code before execution makes sense
- **Phase 2 (Transform) can be developed in parallel with Phase 1:** Transformation logic is independent of UI, can be tested separately
- **Phase 3 (Execution) depends on Phase 2 (Transform):** Need transformed code to execute in preview
- **Phase 4 (Errors) depends on Phase 3 (Execution):** Can only handle execution errors after execution works
- **Phase 5 (Polish) can start once Phase 3 works:** Basic execution enables testing persistence, console, formatting

**Critical path:** Phase 1 → Phase 3 (need editor and execution for MVP)
**Parallel opportunities:** Phase 2 can be built/tested while Phase 1 UI is being refined

**Architecture-driven grouping:**
- Phases 1-3 build the core pipeline (Editor → Transform → Preview)
- Phase 4 adds error resilience to all components
- Phase 5 enhances UX with persistence and debugging tools

**Pitfall avoidance strategy:**
- Security (Pitfall 1) addressed immediately in Phase 3 with proper iframe sandboxing
- Performance (Pitfall 3) addressed in Phase 2 with debouncing before adding transformation
- Error handling (Pitfall 4) gets dedicated phase before considering MVP complete
- All critical pitfalls have explicit mitigation in phase deliverables

### Research Flags

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Editor Shell):** Monaco React integration is well-documented, thousands of implementations to reference
- **Phase 2 (Transformation):** Babel standalone has clear documentation, JSX transform is standard
- **Phase 3 (Preview Execution):** iframe sandboxing and postMessage are foundational browser APIs, extensively documented
- **Phase 4 (Error Handling):** React error boundaries and global error listeners are standard patterns with official docs
- **Phase 5 (Polish):** localStorage, Prettier, console interception are well-established patterns

**Phases requiring deeper research during planning:**
- None for MVP scope — all patterns are proven and well-documented

**Post-MVP features that would need research:**
- **External library imports:** Would need to research esbuild-wasm integration, import maps, or CDN URL rewriting strategies
- **Multiple file support:** Would need to research virtual file systems, module resolution, file tree UI patterns
- **TypeScript support:** Would need to research Monaco TypeScript workers, ts.transpileModule, type checking in browser
- **Infinite loop protection:** Would need to research AST transformation for loop guards or Web Worker execution patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All recommended libraries are actively maintained with stable versions, used in production by major playgrounds (CodePen, JSFiddle, CodeSandbox, VS Code Web), React 19 support verified across all dependencies |
| Features | MEDIUM | Feature analysis based on major competitors (StackBlitz, JSFiddle, Sandpack, Monaco playground, TypeScript Playground), table stakes are clear consensus, some competitors had limited access for detailed comparison |
| Architecture | HIGH | 4-component pattern (Editor→Transform→Execute→Preview) is consistent across all major implementations, verified with official docs (MDN iframe, React createRoot, Babel standalone, Monaco React wrapper) |
| Pitfalls | MEDIUM | Verified via official documentation for critical items (iframe security, error boundaries, Monaco disposal) and GitHub issues from major playground projects (CodeSandbox, Sandpack, react-live), specific performance characteristics need validation in implementation |

**Overall confidence:** HIGH

The technology stack and architecture patterns are proven and battle-tested. All critical paths use stable, actively maintained libraries with clear documentation. The main sources of uncertainty are in competitive feature analysis (some sites had limited access) and specific performance timings (debounce intervals, transform speed), but these have reasonable defaults from community practice.

### Gaps to Address

- **CodeSandbox feature comparison incomplete:** Main competitor site had limited access, some feature details inferred from GitHub issues and community discussions. Gap is acceptable for pet project — clear understanding of table stakes features, full competitive analysis not critical.

- **Performance benchmarks not quantified:** Debounce timing (300ms), transform speed (10-50ms), bundle sizes (Monaco ~3MB, Babel ~2.5MB) are estimates from community reports, not measured in target environment. Mitigation: Start with community-standard values (300ms debounce), profile during implementation, adjust if needed.

- **Infinite loop protection deferred:** Research identified problem but recommended accepting limitation for MVP (manual refresh). If this becomes user-facing issue, deeper research needed on AST transformation for loop guards or Web Worker isolation patterns. Acceptable for MVP scope.

- **Import resolution strategy not decided:** Research identified options (block with error, support via CDN rewriting, full bundling) but deferred decision to post-MVP. Phase 2 should include clear error message if user attempts imports. If external libraries become priority, research esm.sh integration patterns or import map strategies.

- **Accessibility not researched:** Code playground accessibility (screen readers, keyboard navigation, color contrast) not included in research scope. Monaco has accessibility features built-in, but should validate during implementation. For pet project, rely on Monaco's built-in accessibility and validate with basic keyboard-only testing.

## Sources

### Primary (HIGH confidence)
- React 19.2.4 Release: https://github.com/facebook/react/releases — Verified latest stable version, new features
- Monaco Editor: https://github.com/microsoft/monaco-editor (v0.55.1) — Editor capabilities, configuration options
- @monaco-editor/react: https://github.com/suren-atoyan/monaco-react (v4.6.0) — React wrapper lifecycle, disposal handling
- Babel Standalone: https://babeljs.io/docs/babel-standalone — JSX transformation, automatic runtime config
- Vite Releases: https://github.com/vitejs/vite/releases (v7.3.1) — Build tool compatibility
- MDN iframe sandbox: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe — Security model, sandbox attributes
- MDN postMessage: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage — Cross-context communication security
- React Error Boundaries: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary — Error handling limitations
- React createRoot: https://react.dev/reference/react-dom/client/createRoot — Modern rendering API
- react-error-boundary: https://github.com/bvaughn/react-error-boundary (v6.1.0) — Functional error boundaries

### Secondary (MEDIUM confidence)
- esm.sh: https://esm.sh/ — Modern ESM CDN service, verified via official site, community adoption
- Sandpack architecture: https://github.com/codesandbox/sandpack — Reference implementation patterns (high-level analysis)
- CodeSandbox/Sandpack GitHub issues — Real-world pitfalls at scale, error handling patterns
- react-live GitHub issues — Live preview specific challenges, transformation pitfalls
- Monaco Editor GitHub issues — Editor integration problems, memory leak discussions
- TypeScript Playground analysis — Feature comparison via UI examination
- JSFiddle feature list — Analyzed via site interface
- StackBlitz marketing site — Feature claims (WebContainer, instant startup)

### Tertiary (LOW confidence)
- Debounce timing recommendations (300ms) — Community practice consensus, not formally benchmarked for this specific stack
- Code wrapping patterns — Inferred from playground behavior, not formally documented
- Performance characteristics (Babel transform 10-50ms) — Based on community reports, hardware-dependent
- CodeSandbox current features — Training data + GitHub issues, main site had access limitations

---
*Research completed: 2026-01-29*
*Ready for roadmap: yes*
