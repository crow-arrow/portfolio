import dotenv from "dotenv";
import { createAltchaChallenge } from "./altcha-core.js";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const challenge = await createAltchaChallenge();
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(challenge);
  } catch (error) {
    console.error("ALTCHA challenge error:", error);
    return res.status(500).json({ error: "ALTCHA challenge failed" });
  }
}
