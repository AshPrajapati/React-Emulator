# Domain Pitfalls: React Code Playground

**Domain:** Browser-based React code playgrounds
**Researched:** 2026-01-29
**Confidence:** MEDIUM (verified via official docs + GitHub issues from major playground projects)

## Critical Pitfalls

Mistakes that cause rewrites, security vulnerabilities, or major functional issues.

### Pitfall 1: Unsafe iframe Execution Without Proper Sandboxing

**What goes wrong:** User code executes with full access to parent page, allowing malicious code to steal data, manipulate DOM outside the preview, or access cookies/localStorage.

**Why it happens:** Developers create iframes for preview without understanding the `sandbox` attribute or use `allow-same-origin` + `allow-scripts` together (which disables most sandbox protections).

**Consequences:**
- XSS vulnerabilities
- User code can access parent page data
- Malicious code can redirect the entire page
- LocalStorage/cookies become accessible to user code

**Prevention:**
```html
<!-- WRONG: No sandbox or overly permissive -->
<iframe src="preview.html"></iframe>
<iframe sandbox="allow-scripts allow-same-origin" src="preview.html"></iframe>

<!-- CORRECT: Properly sandboxed -->
<iframe
  sandbox="allow-scripts"
  src="preview.html"
  referrerpolicy="no-referrer">
</iframe>
```

**Key principles:**
- NEVER combine `allow-same-origin` + `allow-scripts` (defeats sandbox)
- Use `postMessage()` for parent-iframe communication
- Always validate `event.origin` when receiving messages
- Never use `targetOrigin: "*"` when sending sensitive data

**Detection:**
- Can user code access `window.parent`?
- Can user code access `document.cookie` from parent?
- Test with malicious code: `window.top.location = 'http://evil.com'`

**Phase impact:** Must be addressed in Phase 1 (MVP) - security is non-negotiable.

**Sources:**
- MDN iframe sandbox: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe (HIGH confidence)
- MDN postMessage security: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage (HIGH confidence)

---

### Pitfall 2: No Infinite Loop Protection

**What goes wrong:** User writes `while(true) {}` or infinite recursion, freezing the entire browser tab. No way to recover without closing tab.

**Why it happens:** Code executes synchronously on main thread with no timeout mechanism. React's rendering + user code both block the same thread.

**Consequences:**
- Tab becomes completely unresponsive
- User loses all unsaved code
- Terrible user experience
- Makes playground unusable for experimentation

**Prevention:**

**Option A: Transform code to inject loop guards**
```javascript
// Transform while loops to include iteration counter
while (condition) {
  if (++__loopCounter > 10000) throw new Error('Infinite loop detected');
  // original code
}
```

**Option B: Execute in Web Worker with timeout**
```javascript
// Run user code in Worker, terminate if exceeds time
const worker = new Worker('executor.js');
const timeoutId = setTimeout(() => {
  worker.terminate(); // Kill worker after 5s
  showError('Code execution timeout');
}, 5000);

worker.postMessage(userCode);
```

**Option C: Use iframe with manual refresh**
- Accept that infinite loops will freeze preview
- Provide clear "Stop/Refresh" button
- Show warning about infinite loops
- Use separate iframe that doesn't affect editor

**Recommendation for MVP:** Option C (simplest). Options A/B are complex and should be post-MVP if needed.

**Detection:**
- Test with: `while(true) {}`
- Test with: `const f = () => f(); f();`
- Check if Stop button can interrupt execution

**Phase impact:** Phase 1 decision - choose execution model early. Option C for MVP, others require significant architecture.

**Sources:**
- Babel standalone limitations (MEDIUM confidence - official docs)
- Web Workers API for isolation (HIGH confidence - MDN docs)
- Real-world playgrounds like CodeSandbox use worker-based isolation (MEDIUM confidence - GitHub issues)

---

### Pitfall 3: Re-transforming Code on Every Keystroke

**What goes wrong:** Running Babel transform on every single character typed causes severe lag, poor typing experience, and wasted CPU cycles.

**Why it happens:** Naive implementation: `onChange` → `transform` → `render`. No debouncing or optimization.

