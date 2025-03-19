import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { session_id, visit_end, updated_at } = req.body;

    if (!session_id || !visit_end || !updated_at) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const sql = neon(process.env.DATABASE_URL);

      const result = await sql(
        "SELECT id FROM visitors WHERE session_id = $1",
        [session_id]
      );

      if (result.length === 0) {
        return res.status(404).json({ message: "Visitor not found" });
      }

      const visitor_id = result[0].id;

      // Обновляем данные визита
      await sql(
        "UPDATE visitors SET visit_end = $1, updated_at = $2 WHERE session_id = $3",
        [visit_end, updated_at, session_id]
      );

      return res
        .status(200)
        .json({ message: "Visit data updated successfully" });
    } catch (error) {
      console.error("Error updating visit data:", error);
      return res.status(500).json({ message: "Error updating visit data" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
