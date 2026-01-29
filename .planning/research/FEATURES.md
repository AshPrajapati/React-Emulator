# Feature Landscape: React Code Playgrounds

**Domain:** Browser-based React code playgrounds
**Researched:** 2026-01-29
**Confidence:** MEDIUM (based on feature analysis of StackBlitz, JSFiddle, Sandpack, Monaco editor, TypeScript Playground)

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Live preview updates** | Core value prop - see changes immediately | Low | Must update as user types (debounced 300-500ms) |
| **Syntax highlighting** | Professional editor feel, readability | Low | Monaco provides this out of box |
| **Basic error display** | Users need to know when code breaks | Medium | Runtime errors, compile errors if using JSX transform |
| **Code persistence** | Losing work is unacceptable | Low | localStorage minimum, optionally URL state |
| **Split-pane layout** | Industry standard (editor left, preview right) | Low | Resizable is nice but not critical for pet project |
| **JSX/React syntax support** | Core requirement for React playground | Low | Monaco + Babel or similar transform |
| **Console output** | Debug without browser DevTools | Medium | Intercept console.log/error/warn in preview iframe |
| **Clear/Reset** | Recover from broken state | Low | Button to reset code to initial/default state |
| **Basic formatting** | Code should look clean | Low | Format on save or format button (Prettier) |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Instant startup** | No loading spinner, immediate productivity | Low-Medium | StackBlitz's key differentiator - pre-compile dependencies |
| **IntelliSense/autocomplete** | Professional DX, faster coding | Medium | Monaco provides this, needs React types configured |
| **Import external libraries** | Expand beyond vanilla React | High | Requires bundler (esbuild, Vite) or CDN resolution |
| **Multiple file support** | Real-world project structure | High | File tree, module resolution, multiple editors |
| **Theme switching** | Personalization, accessibility | Low | Dark/light mode for editor and preview |
| **Shareable URLs** | Collaboration, teaching, bug reports | Medium | Encode code in URL or use backend storage |
| **Export/Download** | Take code elsewhere, use locally | Low | Download as .jsx file or create-react-app template |
| **Hot module reload** | Preserve state across edits | Medium | HMR keeps component state during updates |
| **TypeScript support** | Type safety, modern DX | Medium | Monaco + TS transform, type checking |
| **Error boundary** | Preview doesn't white-screen on error | Medium | React error boundary with friendly error display |
| **Mobile responsive** | Use on tablet/phone | Medium | Touch-friendly, responsive layout |
| **Vim/Emacs keybindings** | Power users | Low | Monaco supports this via configuration |
| **Layout presets** | Vertical, horizontal, preview-only | Low | Quick layout switching for different use cases |
| **Import from GitHub Gist** | Quick start from existing code | Medium | Fetch and parse gist, load into editor |

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Multi-user real-time collaboration** | High complexity, low value for pet project | Shareable URLs sufficient for async collaboration |
| **Backend/API calls** | Security nightmare (CORS, rate limits), infrastructure burden | Mock data or document that users need CORS-enabled APIs |
| **Package.json editing** | Implies full npm ecosystem, massive scope creep | Pre-configure common libraries or use CDN imports only |
| **Git integration** | Over-engineered for playground use case | Export to file, let users handle git locally |
| **User accounts/auth** | Infrastructure overhead for pet project | localStorage or URL-based sharing only |
| **Full filesystem** | Complexity of file I/O, security concerns | Single file or limited multi-file (components only) |
| **Deployment** | Turns playground into hosting platform | Export code, link to Vercel/Netlify for deployment |
| **Version history** | Storage complexity, UI overhead | Simple undo/redo in editor sufficient |
| **npm package search UI** | Massive catalog, search/filter complexity | Pre-configured imports or raw CDN URLs |
| **Server-side rendering** | Complexity, infrastructure | Client-only React rendering |

## Feature Dependencies