**Consequences:**
- Editor feels sluggish, delayed response
- High CPU usage, fan noise on laptops
- Poor battery life on mobile devices
- Typing becomes frustrating
- Transform errors flash constantly while typing incomplete code

**Prevention:**

**For editor updates (typing feedback):**
- Update editor state immediately (no transform needed)
- Editor should feel instantaneous

**For preview updates:**
- Debounce transform + render by 300-500ms
- Only transform when user pauses typing

```javascript
// WRONG: Transform on every keystroke
const handleChange = (code) => {
  setCode(code);
  const transformed = transform(code); // Blocks on every key!
  setTransformed(transformed);
};

// CORRECT: Debounced transform
const handleChange = (code) => {
  setCode(code); // Immediate update for editor
};

useEffect(() => {
  const timer = setTimeout(() => {
    try {
      const transformed = transform(code);
      setTransformed(transformed);
      setError(null);
    } catch (err) {
      setError(err);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [code]);
```

**Additional optimizations:**
- Consider using `@babel/standalone` only for JSX transform (not full preset)
- Cache transform results for unchanged code
- Show loading indicator during transform

**Detection:**
- Type quickly in editor - does it lag?
- Check CPU usage while typing
- Measure time between keystroke and screen update

**Phase impact:** Must address in Phase 1 - core UX issue. Debouncing is simple, must be included in MVP.

**Sources:**
- Babel standalone performance warnings (HIGH confidence - official docs)
- Monaco React issues with performance (MEDIUM confidence - GitHub issues)
- Common pattern in CodeSandbox/Sandpack implementations (MEDIUM confidence)

---

### Pitfall 4: Error Boundaries Don't Catch Async Errors

**What goes wrong:** User code throws errors in `useEffect`, `setTimeout`, or event handlers. Error boundary doesn't catch them, entire app crashes with white screen.

**Why it happens:** React error boundaries only catch errors during rendering, not in async code or event handlers.

**Consequences:**
- Preview crashes completely
- User sees blank white screen instead of helpful error
- No way to recover without refresh
- Confusing UX - error seems to "break" the playground

**Prevention:**

**Understand what error boundaries DON'T catch:**
- Event handlers (`onClick`, `onChange`)
- Async code (`setTimeout`, `fetch`, `Promise.then`)
- Errors in the error boundary itself
- Server-side rendering errors

**Multi-layer error handling approach:**

```javascript
// Layer 1: Error boundary for render errors
class PreviewErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Layer 2: Global error handler for async errors
window.addEventListener('error', (event) => {
  // Catch uncaught errors from user code
  showErrorInPreview(event.error);
  event.preventDefault(); // Prevent console spam
});

window.addEventListener('unhandledrejection', (event) => {
  // Catch unhandled promise rejections
  showErrorInPreview(event.reason);
  event.preventDefault();
});

// Layer 3: Transform user code to wrap effects
// Wrap useEffect bodies in try/catch during transform
useEffect(() => {
  try {
    // user code
  } catch (err) {
    reportError(err);
  }
}, []);
```

**For MVP:** Use layers 1 + 2. Layer 3 is complex code transformation.

**Detection:**
- Test: `useEffect(() => { throw new Error('async error'); }, [])`
- Test: `setTimeout(() => { throw new Error('timeout error'); }, 100)`
- Test: `<button onClick={() => { throw new Error('handler error'); }}>Click</button>`
- Check if errors display nicely in preview

**Phase impact:** Phase 1 - critical for decent error handling. Layers 1+2 are simple, include in MVP.

**Sources:**
- React error boundary limitations (HIGH confidence - official React docs)
- react-live issues with error handling (MEDIUM confidence - GitHub issues)

---

### Pitfall 5: Missing React Import with Automatic JSX Transform

**What goes wrong:** Code uses JSX but doesn't import React. Works in modern React 17+ with automatic JSX transform, but fails if playground doesn't configure Babel correctly.

**Why it happens:**
- React 17+ introduced automatic JSX runtime (no React import needed)
- `@babel/standalone` defaults to classic transform (requires React import)
- Mismatch between what users expect and what transform provides

**Consequences:**
- Code that works in modern tooling breaks in playground
- Confusing error: `React is not defined`
- Users don't understand why they need `import React from 'react'`
- Breaks copy-paste from modern tutorials

