
import { google } from "googleapis";

// Ensure environment variables are set
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

export const auth = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    "http://localhost:3000" // Redirect URI (not used for refresh token flow but required)
);

if (REFRESH_TOKEN) {
    auth.setCredentials({ refresh_token: REFRESH_TOKEN });
}

export const drive = google.drive({ version: "v3", auth });

export async function getDriveClient() {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        console.warn("Google Drive credentials not set.");
        return null;
    }
    return drive;
}
