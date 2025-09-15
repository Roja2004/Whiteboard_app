import React, { useState } from 'react';


function RoomJoin({ onJoin }) {
  const [code, setCode] = useState('');

  
  const valid = /^[a-zA-Z0-9]{6,8}$/.test(code);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (valid) onJoin(code);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 80 }}>
      <h2>Enter Room Code</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          maxLength={8}
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Room code (6-8 alphanumeric)"
          style={{ fontSize: 18, padding: 8, width: 220 }}
        />
        <button type="submit" disabled={!valid} style={{ marginTop: 12 }}>Join Room</button>
      </form>
    </div>
  );
}

export default RoomJoin;