**Prevention:**

**Option A: Use automatic JSX transform**
```javascript
import { transform } from '@babel/standalone';

const result = transform(code, {
  presets: [
    ['react', {
      runtime: 'automatic' // Use new JSX transform
    }]
  ],
});
```

**Option B: Auto-inject React import**
```javascript
const codeWithReact = `import React from 'react';\n${userCode}`;
const result = transform(codeWithReact, {
  presets: ['react']
});
```

**Option C: Provide React globally**
```javascript
// In preview iframe
window.React = React;
window.ReactDOM = ReactDOM;
// User code can reference React globally
```

**Recommendation:** Option A (automatic transform) - most modern, matches user expectations.

**Detection:**
- Test without import: `const App = () => <div>Hello</div>;`
- Check if `React is not defined` error appears
- Verify transform output contains `React.createElement` or `_jsx` import

**Phase impact:** Phase 1 - affects all JSX code. Must decide on transform strategy in MVP.

**Sources:**
- React 17 JSX transform announcement (HIGH confidence - official React blog)
- esbuild JSX documentation (HIGH confidence - official docs)
- Babel standalone configuration (HIGH confidence - official docs)

---

## Moderate Pitfalls

Mistakes that cause technical debt, poor performance, or degraded UX.

### Pitfall 6: Not Preserving Editor State During Preview Errors

**What goes wrong:** Preview throws error, causes re-render, editor content resets or loses cursor position.

**Why it happens:** Preview error triggers state update that affects editor, or editor and preview share state incorrectly.

**Prevention:**
- Keep editor state completely separate from preview state
- Editor content should NEVER be affected by preview errors
- Use separate state: `editorCode` vs `previewCode`

```javascript
// WRONG: Single state causes coupling
const [code, setCode] = useState(initialCode);
// Editor and preview both use same state

// CORRECT: Separate concerns
const [editorCode, setEditorCode] = useState(initialCode);
const [previewCode, setPreviewCode] = useState(initialCode);

// Sync on debounce
useEffect(() => {
  const timer = setTimeout(() => {
    setPreviewCode(editorCode);
  }, 300);
  return () => clearTimeout(timer);
}, [editorCode]);
```

**Detection:**
- Write code that causes preview error
- Check if cursor stays in correct position
- Check if editor content remains unchanged

**Phase impact:** Phase 1 - important for UX but not blocking. Should fix before launch.

---

### Pitfall 7: Monaco Editor Memory Leaks on Re-render

**What goes wrong:** Monaco editor instances not properly disposed when component unmounts or re-renders, causing memory leaks.

**Why it happens:** Monaco creates complex DOM structures and event listeners. If not explicitly disposed, they remain in memory.

**Consequences:**
- Memory usage grows over time
- Browser slows down after extended use
- Eventually causes crashes on long sessions

**Prevention:**

```javascript
// Using @monaco-editor/react (handles cleanup automatically)
import Editor from '@monaco-editor/react';

// CORRECT: Library handles disposal
<Editor
  value={code}
  onChange={handleChange}
/>

// If using Monaco directly:
useEffect(() => {
  const editor = monaco.editor.create(element, options);

  return () => {
    editor.dispose(); // MUST dispose on unmount
  };
}, []);
```

**Detection:**
- Open DevTools Memory profiler
- Trigger multiple editor remounts
- Check if memory keeps growing
- Look for detached DOM nodes

**Phase impact:** Phase 1 if using raw Monaco, non-issue if using `@monaco-editor/react` wrapper.

**Sources:**
- Monaco React issues about disposal (MEDIUM confidence - GitHub issues)
- Monaco Editor documentation on lifecycle (MEDIUM confidence)

---

### Pitfall 8: Preview Iframe Never Refreshes

**What goes wrong:** User code executes once, then subsequent updates don't trigger preview refresh. Old code keeps running.

**Why it happens:**
- Iframe src doesn't change, so browser caches it
- postMessage approach doesn't reload iframe between executions
- State from previous execution persists

**Consequences:**
- Confusing behavior - code changes don't appear
- Old component instances remain mounted
- Previous side effects (intervals, listeners) continue running
- User thinks playground is broken

