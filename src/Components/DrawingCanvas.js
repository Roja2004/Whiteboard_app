import React, { useRef, useEffect, useState } from 'react';

// Canvas drawing logic, real-time sync via socket
function DrawingCanvas({ socket, roomId }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('black');
  const [width, setWidth] = useState(2);

  // Drawing data
  useEffect(() => {
    if (!socket) return;

    // Receive incremental drawing updates
    socket.on('draw-start', drawStroke);
    socket.on('draw-move', drawStroke);
    socket.on('draw-end', drawStroke);
    socket.on('clear-canvas', clearCanvas);

    // Initial load: get persisted drawing
    socket.emit('get-drawing', { roomId });

    socket.on('drawing-data', data => {
      clearCanvas();
      data.forEach(cmd => drawStroke(cmd));
    });

    return () => {
      socket.off('draw-start', drawStroke);
      socket.off('draw-move', drawStroke);
      socket.off('draw-end', drawStroke);
      socket.off('clear-canvas', clearCanvas);
      socket.off('drawing-data');
    };
    // eslint-disable-next-line
  }, [socket, roomId]);

  // Draw a stroke on canvas
  function drawStroke(cmd) {
    const ctx = canvasRef.current.getContext('2d');
    if (cmd.type === 'stroke') {
      const { path, color, width } = cmd.data;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.stroke();
    } else if (cmd.type === 'clear') {
      clearCanvas();
    }
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Drawing mouse/touch events
  function startDraw(e) {
    setDrawing(true);
    const { x, y } = getPos(e);
    const cmd = {
      type: 'stroke',
      data: {
        path: [{ x, y }],
        color,
        width
      },
      timestamp: Date.now()
    };
    socket.emit('draw-start', { roomId, cmd });
    lastPath.current = [{ x, y }];
  }

  function moveDraw(e) {
    if (!drawing) return;
    const { x, y } = getPos(e);
    lastPath.current.push({ x, y });
    const cmd = {
      type: 'stroke',
      data: {
        path: lastPath.current.slice(-2),
        color,
        width
      },
      timestamp: Date.now()
    };
    socket.emit('draw-move', { roomId, cmd });
    drawStroke(cmd);
  }

  function endDraw(e) {
    setDrawing(false);
    const { x, y } = getPos(e);
    lastPath.current.push({ x, y });
    const cmd = {
      type: 'stroke',
      data: {
        path: lastPath.current,
        color,
        width
      },
      timestamp: Date.now()
    };
    socket.emit('draw-end', { roomId, cmd });
    lastPath.current = [];
  }

  const lastPath = useRef([]);

  // Get mouse/touch position
  function getPos(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    let x, y;
    if (e.touches) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    return { x, y };
  }

  // Cursor tracking (throttle to ~60fps)
  useEffect(() => {
    function sendCursor(e) {
      const { x, y } = getPos(e);
      socket.emit('cursor-move', { roomId, x, y });
    }
    const handler = e => sendCursor(e);
    canvasRef.current && canvasRef.current.addEventListener('mousemove', handler);
    return () => {
      canvasRef.current && canvasRef.current.removeEventListener('mousemove', handler);
    };
    // eslint-disable-next-line
  }, [socket, roomId]);

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 60;
    clearCanvas();
  }, []);

  // Clear button handler
  function handleClear() {
    socket.emit('clear-canvas', { roomId });
    clearCanvas();
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid #ccc', background: '#fff', width: '100%', height: 'calc(100vh - 60px)', touchAction: 'none' }}
        onMouseDown={startDraw}
        onMouseMove={moveDraw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={moveDraw}
        onTouchEnd={endDraw}
      />
      {/* Toolbar controls */}
      <div style={{ position: 'absolute', top: 16, left: 16 }}>
        <button onClick={handleClear}>Clear Canvas</button>
      </div>
    </div>
  );
}

export default DrawingCanvas;