import { Server } from "socket.io";
import { addUser, removeUser } from "@/lib/users";
import { addMessage } from "@/lib/messages";
import {
  USER_JOIN_CHAT_EVENT,
  USER_LEAVE_CHAT_EVENT,
  NEW_CHAT_MESSAGE_EVENT,
  START_TYPING_MESSAGE_EVENT,
  STOP_TYPING_MESSAGE_EVENT,
} from "@/lib/eventconst";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  getRoom,
  createRoom,
  addUserToRoom,
  removeUserFromRoom,
  removeRoom,
} from "@/lib/rooms";

function ioHandler(req: NextApiRequest, res: NextApiResponse) {
  if (!(res.socket as any).server.io) {
    console.log("*First use, starting socket.io");

    const io = new Server((res.socket as any).server);

    io.on("connection", (socket) => {
      console.log(`${socket.id} connected`);

      // Join a conversation
      const { roomId, name, picture } = socket.handshake.query;
      console.log("roomId", roomId);

      socket.join(roomId as string);

      // Add user to Redis room
      (async () => {
        let room = await getRoom(roomId as string);
        if (!room) {
          room = await createRoom(roomId as string, 10); // Default maxUsers=10, adjust as needed
        }
        const user = {
          id: socket.id,
          room: roomId as string,
          name: name as string,
          picture: picture as string,
          scoresByRound: [],
          totalScore: 0,
          isStopper: false,
          hand: [],
        };
        await addUserToRoom(roomId as string, user);
        io.in(roomId as string).emit(USER_JOIN_CHAT_EVENT, user);
      })();

      // Listen for new messages
      socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
        const message = addMessage(roomId as string, data);
        io.in(roomId as string).emit(NEW_CHAT_MESSAGE_EVENT, message);
      });

      // Listen typing events
      socket.on(START_TYPING_MESSAGE_EVENT, (data) => {
        io.in(roomId as string).emit(START_TYPING_MESSAGE_EVENT, data);
      });
      socket.on(STOP_TYPING_MESSAGE_EVENT, (data) => {
        io.in(roomId as string).emit(STOP_TYPING_MESSAGE_EVENT, data);
      });

      // Leave the room if the user closes the socket
      socket.on("disconnect", () => {
        (async () => {
          console.log("disconnect");

          await removeUserFromRoom(roomId as string, socket.id);
          io.in(roomId as string).emit(USER_LEAVE_CHAT_EVENT, {
            id: socket.id,
          });
          socket.leave(roomId as string);

          // Check if the room is empty and delete if so
          const room = await getRoom(roomId as string);
          console.log("romoomomomomm", room);

          if (room && room.users.length === 0) {
            await removeRoom(roomId as string);
            console.log(`Room ${roomId} deleted because it is empty.`);
          }
        })();
      });
    });

    (res.socket as any).server.io = io;
  } else {
    console.log("socket.io already running");
  }
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;