**Prevention:**

**Option A: Force iframe reload**
```javascript
const refreshPreview = () => {
  // Force iframe to reload
  iframeRef.current.src = iframeRef.current.src;
};

// Or reset with key prop
<iframe key={refreshKey} />
```

**Option B: Use srcdoc for inline content**
```javascript
const previewHTML = `
  <!DOCTYPE html>
  <html>
    <body>
      <div id="root"></div>
      <script type="module">
        ${transformedCode}
      </script>
    </body>
  </html>
`;

<iframe srcdoc={previewHTML} />
// srcdoc changes trigger reload automatically
```

**Recommendation:** Option B (srcdoc) - simpler, automatic refresh.

**Detection:**
- Change code multiple times
- Check if preview shows latest version
- Look for multiple component instances in React DevTools

**Phase impact:** Phase 1 - core functionality issue.

---

### Pitfall 9: No Clear Error Messages for Transform Failures

**What goes wrong:** Babel transform fails with cryptic error, user sees technical stack trace instead of helpful message.

**Why it happens:** Raw Babel errors exposed to user without formatting or context.

**Prevention:**

```javascript
try {
  const transformed = transform(code, options);
  setTransformed(transformed);
  setError(null);
} catch (err) {
  // Format error for users
  const userError = {
    message: err.message,
    line: err.loc?.line,
    column: err.loc?.column,
    type: 'Transform Error'
  };
  setError(userError);
}

// Display nicely in UI
<ErrorDisplay error={error} code={code} />
```

**Show:**
- Error type (SyntaxError, Transform Error, Runtime Error)
- Line and column numbers
- Code snippet with error highlighted
- Helpful hint if possible (e.g., "Did you forget to close the tag?")

**Detection:**
- Write syntactically invalid code
- Check if error message is helpful
- Verify line numbers are correct

**Phase impact:** Phase 1 - important for UX.

---

### Pitfall 10: Unhandled Module Import Attempts

**What goes wrong:** User writes `import lodash from 'lodash'`, code fails with "Cannot resolve module" and no explanation.

**Why it happens:** Single-file playground doesn't support npm imports, but user expects it to work.

**Consequences:**
- Confusing error messages
- User doesn't understand limitations
- Breaks common patterns from tutorials

**Prevention:**

**Option A: Show helpful error**
```javascript
// Detect import statements
if (code.includes('import') && code.match(/from ['"][\w-]+['"]/)) {
  showWarning('This playground does not support npm imports. Use CDN or inline code instead.');
}
```

**Option B: Support common libraries via CDN**
```javascript
// Auto-inject common libs from CDN
const previewHTML = `
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  ${transformedUserCode}
`;
```

**Option C: Transform imports to CDN (complex)**
```javascript
// Parse imports, rewrite to CDN URLs
import lodash from 'lodash'
// becomes
import lodash from 'https://cdn.skypack.dev/lodash'
```

**Recommendation:** Option A for MVP (clear limitations), Option B if supporting React specifically, Option C is post-MVP (complex).

**Detection:**
- Try: `import _ from 'lodash'`
- Check if error message is clear

**Phase impact:** Phase 1 - decide on import strategy early.

---

## Minor Pitfalls

Mistakes that cause annoyance but are easily fixable.

### Pitfall 11: Lost Focus When Preview Updates

**What goes wrong:** Editor loses focus every time preview re-renders, interrupting typing flow.

**Why it happens:** Preview iframe reload causes focus shift, or React re-render causes editor to remount.

**Prevention:**
- Keep editor in separate React component
- Use `key` prop carefully - don't change it unnecessarily
- Ensure Monaco instance doesn't remount on preview updates

```javascript
// Editor component should not depend on preview state
const Editor = React.memo(({ code, onChange }) => {
  return <MonacoEditor value={code} onChange={onChange} />;
});

// Preview updates don't affect editor
<Editor code={editorCode} onChange={setEditorCode} />
<Preview code={previewCode} />
```

**Detection:**
- Type in editor while preview updates
- Check if cursor stays in editor

**Phase impact:** Phase 1 - annoying but not blocking.

---

### Pitfall 12: Console Logs Disappear in Preview

