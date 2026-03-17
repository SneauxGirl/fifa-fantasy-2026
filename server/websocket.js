// DUMMY DATA FOR WEBSOCKET DEMO
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 4001 });

console.log('🚀 Dummy WebSocket server running on ws://localhost:4001');

const dummyEvents = [
  { match: 'France vs Argentina', minute: 12, event: 'Goal', player: 'Mbappé' },
  { match: 'England vs Brazil', minute: 5, event: 'Yellow Card', player: 'Rashford' },
  { match: 'France vs Argentina', minute: 18, event: 'Assist', player: 'Messi' },
];

// TODO: align to match event type once we're at phase 6 
/* {
  minute: number;
  type: "goal" | "yellow_card" | ...;
  team: string;
  playerId?: number;
} */


wss.on('connection', ws => {
  console.log('Client connected');

  // Emit events every 2 seconds
  let i = 0;
  const interval = setInterval(() => {
    ws.send(JSON.stringify(dummyEvents[i % dummyEvents.length]));
    i++;
  }, 2000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});

// WHEN READY TO USE ADD THE FOLLOWING TO PACKAGE JSON
/* 
"scripts": {
  "dev": "vite",
  "server": "node server/websocket.js"
}
  */

//Then run: npm run server

// You should see: 🚀 Dummy WebSocket server running on ws://localhost:4001
