import express from "express";
import nodemailer from "nodemailer";
import { getAccessToken } from "./getTokens.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const ORIGIN = process.env.CORS_ORIGIN;

app.use(
  cors({
    origin: ORIGIN,
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

console.log("NodeMailer transporter:", transporter);

app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!" });
});

app.post("/api/send", async (req, res) => {
  const { fname, lname, email, phone, description } = req.body;

  if (!fname || !lname || !email || !description) {
    console.log("Missing required fields");
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

    console.log("Sending email...");
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Submit error." });
  }
});

export default app;
