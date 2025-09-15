import React from 'react';
import { io } from 'socket.io-client';


// Display other users' cursors (colored dots)
function UserCursors({ cursors }) {
  // cursors: { userId: {x, y, color} }
  return (
    <div>
      {Object.entries(cursors).map(([uid, pos], idx) => (
        <div
          key={uid}
          style={{
            position: 'absolute',
            left: pos.x,
            top: pos.y,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: pos.color || 'orange',
            border: '2px solid #fff',
            pointerEvents: 'none',
            transition: 'left 0.07s, top 0.07s'
          }}
        />
      ))}
    </div>
  );
}

export default UserCursors;