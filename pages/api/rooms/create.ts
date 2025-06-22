import { createRoom, getRoom, isRoomFull } from "@/lib/rooms";
import type { NextApiRequest, NextApiResponse } from "next";

function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roomid, maxUsers } = req.body; // TODO add handling for room already exist
  try {
    console.log("room with id", roomid, "created");

    const room = createRoom(roomid as string, maxUsers);

    res.status(200).json({ room });
  } catch (err) {
    res.status(500).end();
  }
}

export default handler;
