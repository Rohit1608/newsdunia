import { google } from "googleapis";
import path from "path";
import { promises as fs } from "fs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { data, sheetId } = req.body;

  try {
    const keyFile = path.join(process.cwd(), "credentials.json");
    const keyFileContent = await fs.readFile(keyFile, "utf-8");
    const credentials = JSON.parse(keyFileContent);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    await sheets.spreadsheets.values.update({
      spreadsheetId: sheetId,
      range: "A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          ["Author", "Articles", "Total Payout ($)"],
          ...data.map((entry) => [
            entry.author,
            entry.count,
            entry.total.toFixed(2),
          ]),
        ],
      },
    });

    return res.status(200).json({ message: "Exported to Google Sheets!" });
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