```
Core dependency chain:
- Code editor (Monaco) → Syntax highlighting (built-in)
- JSX transform → Live preview
- Preview iframe → Console capture
- Error detection → Error display

Optional enhancement chain:
- URL encoding → Shareable links
- localStorage → Code persistence → Import/Export
- Theme system → Dark/light mode
- Error boundary → Friendly error display
- IntelliSense → Type definitions → TypeScript support

High-complexity features (defer):
- Multiple files → File tree → Module resolution
- External libraries → Bundler → Import resolution
```

## Feature Categories by Phase

### MVP (Single file, live preview)
**Goal:** Working playground with core editing + preview

Must have:
- Monaco editor with JSX syntax highlighting
- Live preview updates (debounced)
- Split-pane layout (editor left, preview right)
- Basic error display in preview
- useState/hooks support
- localStorage persistence
- Clear/reset button

Nice to have:
- Console output capture
- Format code button
- Theme switching (dark/light)

### Phase 2: Developer Experience
**Goal:** Professional editor feel

- IntelliSense/autocomplete for React APIs
- Better error messages with stack traces
- Error boundary with friendly display
- Prettier formatting on save
- Keybinding options (vim/emacs)
- Layout presets (vertical/horizontal)

### Phase 3: Sharing & Portability
**Goal:** Share and reuse code

- Shareable URLs (code in URL hash or short ID)
- Export to .jsx file
- Export to create-react-app template
- Import from GitHub Gist
- Copy shareable link button

### Post-MVP (Future considerations)
**Goal:** Advanced features (only if needed)

- Multiple file support (limited - components only)
- CDN library imports (React Router, Zustand, etc.)
- TypeScript support
- Hot module reload (preserve state)
- Mobile responsive layout

## Complexity Assessment

| Feature | Complexity | Reason |
|---------|-----------|--------|
| Live preview updates | LOW | Iframe refresh + debounce |
| Monaco integration | LOW | Well-documented library |
| JSX transform | MEDIUM | Babel standalone or similar |
| Console capture | MEDIUM | Iframe postMessage protocol |
| Error boundary | MEDIUM | React patterns + UI |
| IntelliSense | MEDIUM | Monaco config + type defs |
| URL sharing | MEDIUM | Encode/decode + compression |
| Theme switching | LOW | CSS variables + Monaco theme |
| Format code | LOW | Prettier integration |
| External libraries | HIGH | Bundler or CDN resolution |
| Multiple files | HIGH | Module system + file tree UI |
| TypeScript | MEDIUM | TS transform + type checking |
| HMR | MEDIUM | State preservation logic |

## Competitor Feature Matrix

| Feature | CodeSandbox | StackBlitz | JSFiddle | React.dev | TypeScript Playground | Recommendation for MVP |
|---------|-------------|------------|----------|-----------|----------------------|----------------------|
| Live preview | Yes | Yes | Yes | Yes | Yes | **MUST HAVE** |
| Monaco/VS Code editor | Yes | Yes | No | Yes | Yes | **MUST HAVE** |
| Syntax highlighting | Yes | Yes | Yes | Yes | Yes | **MUST HAVE** |
| Error display | Yes | Yes | Yes | Yes | Yes | **MUST HAVE** |
| Console output | Yes | Yes | Yes | No | Yes | **SHOULD HAVE** |
| IntelliSense | Yes | Yes | Limited | Yes | Yes | **NICE TO HAVE** |
| Multiple files | Yes | Yes | Yes | Limited | Yes | **DEFER** |
| External libraries | Yes | Yes | Yes | No | No | **DEFER** |
| Shareable URLs | Yes | Yes | Yes | Yes | Yes | **PHASE 2** |
| Themes | Yes | Yes | Yes | No | Yes | **NICE TO HAVE** |
| TypeScript | Yes | Yes | Yes | No | Yes | **DEFER** |
| Format code | Yes | Yes | Yes | No | Yes | **SHOULD HAVE** |
| Git integration | Yes | Yes | No | No | No | **ANTI-FEATURE** |
| Deployment | Yes | Yes | No | No | No | **ANTI-FEATURE** |
| Collaboration | Yes | Limited | No | No | No | **ANTI-FEATURE** |

