import nodemailer from "nodemailer";
import { getAccessToken } from "./getTokens.js";
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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fname, lname, email, phone, description, token } = req.body;

  if (!fname || !lname || !email || !description || !token) {
    return res
      .status(400)
      .json({ error: "Please fill in all required fields." });
  }

  // ✅ Проверка Google reCAPTCHA
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyRes = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${secretKey}&response=${token}&remoteip=${
          req.headers["x-forwarded-for"] || req.socket.remoteAddress
        }`,
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.success || verifyData.score < 0.5) {
      return res.status(400).json({ error: "Failed reCAPTCHA verification" });
    }

    if (verifyData.action !== "submit") {
      return res.status(400).json({ error: "Invalid reCAPTCHA action" });
    }

    if (verifyData.hostname !== "www.amalyuldashev.online") {
      return res.status(400).json({ error: "Invalid reCAPTCHA hostname" });
    }
  } catch (err) {
    console.error("reCAPTCHA error:", err);
    return res.status(500).json({ error: "reCAPTCHA verification failed" });
  }

  // ✅ Отправка письма
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
    console.error("Error sending form:", error);
    res.status(500).json({ error: "Submit error." });
  }
}
