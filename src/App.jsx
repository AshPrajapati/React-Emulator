import { useState } from 'react';
import Editor from './components/Editor';
import SplitPane from './components/SplitPane';
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

  return (
    <div className="app-container">
      <SplitPane>
        <Editor value={code} onChange={setCode} />
        <div className="preview-placeholder">
          <span>Preview</span>
        </div>
      </SplitPane>
    </div>
  );
}

export default App;
