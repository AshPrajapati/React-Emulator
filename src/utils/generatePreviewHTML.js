/**
 * Generates a complete HTML document with React 18 runtime and user code
 *
 * @param {string} transformedCode - Babel-transformed JavaScript code
 * @returns {string} Complete HTML document ready for iframe srcdoc
 */
export function generatePreviewHTML(transformedCode) {
  // Extract component name from export default statement
  // This handles: export default ComponentName
  const exportMatch = transformedCode.match(/export\s+default\s+(\w+)/);
  const componentName = exportMatch ? exportMatch[1] : null;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 16px;
      background: #1e1e1e;
      color: #d4d4d4;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #root { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- React 18 from CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

  <script type="module">
    try {
      // User's transformed code wrapped in execution context
      const { createElement: h, useState, useEffect, useRef, useMemo, useCallback } = React;
      const { createRoot } = ReactDOM;

      ${transformedCode}

      // Auto-detect and render exported component
      const rootElement = document.getElementById('root');
      const root = createRoot(rootElement);

      ${
        componentName
          ? `// Render the exported component
      if (typeof ${componentName} !== 'undefined') {
        root.render(h(${componentName}));
      } else {
        root.render(h('div', null, 'Component "${componentName}" not found'));
      }`
          : `// No default export found - try to render any JSX
      root.render(h('div', null, 'No default export found. Add: export default YourComponent'));`
      }
    } catch (error) {
      // Render error in preview (Phase 4 will improve this)
      console.error('Preview error:', error);
      document.body.innerHTML = \`
        <div style="color: #f48771; padding: 16px; font-family: monospace;">
          <strong>Runtime Error:</strong><br/>
          \${error.message}
        </div>
      \`;
    }
  </script>
</body>
</html>`;
}
