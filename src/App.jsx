import { useState } from 'react';

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
        {/* Editor will be added here */}
      </div>
    </div>
  );
}

export default App;
