import React, { useState } from 'react';
import RoomJoin from './Components/RoomJoin';
import Whiteboard from './Components/Whiteboard';


// Root App: shows room join or whiteboard based on state
function App() {
  const [roomId, setRoomId] = useState('');

  return (
    <div>
      {!roomId ? (
        <RoomJoin onJoin={setRoomId} />
      ) : (
        <Whiteboard roomId={roomId} onLeave={() => setRoomId('')} />
      )}
    </div>
  );
}

export default App;