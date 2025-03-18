import nodemailer from "nodemailer";
import { getAccessToken } from "../getTokens"; // Если файл getTokens.js находится на уровне выше
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: async () => {
      const accessToken = await getAccessToken();
      return accessToken;
    },
  },
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { fname, lname, email, phone, description } = req.body;

    if (!fname || !lname || !email || !description) {
      return res
        .status(400)
        .json({ error: "Please fill in all required fields." });
    }

    try {
      const mailOptions = {
        from: `"${fname} ${lname}" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: "New job enquiry",
        html: `
          <h1>New job enquiry</h1>
          <p><strong>Name:</strong> ${fname} ${lname}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || "Null"}</p>
          <p><strong>Description:</strong> ${description}</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Message sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Submit error." });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
