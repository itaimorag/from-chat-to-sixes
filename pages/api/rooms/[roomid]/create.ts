import { createRoom, getRoom, isRoomFull } from "@/lib/rooms";
import type { NextApiRequest, NextApiResponse } from "next";

function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roomid, maxUsers } = req.body;
  try {
    console.log("roomid hiiiiiiiiiiiiiiiiiiii", roomid);

    const room = createRoom(roomid as string, maxUsers);
    res.status(200).json({ room });
  } catch (err) {
    res.status(500).end();
  }
}

export default handler;
