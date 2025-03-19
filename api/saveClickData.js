import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { visitorId, elementTag, elementId, elementText, timestamp } =
      req.body;

    if (!elementTag || !timestamp) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const sql = neon(process.env.DATABASE_URL);

      // Вставляем клик, visitorId может быть null
      await sql(
        "INSERT INTO clicks (visitor_id, element_tag, element_id, element_text, timestamp) VALUES ($1, $2, $3, $4, $5)",
        [visitorId, elementTag, elementId, elementText, timestamp]
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
