import express from "express";
import nodemailer from "nodemailer";
import { getAccessToken } from "./getTokens.js"; // Импортируйте вашу функцию получения токена
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const app = express();
const PORT = process.env.PORT || 443;
const ORIGIN = process.env.CORS_ORIGIN;

app.use(
  cors({
    origin: ORIGIN,
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type,Authorization",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.options("/api/send", cors());

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

app.post("/api/send", async (req, res) => {
  const { fname, lname, email, phone, description } = req.body;

  console.log("Received data:", req.body);

  if (!fname || !lname || !email || !description) {
    return res.status(400).send("Please fill in all required fields.");
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
    res.send("Message sent successfully");
  } catch (error) {
    res.status(500).send("Submit error.");
  }
});

app.listen(PORT);
