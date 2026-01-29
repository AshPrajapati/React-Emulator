import { useState, useRef, useEffect } from 'react';
import './SplitPane.css';

function SplitPane({ children }) {
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Allow full collapse to either side (0-100%)
      setSplitPosition(Math.max(0, Math.min(100, newPosition)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      // Prevent text selection during drag
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isDragging]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div className="split-pane-container" ref={containerRef}>
      <div
        className="split-pane-left"
        style={{ width: `${splitPosition}%` }}
      >
        {children[0]}
      </div>
      <div
        className="split-pane-divider"
        onMouseDown={handleMouseDown}
      />
      <div
        className="split-pane-right"
        style={{ width: `${100 - splitPosition}%` }}
      >
        {children[1]}
      </div>
    </div>
  );
}

export default SplitPane;
