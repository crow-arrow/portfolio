import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { session_id, visit_end } = req.body;

    if (!session_id || !visit_end) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const sql = neon(process.env.DATABASE_URL);

      await sql("UPDATE visitors SET visit_end = $1 WHERE session_id = $2", [
        visit_end,
        session_id,
      ]);

      return res
        .status(200)
        .json({ message: "Visit end time saved successfully" });
    } catch (error) {
      console.error("Error saving visit end data:", error);
      return res.status(500).json({ message: "Error saving visit end data" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
