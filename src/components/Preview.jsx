import { useEffect, useRef } from 'react';
import { generatePreviewHTML } from '../utils/generatePreviewHTML';

/**
 * Preview component - renders transformed JSX code in a sandboxed iframe
 *
 * Uses sandbox="allow-scripts" for maximum isolation while allowing React to execute.
 * No form submission, no popup windows, no same-origin access to parent.
 */
function Preview({ transformedCode }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    // Generate complete HTML document with React runtime
    const html = generatePreviewHTML(transformedCode || '');

    // Update iframe content
    iframeRef.current.srcdoc = html;
  }, [transformedCode]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        background: '#1e1e1e',
      }}
      title="Preview"
    />
  );
}

export default Preview;
