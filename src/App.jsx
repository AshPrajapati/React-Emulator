import { useState } from 'react';
import Editor from './components/Editor';

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
    <div style={{ height: '100vh', width: '100vw' }}>
      <h1>React Emulator</h1>
      <div style={{ height: 'calc(100vh - 60px)' }}>
        <Editor value={code} onChange={setCode} />
      </div>
    </div>
  );
}

export default App;
