import { config } from 'dotenv';
config({ path: ".env.local" });

import http from "http";
import next from "next";
import { Server } from "socket.io";
import { mongoClientPromise } from "./lib/mongodb";
import { initChangeStream } from "./lib/initChangeStream";
import { verifyToken } from "./lib/verifyToken";
import { addPlayerToRoom, removePlayerFromRoom, getRoom, removeRoom, createRoom } from "./lib/rooms";
import { callStop, discardCard, newGame, peekDone, replaceCard } from "./lib/sixes";
import { 
  ROOM_UPDATE_EVENT, 
  NEW_CHAT_MESSAGE_EVENT, 
  START_TYPING_MESSAGE_EVENT, 
  STOP_TYPING_MESSAGE_EVENT, 
  REPLACE_CARD_EVENT, 
  DISCARD_CARD_EVENT, 
  CALL_STOP_EVENT, 
  NEW_GAME_EVENT, 
  PEEK_DONE_EVENT,
} from "./lib/eventconst";

const PORT = 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpServer = http.createServer((req, res) => handle(req, res));
const io = new Server(httpServer, {
  cors: {
    // origin: [process.env.NEXT_PUBLIC_SOCKET_URL], // your frontend domain
    // methods: ["GET", "POST"]
  }
});

// ✅ Authorization middleware
// io.use((socket, next) => { TODO: add token
//   try {
//     const token = socket.handshake.auth.token;
//     if (!token) throw new Error("Missing token");

//     const user = verifyToken(token);
//     socket.data.user = user; // attach user to socket
//     next();
//   } catch (err) {
//     next(new Error("Unauthorized"));
//   }
// });

// ✅ Socket logic after authentication
io.on("connection", (socket) => {
  const { roomId, name, picture } = socket.handshake.query; // TODO Receive in the actual join_room event

  console.log(`${name} connected`);

  // Here you can check if the user has access to the room
  socket.join(roomId as string);

  (async () => {
    let room = await getRoom(roomId as string);
  
    if (!room) {
      room = await createRoom(roomId as string, 4); // TODO change maxUsers
    }
  
    await addPlayerToRoom(roomId as string, socket.id, name as string, picture as string);
  })();

  socket.on(REPLACE_CARD_EVENT, async (row: 'top' | 'bottom', idx: number, pile: 'deck' | 'discard') => {
    await replaceCard(socket.id, roomId as string, row, idx, pile);
  });

  socket.on(DISCARD_CARD_EVENT, async () => {
    await discardCard(socket.id, roomId as string);
  });

  socket.on(CALL_STOP_EVENT, async () => {
    await callStop(socket.id, roomId as string);
  });

  socket.on(NEW_GAME_EVENT, async () => {
    await newGame(roomId as string);
  });

  socket.on(PEEK_DONE_EVENT, async () => {
    await peekDone(socket.id, roomId as string);
  });
  
  socket.on("disconnect", async (reason) => {
    console.log(`${name} disconnected: ${reason}`);
  
    try {
      await removePlayerFromRoom(roomId as string, socket.id);
      const room = await getRoom(roomId as string);
  
      if (room && room.players.length === 0) {
        await removeRoom(roomId as string);
      }
  
      socket.leave(roomId as string);
    } catch (err) {
      console.error("Error during disconnect cleanup:", err);
    }
  });
});

app.prepare().then(async () => {
  const client = await mongoClientPromise;
  const db = client.db("chat-db");

  // Optional: watch MongoDB changes (if you're using it)
  initChangeStream(io, db);

  httpServer.listen(PORT, () => {
    console.log(`✅ Server running at port ${PORT}`);
  });
}).catch((err) => {
  console.error("❌ Error during app.prepare():", err);
});
