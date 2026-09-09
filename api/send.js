import nodemailer from "nodemailer";
import { verifyAltchaPayload } from "./altcha-core.js";
import dotenv from "dotenv";

dotenv.config();

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const appPassword = (process.env.EMAIL_PASS || "").replaceAll("-", "").replaceAll(" ", "");

  // App password is more reliable locally: OAuth refresh tokens expire/revoke.
  if (appPassword) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass: appPassword },
    });
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });
}

const transporter = createTransporter();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { fname, lname, email, phone, description, altcha } = req.body;

  const isLocalhost =
    req.headers.host?.includes("localhost") ||
    req.headers.host?.includes("127.0.0.1");
  const skipAltchaForDev =
    process.env.SKIP_ALTCHA_LOCALHOST === "true" ||
    process.env.SKIP_RECAPTCHA_LOCALHOST === "true";

  if (!fname || !lname || !email || !description) {
    return res
      .status(400)
      .json({ error: "Please fill in all required fields." });
  }

  if (isLocalhost && skipAltchaForDev) {
    console.warn("Skipping ALTCHA verification for localhost (development mode)");
  } else {
    try {
      const { error, verification } = await verifyAltchaPayload(altcha);

      if (error || !verification?.verified) {
        return res.status(400).json({ error: "Failed ALTCHA verification" });
      }
    } catch (err) {
      console.error("ALTCHA error:", err);
      return res.status(500).json({ error: "ALTCHA verification failed" });
    }
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
