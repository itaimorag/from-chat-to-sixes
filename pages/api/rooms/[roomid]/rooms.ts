import { getRoom, isRoomFull } from "@/lib/rooms";
import type { NextApiRequest, NextApiResponse } from "next";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roomid } = req.query;
  try {
    const isRoomExist = await getRoom(roomid as string);
    console.log("isRoomExist", isRoomExist);
    const isRoomMax = await isRoomFull(roomid as string);
    res.status(200).json({ isRoomExist: !!isRoomExist, isRoomMax });
  } catch (err) {
    res.status(500).end();
  }
}

export default handler;