## Recommendations for Pet Project

**Start with:**
1. Monaco editor with JSX syntax highlighting
2. Live preview in iframe (debounced updates)
3. Basic error display (try/catch boundaries)
4. localStorage code persistence
5. Clear/reset functionality

**Add next (Phase 2):**
1. Console output capture
2. Format code button
3. Dark/light theme toggle
4. Better error messages

**Consider later (Phase 3):**
1. Shareable URLs (code in hash)
2. Export to file
3. IntelliSense for React

**Avoid for pet project:**
- User accounts
- Backend/database
- Real-time collaboration
- Full npm package support
- Git integration
- Deployment features

## Feature Implementation Notes

### Live Preview Implementation Options

**Option A: Babel Standalone (Easiest)**
- Use `@babel/standalone` to transform JSX in browser
- Inject transformed code into iframe via srcdoc
- Pros: Simple, no build step
- Cons: Transform happens on every update, slower

**Option B: Pre-compile (Better performance)**
- Use esbuild or sucrase for fast JSX transform
- Transform on Web Worker to keep UI responsive
- Pros: Faster, doesn't block UI
- Cons: More setup complexity

**Recommendation:** Start with Babel standalone, optimize later if needed.

### Console Capture Pattern

```javascript
// In preview iframe
window.console = {
  log: (...args) => window.parent.postMessage({ type: 'console', level: 'log', args }, '*'),
  error: (...args) => window.parent.postMessage({ type: 'console', level: 'error', args }, '*'),
  warn: (...args) => window.parent.postMessage({ type: 'console', level: 'warn', args }, '*')
}
```

Parent listens to messages and displays in console panel.

### Error Boundary Pattern

Wrap preview in React error boundary that catches render errors and displays friendly message instead of white screen.

### localStorage Persistence Pattern

```javascript
// Auto-save on change (debounced)
useEffect(() => {
  const timer = setTimeout(() => {
    localStorage.setItem('playground-code', code)
  }, 1000)
  return () => clearTimeout(timer)
}, [code])

// Load on mount
useEffect(() => {
  const saved = localStorage.getItem('playground-code')
  if (saved) setCode(saved)
}, [])
```

## Sources

**HIGH confidence:**
- Monaco Editor features: https://github.com/microsoft/monaco-editor (official repo)
- Sandpack capabilities: https://github.com/codesandbox/sandpack (official repo)
- React.dev playground: https://react.dev/learn (official docs)

**MEDIUM confidence:**
- StackBlitz features: https://stackblitz.com (marketing site, verified WebContainer/instant startup claims)
- JSFiddle features: https://jsfiddle.net (feature list from site)
- TypeScript Playground: https://www.typescriptlang.org/play (feature analysis from UI)

**LOW confidence (domain knowledge from training):**
- CodeSandbox feature comparison (training data, not verified with current site)
- HMR implementation patterns (training data)
- Console capture patterns (standard web patterns)

## Confidence Assessment

**Overall confidence:** MEDIUM

**High confidence areas:**
- Table stakes features (well-established patterns)
- Monaco editor capabilities (official documentation)
- Basic JSX transform approaches (standard tooling)

**Medium confidence areas:**
- Competitor feature comparisons (some sources blocked/limited)
- Complexity estimates (based on general web development experience)
- Implementation patterns (standard but not verified for this specific stack)

**Low confidence areas:**
- CodeSandbox current feature set (site content not fully accessible)
- PlayCode features (site content not accessible)
- Latest 2026 differentiators (training data cutoff January 2025)

## Gaps to Address

- Could not fully access CodeSandbox feature list (main competitor)
- Could not access PlayCode features (alternative playground)
- Vite-specific integration patterns not researched in detail
- Performance benchmarks for different JSX transform approaches not quantified
- Accessibility requirements for code playgrounds not investigated

**Recommendation:** These gaps are acceptable for pet project planning. For production product, would need deeper competitive analysis and accessibility audit.
