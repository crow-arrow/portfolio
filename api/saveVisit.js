import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { session_id, visit_start, visit_end, referrer } = req.body;

    if (!session_id || !visit_start || !visit_end) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const sql = neon(process.env.DATABASE_URL);

      // Проверяем, существует ли visitor с таким session_id
      let visitorResult = await sql(
        "SELECT id FROM visitors WHERE session_id = $1",
        [session_id]
      );

      if (visitorResult.length === 0) {
        // Если visitor не найден, создаем его
        await sql(
          "INSERT INTO visitors (session_id, visit_start, visit_end, referrer) VALUES ($1, $2, $3, $4)",
          [session_id, visit_start, visit_end, referrer]
        );

        visitorResult = await sql(
          "SELECT id FROM visitors WHERE session_id = $1",
          [session_id]
        );
      }

      const visitor_id = visitorResult[0].id;

      return res
        .status(200)
        .json({ message: "Visit data saved successfully", visitor_id });
    } catch (error) {
      console.error("Error saving visit data:", error);
      return res.status(500).json({ message: "Error saving visit data" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
