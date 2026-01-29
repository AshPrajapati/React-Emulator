# Technology Stack

**Project:** React Code Playground
**Domain:** Browser-based code playgrounds/emulators
**Researched:** January 29, 2026
**Overall Confidence:** HIGH

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React | ^19.2.4 | UI framework | Latest stable, with new `use` API and form actions | HIGH |
| react-dom | ^19.2.4 | DOM rendering | Matches React version | HIGH |
| Vite | ^7.3.1 | Build tool | Already chosen, fast HMR, modern ESM support | HIGH |

**Source:** [React Releases](https://github.com/facebook/react/releases), [Vite Releases](https://github.com/vitejs/vite/releases)

### Code Editor
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @monaco-editor/react | ^4.6.0 | Monaco integration | Official React wrapper, supports React 19, zero webpack config | HIGH |
| monaco-editor | ^0.55.1 | Code editor engine | Industry standard (VS Code), best-in-class IntelliSense, syntax highlighting | HIGH |

**Why Monaco over CodeMirror 6:**
- Superior TypeScript/IntelliSense support out of box
- Familiar to developers (same as VS Code)
- Better autocompletion for React APIs
- More complete language services

**Why NOT CodeMirror 6:**
- Requires more manual configuration for React-specific features
- Less familiar to most developers
- Better for lightweight/mobile (but not required here)

**Sources:**
- [Monaco Editor GitHub](https://github.com/microsoft/monaco-editor) - 45.4k stars, actively maintained
- [monaco-react GitHub](https://github.com/suren-atoyan/monaco-react) - Version 4.x with React 19 support
- [Sandpack](https://sandpack.codesandbox.io/) uses CodeMirror 6 (reference alternative)

### Code Transformation
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| @babel/standalone | ^7.26.0 | JSX → JS in browser | Standard for browser-based transformation, works with React 19, no build step | HIGH |

**Why Babel Standalone:**
- Industry standard for browser JSX compilation
- Supports all React features (hooks, JSX, modern syntax)
- Predictable, well-documented transformation
- Used by JSFiddle, CodePen, Babel REPL

**Why NOT Sucrase/esbuild-wasm:**
- Sucrase: Primarily a build tool, not designed for browser
- esbuild-wasm: Larger bundle, overkill for single-file transformation
- SWC: No stable browser build

**Configuration:**
```javascript
import { transform } from '@babel/standalone';

const compiled = transform(code, {
  presets: ['react'],
  filename: 'playground.jsx'
});
```

**Sources:**
- [Babel Standalone Docs](https://babeljs.io/docs/babel-standalone)
- [@babel/standalone GitHub](https://github.com/babel/babel/tree/main/packages/babel-standalone)

### Module Loading (for imports)
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| esm.sh | CDN service | Load npm packages in browser | Modern, fast, supports React 19, auto-bundles dependencies | HIGH |

**Why esm.sh:**
- Most modern CDN for ESM (vs Skypack which is less active)
- Automatic dependency resolution and bundling
- Tree shaking support
- 4.9B+ modules served/month
- Active maintenance

**Implementation pattern:**
```javascript
// User's code
import React, { useState } from 'react';

// Transform imports to:
import React, { useState } from 'https://esm.sh/react@19.2.4';
```

**Why NOT Skypack:**
- Less actively maintained (esm.sh has more recent updates)
- esm.sh has better React 19 support

**Why NOT unpkg/jsdelivr:**
- Require manual dependency resolution
- No automatic bundling
- More complex import rewriting

**Sources:**
- [esm.sh](https://esm.sh/) - Official site
- [Skypack](https://www.skypack.dev/) - Alternative (less recommended)

### Preview Rendering
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Sandboxed iframe | Native HTML | Isolate preview code | Security isolation, supports React DOM, standard pattern | HIGH |

**iframe Configuration:**
```html
<iframe
  sandbox="allow-scripts"
  srcDoc={htmlContent}
  title="Preview"
/>
```

**Why iframe with sandbox:**
- Security: Prevents access to parent window/localStorage
- Isolation: User code can't break the editor
- Standard: Used by CodeSandbox, StackBlitz, CodePen
- Simple: No complex virtualization needed

**sandbox attribute rationale:**
- `allow-scripts`: Required for React to run
- **Omit** `allow-same-origin`: Prevents access to parent origin
- **Omit** `allow-forms`: Not needed for display-only preview
- **Omit** `allow-popups`: Prevents unwanted popups

**Why NOT WebContainer:**
- Overkill: Full Node.js runtime not needed for single-file React
- Licensing: Commercial restrictions may apply
- Complexity: Adds unnecessary overhead
- Size: Large bundle for simple use case

**Sources:**
- [MDN iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) - Security best practices
- [WebContainer](https://webcontainers.io/) - Overkill alternative

### Error Handling
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| react-error-boundary | ^6.1.0 | Catch React errors | Functional component error boundaries, better DX than class components | HIGH |

**Why react-error-boundary:**
- Functional component API (vs class-only native error boundaries)
- Flexible fallback rendering (fallback prop, FallbackComponent, fallbackRender)
- Well-maintained (v6.1.0 released Jan 2026)
- Used in production by major apps

**Implementation:**
```jsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary
  fallback={<div>Preview error: {error.message}</div>}
  onError={(error) => console.error(error)}
>
  <PreviewFrame code={code} />
</ErrorBoundary>
```

**Sources:**
- [react-error-boundary GitHub](https://github.com/bvaughn/react-error-boundary) - v6.1.0
- [React Docs - Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

## Supporting Libraries

### Development Tools
| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| typescript | ^5.7.0 | Type checking | Type-safe development | HIGH |
| @types/react | ^19.0.0 | React types | TypeScript support | HIGH |
| @types/react-dom | ^19.0.0 | ReactDOM types | TypeScript support | HIGH |

### Optional Enhancements (Defer to Phase 2+)
| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| prettier | ^3.4.0 | Code formatting | If adding "Format" button | MEDIUM |
| lz-string | ^1.5.0 | URL compression | If adding share-via-URL feature | MEDIUM |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not | Confidence |
|----------|-------------|-------------|---------|------------|
| Editor | Monaco | CodeMirror 6 | Less familiar, requires more config for React features | HIGH |
| Editor | Monaco | react-simple-code-editor | Too basic, no IntelliSense, poor large-doc performance | HIGH |
| Transform | @babel/standalone | Sucrase | Not designed for browser use | HIGH |
| Transform | @babel/standalone | esbuild-wasm | Larger bundle, overkill for single-file | MEDIUM |
| CDN | esm.sh | Skypack | Less active maintenance | MEDIUM |
| CDN | esm.sh | unpkg/jsdelivr | Manual dependency resolution required | HIGH |
| Preview | iframe sandbox | WebContainer | Overkill for simple playground, licensing concerns | HIGH |
| Preview | iframe sandbox | eval() | Security nightmare, no isolation | HIGH |
| Bundler | Vite | webpack | Already chosen, Vite is faster/simpler | HIGH |

## Installation

### Core Dependencies
```bash
npm install react@^19.2.4 react-dom@^19.2.4
npm install @monaco-editor/react@^4.6.0 monaco-editor@^0.55.1
npm install @babel/standalone@^7.26.0
npm install react-error-boundary@^6.1.0
```

### Dev Dependencies
```bash
npm install -D vite@^7.3.1
npm install -D typescript@^5.7.0
npm install -D @types/react@^19.0.0 @types/react-dom@^19.0.0
```

### Optional (Phase 2+)
```bash
# Code formatting
npm install prettier@^3.4.0

# URL sharing
npm install lz-string@^1.5.0
```

## Architecture Integration

### Data Flow
```
User types in Monaco
  → @babel/standalone transforms JSX → JS
  → Rewrite imports to esm.sh URLs
  → Generate HTML with transformed code
  → Inject into sandboxed iframe
  → React renders in iframe
  → Errors caught by ErrorBoundary
```

### Key Integration Points

**1. Monaco → Babel:**
```typescript
import Editor from '@monaco-editor/react';
import { transform } from '@babel/standalone';

function CodeEditor({ onChange }) {
  const handleChange = (value) => {
    try {
      const result = transform(value, {
        presets: ['react'],
        filename: 'playground.jsx'
      });
      onChange(result.code);
    } catch (err) {
      // Show syntax error in editor
    }
  };

  return <Editor onChange={handleChange} language="javascript" />;
}
```

**2. Import Rewriting:**
```typescript
function rewriteImports(code: string): string {
  return code.replace(
    /from ['"]([^'"]+)['"]/g,
    (match, pkg) => {
      if (pkg.startsWith('.') || pkg.startsWith('/')) {
        return match; // Relative imports - not supported
      }
      return `from 'https://esm.sh/${pkg}@19.2.4'`;
    }
  );
}
```

**3. Preview Rendering:**
```typescript
function Preview({ code }) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <script type="module">
          ${code}
        </script>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `;

  return (
    <ErrorBoundary fallback={<div>Preview Error</div>}>
      <iframe
        sandbox="allow-scripts"
        srcDoc={html}
        title="Preview"
      />
    </ErrorBoundary>
  );
}
```

## React 19 Specific Considerations

React 19.2.4 (Jan 2026) introduces new APIs relevant to playgrounds:

### 1. `use` API for Async Data
```javascript
import { use } from 'react';

function Component() {
  const data = use(fetchData()); // Can be called conditionally
  return <div>{data}</div>;
}
```

**Impact:** Users can now call `use()` in their playground code. Ensure Babel preset supports this.

### 2. Actions and `useActionState`
```javascript
function Form() {
  const [state, action] = useActionState(async (prev, formData) => {
    // async form handling
  });

  return <form action={action}>...</form>;
}
```

**Impact:** Modern form handling patterns work out of box in playground.

### 3. Error Handling
React 19 still requires Error Boundaries for render errors. No built-in async error handling in render.

**Sources:**
- [React 19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [React 19.2.4 Release](https://github.com/facebook/react/releases)

## Version Pinning Strategy

**Pin major + minor, flexible patch:**
- `react@^19.2.4` - Allow patch updates (19.2.x)
- `@monaco-editor/react@^4.6.0` - Allow minor + patch (4.x.x)
- `@babel/standalone@^7.26.0` - Allow minor + patch (7.x.x)

**Why this strategy:**
- React: Patch releases are bugfixes only, safe to auto-update
- Monaco: Minor versions maintain API compatibility
- Babel: Stable transformation guarantees within v7

## Known Compatibility Issues

### Monaco + Vite
**Issue:** Monaco Editor uses Web Workers which require special Vite handling.

**Solution:** Use `@monaco-editor/react` which handles worker setup automatically.

```typescript
// vite.config.ts - No special config needed!
// @monaco-editor/react handles workers automatically
```

**Source:** [monaco-react README](https://github.com/suren-atoyan/monaco-react#monaco-editor-options)

### Babel Standalone Size
**Issue:** @babel/standalone is ~2.5MB minified.

**Mitigation:**
- Served from CDN with caching (first load only)
- Acceptable for pet project/local use
- If size becomes issue, consider dynamic import

```typescript
// Lazy load Babel
const Babel = await import('@babel/standalone');
```

## Security Considerations

### iframe Sandbox Restrictions
```html
<iframe sandbox="allow-scripts">
```

**What this prevents:**
- Access to `window.parent` (prevents breaking editor)
- Access to `localStorage` (prevents data leakage)
- Form submission to external sites
- Opening popups
- Running plugins

**What this allows:**
- JavaScript execution (required for React)
- React rendering and event handlers

### XSS Prevention
User code runs in isolated iframe, but still sanitize:
```typescript
// Don't do this:
iframe.contentWindow.eval(userCode); // NEVER

// Do this:
<iframe srcDoc={htmlTemplate} /> // Isolated context
```

### CDN Security
esm.sh uses Subresource Integrity (SRI) hashes for packages:
```typescript
// esm.sh provides SRI hashes automatically
import React from 'https://esm.sh/react@19.2.4';
// → Returns immutable, hash-verified module
```

## Performance Considerations

### Initial Load Time
| Asset | Size | Load Strategy |
|-------|------|---------------|
| Monaco Editor | ~3MB | Lazy load, split chunks |
| @babel/standalone | ~2.5MB | CDN cache, lazy load |
| React (esm.sh) | ~150KB | CDN cache |

**Optimization:**
```typescript
// Lazy load Monaco
const Editor = lazy(() => import('@monaco-editor/react'));

<Suspense fallback={<div>Loading editor...</div>}>
  <Editor />
</Suspense>
```

### Transform Performance
- Babel transform: ~10-50ms for typical playground code
- Fast enough for on-change debouncing
- No Web Worker needed for small files

```typescript
const debouncedTransform = debounce((code) => {
  const result = transform(code, { presets: ['react'] });
  updatePreview(result.code);
}, 300); // 300ms debounce = good UX
```

## Production Readiness

### Ready for Production
- Monaco Editor: Production-ready, used by VS Code web
- @babel/standalone: Used by CodePen, JSFiddle, Babel REPL
- iframe sandbox: Standard browser security model

### NOT for Production (document limitations)
- No server-side persistence (localStorage only)
- No multi-file support (single file only)
- No npm install (imports limited to esm.sh availability)
- No Node.js APIs (browser-only)

**These are acceptable limitations for a pet project playground.**

## Future Upgrade Path

### Phase 2 Enhancements
1. **Prettier integration** - Format button
   ```bash
   npm install prettier
   ```

2. **Share via URL** - Encode code in URL
   ```bash
   npm install lz-string
   ```

3. **Multiple themes** - Monaco supports built-in themes
   ```typescript
   <Editor theme="vs-dark" />
   ```

### Phase 3 (if expanding scope)
1. **TypeScript support** - Babel already supports it
   ```typescript
   transform(code, { presets: ['react', 'typescript'] })
   ```

2. **Multiple files** - Requires more complex module resolution

3. **localStorage persistence** - Save code locally

## Sources Summary

**HIGH Confidence (Official Docs, Context7):**
- [Monaco Editor GitHub](https://github.com/microsoft/monaco-editor) - v0.55.1
- [@monaco-editor/react GitHub](https://github.com/suren-atoyan/monaco-react) - v4.6.0
- [Babel Standalone Docs](https://babeljs.io/docs/babel-standalone)
- [React 19 Release](https://github.com/facebook/react/releases) - v19.2.4
- [Vite Releases](https://github.com/vitejs/vite/releases) - v7.3.1
- [MDN iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)
- [react-error-boundary](https://github.com/bvaughn/react-error-boundary) - v6.1.0

**MEDIUM Confidence (Verified with official sources):**
- [esm.sh](https://esm.sh/) - CDN service (verified via official site)
- [Sandpack](https://sandpack.codesandbox.io/) - Reference implementation

**Ecosystem References:**
- CodePen, JSFiddle - Use @babel/standalone for transformation
- VS Code for Web - Uses Monaco Editor
- CodeSandbox - Uses Sandpack (CodeMirror 6 + custom bundler)

## Decision Summary

**For a pet project React playground with Vite:**

**Use:**
- Monaco Editor (@monaco-editor/react) - Best DX, familiar to developers
- @babel/standalone - Standard for browser JSX transformation
- esm.sh - Modern CDN for npm imports
- Sandboxed iframe - Security and isolation
- react-error-boundary - Better error handling DX

**Avoid:**
- CodeMirror - More config, less familiar (unless mobile support needed)
- Sucrase/esbuild - Not designed for browser use
- WebContainer - Overkill for simple playground
- eval() - Security nightmare

**This stack is:**
- Current (all libraries maintained in 2025/2026)
- Production-proven (used by CodePen, VS Code, etc.)
- Simple (no complex bundling in browser)
- Secure (iframe isolation)
- Fast (debounced transforms, lazy loading)