**What goes wrong:** User adds `console.log()` to code, nothing appears. No way to debug.

**Why it happens:** Preview runs in iframe, console logs go to iframe's console (not visible in DevTools by default).

**Prevention:**

**Option A: Intercept console in preview**
```javascript
// In preview iframe
const originalLog = console.log;
console.log = (...args) => {
  originalLog(...args);
  window.parent.postMessage({
    type: 'console.log',
    args: args
  }, '*');
};
```

**Option B: Show DevTools-like console panel**
```javascript
// Add console panel in playground UI
<div className="console">
  {consoleLogs.map(log => (
    <div key={log.id}>{log.message}</div>
  ))}
</div>
```

**Recommendation:** Option B for better UX (inline console), Option A is easier for MVP.

**Detection:**
- Add `console.log('test')` to user code
- Check if output is visible somewhere

**Phase impact:** Phase 2 - nice-to-have for debugging experience.

---

### Pitfall 13: No Indication of Transform/Execution State

**What goes wrong:** User doesn't know if code is transforming, executing, or stuck. No loading indicator.

**Prevention:**
- Show spinner or "Transforming..." message during Babel transform
- Show "Running..." message when code executes
- Show "Error" state clearly when things fail

```javascript
const [status, setStatus] = useState('idle'); // idle|transforming|running|error

// During transform
setStatus('transforming');
const transformed = await transform(code);
setStatus('running');
```

**Detection:**
- Write code that takes time to transform
- Check if UI shows any indication

**Phase impact:** Phase 1 - simple UX improvement.

---

### Pitfall 14: Cursor Jumps to End on External State Update

**What goes wrong:** Editor cursor jumps to end of file whenever parent component re-renders or state updates.

**Why it happens:** Editor `value` prop changes, Monaco resets cursor position to end.

**Prevention:**
- Use `defaultValue` instead of `value` for uncontrolled mode
- Or use `onMount` to get editor instance and update via API instead of props

```javascript
// WRONG: Controlled component causes cursor jump
<Editor value={code} onChange={setCode} />

// CORRECT: Uncontrolled with manual sync
const editorRef = useRef(null);

<Editor
  defaultValue={code}
  onMount={(editor) => {
    editorRef.current = editor;
  }}
  onChange={(value) => {
    setCode(value); // Update state
    // Monaco handles cursor internally
  }}
/>
```

**Detection:**
- Type in editor
- Trigger parent re-render (e.g., open/close panel)
- Check if cursor stays in place

**Phase impact:** Phase 1 - critical for typing experience.

**Sources:**
- Monaco React issues about cursor position (MEDIUM confidence - GitHub issues)

---

### Pitfall 15: Preview Doesn't Show useState Updates

**What goes wrong:** User writes `const [count, setCount] = useState(0)` with button to increment, but preview doesn't update when button clicked.

**Why it happens:**
- React not properly set up in preview
- Component not actually being executed as React component
- Missing ReactDOM.render call

**Prevention:**

Ensure preview executes code as React component:

```javascript
// Transform user code to full React app
const fullCode = `
  const { useState } = React;

  ${userCode}

  // If user defined App component, render it
  if (typeof App !== 'undefined') {
    ReactDOM.render(
      React.createElement(App),
      document.getElementById('root')
    );
  }
`;
```

**Detection:**
- Test: `const App = () => { const [n, setN] = useState(0); return <button onClick={() => setN(n+1)}>{n}</button>; }`
- Click button, verify count increments

**Phase impact:** Phase 1 - core React functionality.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Basic editor + preview | Unsafe iframe execution (Pitfall 1) | Use `sandbox="allow-scripts"` from day one |
| Phase 1: Basic editor + preview | Re-transforming on every keystroke (Pitfall 3) | Implement debouncing before adding transform |
| Phase 1: Basic editor + preview | Missing React import (Pitfall 5) | Configure automatic JSX transform early |
| Phase 1: Basic editor + preview | Preview doesn't refresh (Pitfall 8) | Use `srcdoc` approach for preview HTML |
| Phase 2: Error handling | Error boundaries miss async errors (Pitfall 4) | Implement global error listeners |
| Phase 2: Error handling | Cryptic transform errors (Pitfall 9) | Format and display errors nicely |
| Phase 2: Import support (if added) | Module import attempts fail (Pitfall 10) | Decide: block with error or support via CDN |
| Post-MVP: Advanced features | Infinite loop protection (Pitfall 2) | Complex feature, defer unless critical |
| Post-MVP: Console output | Console logs disappear (Pitfall 12) | Add console panel with postMessage intercept |

