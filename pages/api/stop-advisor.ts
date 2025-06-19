import { NextApiRequest, NextApiResponse } from "next";
import { getStopAdvice } from "@/ai/flows/stop-advisor";
import type { StopAdviceInput } from "@/ai/flows/stop-advisor";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const input: StopAdviceInput = req.body;
    const result = await getStopAdvice(input);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in stop-advisor API:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
