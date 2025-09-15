import React, { useState } from 'react';

// Simple toolbar for color and stroke width
function Toolbar({ socket }) {
  const [color, setColor] = useState('black');
  const [width, setWidth] = useState(2);

  // update drawing options for DrawingCanvas via context or props in full app

  return (
    <div style={{
      position: 'absolute',
      top: 8,
      right: 8,
      background: '#f9f9f9',
      borderRadius: 6,
      padding: 10,
      boxShadow: '0 2px 8px #ddd',
      zIndex: 10
    }}>
      <label>Color: </label>
      <select value={color} onChange={e => setColor(e.target.value)}>
        <option value="black">Black</option>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
        <option value="green">Green</option>
      </select>
      <label style={{ marginLeft: 10 }}>Stroke: </label>
      <input type="range" min={1} max={10} value={width} onChange={e => setWidth(Number(e.target.value))} />
      <span>{width}px</span>
    </div>
  );
}

export default Toolbar;