"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initChangeStream = void 0;
function initChangeStream(io, db) {
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
    roomsChangeStream.on("change", (change) => __awaiter(this, void 0, void 0, function* () {
        try {
            // We are interested mainly in updates or replaces
            if (change.operationType === "update" || change.operationType === "replace") {
                const objectId = change.documentKey._id.toString();
                // Fetch latest room state from DB
                const updatedRoom = yield rooms.findOne({ _id: change.documentKey._id });
                if (!updatedRoom)
                    return;
                // Emit the update to all sockets in the room
                io.to(updatedRoom.id).emit("room_update", updatedRoom);
            }
        }
        catch (error) {
            console.error("Error processing change stream:", error);
        }
    }));
    roomsChangeStream.on("error", (err) => {
        console.error("MongoDB Change Stream Error:", err);
    });
    console.log("MongoDB change stream listener started");
}
exports.initChangeStream = initChangeStream;
