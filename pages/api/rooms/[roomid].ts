import { getRoom, isRoomFull } from "@/lib/rooms";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roomid } = req.query;

  if (typeof roomid !== "string") {
    return res.status(400).json({ error: "Invalid roomid" });
  }

  const room = await getRoom(roomid);

  res.status(200).json(room); // TODO add different status for room not exist
}