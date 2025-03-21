import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { session_id, visit_start, referrer } = req.body;

    if (!session_id || !visit_start || !referrer) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const sql = neon(process.env.DATABASE_URL);

      const result = await sql(
        "INSERT INTO visitors (session_id, visit_start, referrer) VALUES ($1, $2, $3) RETURNING id",
        [session_id, visit_start, referrer]
      );

      if (result.length > 0) {
        const visitor_id = result[0].id;
        return res.status(200).json({
          message: "Visit data saved successfully",
          visitor_id,
        });
      } else {
        return res
          .status(500)
          .json({ message: "Failed to retrieve visitor ID" });
      }
    } catch (error) {
      console.error("Error saving visit data:", error);
      return res.status(500).json({ message: "Error saving visit data" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
