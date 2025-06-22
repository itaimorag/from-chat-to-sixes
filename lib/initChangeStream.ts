import { Server } from "socket.io";
import { Db } from "mongodb";

export function initChangeStream(io: Server, db: Db) {
  // const messages = db.collection("messages");
  // const messagesChangeStream = messages.watch();

  // messagesChangeStream.on("change", (change) => {
  //   if (change.operationType === "insert") {
  //       // emit to specific room instead of all:
  //       io.to(change.fullDocument.id).emit("new_message", change.fullDocument);
  //   }
  // });

  // messagesChangeStream.on("error", (err) => {
  //   console.error("MongoDB Change Stream Error:", err);
  // });

  const rooms = db.collection("rooms");
  const roomsChangeStream = rooms.watch();

  roomsChangeStream.on("change", async (change) => {
    try {
      // We are interested mainly in updates or replaces
      if (change.operationType === "update" || change.operationType === "replace") {
        const objectId = change.documentKey._id.toString();

        // Fetch latest room state from DB
        const updatedRoom = await rooms.findOne({ _id: change.documentKey._id });

        if (!updatedRoom) return;

        // Emit the update to all sockets in the room
        io.to(updatedRoom.id).emit("room_update", updatedRoom);
      }
    } catch (error) {
      console.error("Error processing change stream:", error);
    }
  });

  roomsChangeStream.on("error", (err) => {
    console.error("MongoDB Change Stream Error:", err);
  });

  console.log("MongoDB change stream listener started");
}