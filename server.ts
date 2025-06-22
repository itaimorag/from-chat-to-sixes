import { config } from "dotenv";
config({ path: ".env.local" });

import http from "http";
import next from "next";
import { Server } from "socket.io";
import { mongoClientPromise } from "./lib/mongodb";
import { initChangeStream } from "./lib/initChangeStream";
import { verifyToken } from "./lib/verifyToken";
import {
  addPlayerToRoom,
  removePlayerFromRoom,
  getRoom,
  removeRoom,
  createRoom,
  setPlayerActive,
  setAdmin,
} from "./lib/rooms";
import {
  callStop,
  discardCard,
  newGame,
  peekDone,
  replaceCard,
  startGame,
} from "./lib/sixes";
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
  KICK_PLAYER_EVENT,
  PLAYER_ID_EVENT,
  START_GAME_EVENT,
  MAKE_ADMIN_EVENT,
} from "./lib/eventconst";
import { Player } from "./lib/types";

const PORT = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpServer = http.createServer((req, res) => handle(req, res));
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_CLIENT_URL,
    methods: ["GET", "POST"],
  },
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

  let playerId = socket.handshake.query.playerId as string;

  if (!playerId) {
    playerId = crypto.randomUUID();
  }

  console.log(`${name} connected`);

  // Here you can check if the user has access to the room
  socket.join(roomId as string);

  (async () => {
    let room = await getRoom(roomId as string);

    if (!room) {
      room = await createRoom(roomId as string, 4); // TODO change maxUsers
    }

    const player = room.players.find((p: Player) => p.id === playerId);

    if (player) {
      await setPlayerActive(roomId as string, playerId, true);
    } else {
      playerId = crypto.randomUUID();
      await addPlayerToRoom(
        roomId as string,
        playerId,
        name as string,
        picture as string
      );
      socket.emit(PLAYER_ID_EVENT, playerId);
    }
  })();

  socket.on(
    REPLACE_CARD_EVENT,
    async (row: "top" | "bottom", idx: number, pile: "deck" | "discard") => {
      await replaceCard(playerId, roomId as string, row, idx, pile);
    }
  );

  socket.on(DISCARD_CARD_EVENT, async () => {
    await discardCard(playerId, roomId as string);
  });

  socket.on(CALL_STOP_EVENT, async () => {
    await callStop(playerId, roomId as string);
  });

  socket.on(NEW_GAME_EVENT, async () => {
    await newGame(roomId as string);
  });

  socket.on(PEEK_DONE_EVENT, async () => {
    await peekDone(playerId, roomId as string);
  });

  socket.on(KICK_PLAYER_EVENT, async (playerId: string) => {
    await removePlayerFromRoom(roomId as string, playerId);
  });

  socket.on(START_GAME_EVENT, async () => {
    await startGame(roomId as string);
  });

  socket.on(MAKE_ADMIN_EVENT, async (playerId: string) => {
    await setAdmin(roomId as string, playerId);
  });

  socket.on("disconnect", async (reason) => {
    console.log(`${name} disconnected: ${reason}`);

    try {
      await setPlayerActive(roomId as string, playerId, false);

      socket.leave(roomId as string);
    } catch (err) {
      console.error("Error during disconnect cleanup:", err);
    }
  });
});

app
  .prepare()
  .then(async () => {
    const client = await mongoClientPromise;
    const db = client.db("chat-db");

    // Optional: watch MongoDB changes (if you're using it)
    initChangeStream(io, db);

    httpServer.listen(PORT, () => {
      console.log(`✅ Server running at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error during app.prepare():", err);
  });
