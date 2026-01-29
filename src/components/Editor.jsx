import Editor from '@monaco-editor/react';

function MonacoEditor({ value, onChange }) {
  const handleChange = (newValue) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <Editor
      height="100%"
      language="javascript"
      theme="vs-dark"
      value={value}
      onChange={handleChange}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true
      }}
    />
  );
}

export default MonacoEditor;
