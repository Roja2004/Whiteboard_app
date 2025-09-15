import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import DrawingCanvas from './DrawingCanvas';
import Toolbar from './Toolbar';
import UserCursors from './UserCursors';

// The socket server URL - adjust if needed
const SOCKET_SERVER_URL = 'http://localhost:5000';

// Main whiteboard component
function Whiteboard({ roomId, onLeave }) {
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState(1);
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    const s = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
    });
    setSocket(s);

    // Join room on mount
    s.emit('join-room', { roomId });

    // Track users
    s.on('user-count', count => setUsers(count));

    // Track cursors
    s.on('cursor-update', setCursors);

    // Handle leave
    return () => {
      s.emit('leave-room', { roomId });
      s.disconnect();
    };
  }, [roomId]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f5f5f5' }}>
        <div>Room: <b>{roomId}</b></div>
        <div>Active users: <b>{users}</b></div>
        <button onClick={onLeave}>Leave Room</button>
      </div>
      {socket && (
        <div style={{ flex: 1, position: 'relative', background: '#fff' }}>
          <Toolbar socket={socket} />
          <DrawingCanvas socket={socket} roomId={roomId} />
          <UserCursors cursors={cursors} />
        </div>
      )}
    </div>
  );
}

export default Whiteboard;