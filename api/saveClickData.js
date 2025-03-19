import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { session_id, elementTag, elementId, elementText, timestamp } =
      req.body;

    if (!session_id || !elementTag || !timestamp) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const sql = neon(process.env.DATABASE_URL);

      // Получаем visitor_id по session_id
      const visitorResult = await sql(
        "SELECT id FROM visitors WHERE session_id = $1",
        [session_id]
      );

      if (visitorResult.length === 0) {
        return res.status(404).json({ message: "Visitor not found" });
      }

      const visitor_id = visitorResult[0].id;

      // Записываем клик
      await sql(
        "INSERT INTO clicks (visitor_id, element_tag, element_id, element_text, timestamp) VALUES ($1, $2, $3, $4, $5)",
        [visitor_id, elementTag, elementId, elementText, timestamp]
      );

      return res.status(200).json({ message: "Click data saved successfully" });
    } catch (error) {
      console.error("Error saving click data:", error);
      return res.status(500).json({ message: "Error saving click data" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