---

## Architecture Decision Impact on Pitfalls

| Decision | Affects Pitfalls | Recommendation |
|----------|------------------|----------------|
| **Transform strategy:** Babel standalone vs pre-compiled | Pitfalls 3, 5 | Use `@babel/standalone` with automatic JSX, debounce transforms |
| **Preview strategy:** srcdoc vs separate HTML file | Pitfall 8 | Use `srcdoc` - simpler refresh logic |
| **Execution isolation:** Same window vs iframe vs Web Worker | Pitfalls 1, 2 | Use sandboxed iframe for MVP (simpler), consider Worker if infinite loops become problem |
| **Error handling:** Boundary only vs global listeners | Pitfall 4 | Use both - error boundary + window error listeners |
| **Editor library:** Monaco vs CodeMirror vs simple textarea | Pitfall 7, 14 | Use `@monaco-editor/react` wrapper (handles cleanup) |

---

## Testing Checklist for Pitfall Prevention

Before each release, test these scenarios:

**Security:**
- [ ] `window.parent.location = 'http://evil.com'` - should be blocked
- [ ] `document.cookie` from preview - should not access parent cookies
- [ ] `postMessage()` from preview - verify origin checking works

**Performance:**
- [ ] Type quickly for 10 seconds - should not lag
- [ ] Open Memory profiler, trigger 10 editor remounts - no growing memory
- [ ] Leave playground open for 30 minutes - should not slow down

**Error handling:**
- [ ] `throw new Error('render error')` - should show error UI
- [ ] `useEffect(() => { throw new Error('effect error') })` - should catch
- [ ] `setTimeout(() => { throw new Error('async') })` - should catch
- [ ] Invalid JSX syntax - should show helpful error with line number

**React functionality:**
- [ ] `const [x, setX] = useState(0)` with button - should update on click
- [ ] No `import React` statement - should still work (automatic transform)
- [ ] Multiple re-renders - should not lose editor cursor position

**User experience:**
- [ ] Change code 5 times quickly - preview should update to latest version
- [ ] Add `console.log('test')` - should see output somewhere
- [ ] Trigger preview error - editor content should remain unchanged
- [ ] Type while preview updates - editor should keep focus

---

## Sources

**HIGH confidence (official documentation):**
- MDN iframe sandbox attributes
- MDN postMessage security
- React error boundary limitations (official React docs)
- Babel standalone documentation
- Monaco Editor API documentation
- esbuild JSX configuration

**MEDIUM confidence (verified via multiple sources):**
- GitHub issues from major playground projects (CodeSandbox, Sandpack, react-live, Monaco React)
- Common patterns observed across multiple implementations
- Community discussions cross-referenced with official docs

**Areas needing validation:**
- Specific performance characteristics of Babel standalone (depends on code size)
- Memory leak specifics in Monaco (depends on usage pattern)
- Optimal debounce timing (user preference varies)

---

## Research Methodology

**Sources investigated:**
1. CodeSandbox blog and GitHub issues - real-world problems at scale
2. Sandpack GitHub issues - React-specific playground problems
3. react-live GitHub issues - live preview specific challenges
4. Monaco Editor and @monaco-editor/react issues - editor integration problems
5. MDN documentation - security and API correctness
6. Official React, Babel, esbuild documentation - transform configuration
7. StackBlitz, WMR issues - bundling and module resolution challenges

**Verification approach:**
- Cross-referenced issues across multiple playground projects
- Verified technical claims against official documentation
- Prioritized pitfalls based on frequency in issue trackers
- Confirmed security recommendations against MDN and React docs

**What we couldn't verify:**
- Exact performance benchmarks (depends on code size and hardware)
- Optimal debounce timings (subjective, varies by user)
- Specific infinite loop detection implementations (complex, project-specific)
