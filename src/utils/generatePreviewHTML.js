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

  // Process the transformed code to work in browser context:
  // 1. Remove import statements (React/ReactDOM are globals from CDN)
  // 2. Remove export statements (we'll access component directly)
  let processedCode = transformedCode
    // Remove import statements for react/react-dom (they're globals)
    .replace(/import\s+(?:\*\s+as\s+)?(?:\{[^}]*\}|\w+)(?:\s*,\s*(?:\{[^}]*\}|\w+))?\s+from\s+['"]react(?:-dom)?['"];?\n?/g, '')
    // Convert "export default X" to just make X available
    .replace(/export\s+default\s+(\w+);?/g, 'var _defaultExport = $1;')
    // Remove other export statements
    .replace(/export\s+\{[^}]*\};?\n?/g, '');

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

  <script>
    (function() {
      try {
        // Make React hooks available as globals for user code
        var useState = React.useState;
        var useEffect = React.useEffect;
        var useRef = React.useRef;
        var useMemo = React.useMemo;
        var useCallback = React.useCallback;
        var useContext = React.useContext;
        var useReducer = React.useReducer;
        var createElement = React.createElement;

        // User's transformed code
        ${processedCode}

        // Auto-detect and render exported component
        var rootElement = document.getElementById('root');
        var root = ReactDOM.createRoot(rootElement);

        ${
          componentName
            ? `// Render the exported component
        if (typeof _defaultExport !== 'undefined') {
          root.render(React.createElement(_defaultExport));
        } else if (typeof ${componentName} !== 'undefined') {
          root.render(React.createElement(${componentName}));
        } else {
          root.render(React.createElement('div', null, 'Component "${componentName}" not found'));
        }`
            : `// No default export found
        if (typeof _defaultExport !== 'undefined') {
          root.render(React.createElement(_defaultExport));
        } else {
          root.render(React.createElement('div', null, 'No default export found. Add: export default YourComponent'));
        }`
        }
      } catch (error) {
        // Render error in preview (Phase 4 will improve this)
        console.error('Preview error:', error);
        document.body.innerHTML =
          '<div style="color: #f48771; padding: 16px; font-family: monospace;">' +
          '<strong>Runtime Error:</strong><br/>' +
          error.message +
          '</div>';
      }
    })();
  </script>
</body>
</html>`;
}
