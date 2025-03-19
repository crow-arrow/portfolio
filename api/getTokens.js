import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

export async function getAccessToken() {
  try {
    const { token } = await oauth2Client.getAccessToken();
    return token;
  } catch (error) {
    console.error("Error generating access token:", error);
    throw new Error("Error generating access token");
  }
}
