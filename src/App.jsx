import { useState, useEffect } from 'react';
import Editor from './components/Editor';
import SplitPane from './components/SplitPane';
import Preview from './components/Preview';
import { transformCode } from './utils/transform';
import './App.css';

const INITIAL_CODE = `import React from 'react';

function App() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  );
}

export default App;`;

function App() {
  const [code, setCode] = useState(INITIAL_CODE);
  const [transformedCode, setTransformedCode] = useState('');
  const [transformError, setTransformError] = useState(null);

  // Debounced transformation - transforms code 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const result = transformCode(code);
      if (result.success) {
        setTransformedCode(result.code);
        setTransformError(null);
      } else {
        setTransformError(result.error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [code]);

  return (
    <div className="app-container">
      <SplitPane>
        <Editor value={code} onChange={setCode} />
        <div className="preview-placeholder">
          {transformError ? (
            <div className="transform-error">
              <span className="error-label">Transform Error</span>
              <pre className="error-message">{transformError}</pre>
            </div>
          ) : (
            <Preview transformedCode={transformedCode} />
          )}
        </div>
      </SplitPane>
    </div>
  );
}

export default App;
