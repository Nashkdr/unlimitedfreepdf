import formidable from "formidable";
import fetch from "node-fetch";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = formidable({ multiples: false });
  
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Form parse error" });

    const type = fields.type;
    if (!files.file) return res.status(400).json({ error: "No file uploaded" });

    const file = files.file;
    const buffer = await fs.promises.readFile(file.filepath); // async read buffer

    const urlMap = {
      word: "https://api.pdf.co/v1/pdf/convert/to/doc",
      excel: "https://api.pdf.co/v1/pdf/convert/to/xlsx",
      ppt: "https://api.pdf.co/v1/pdf/convert/to/pptx",
      image: "https://api.pdf.co/v1/pdf/convert/to/png"
    };

    const apiUrl = urlMap[type];
    if (!apiUrl) return res.status(400).json({ error: "Invalid type" });

    const formData = new (await import("form-data")).default();
    formData.append("file", buffer, file.originalFilename);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "x-api-key": "Q2FWxKPItP8orgCEX0UdyjMRzughFWahcpMPXrpe8o2Sy7CPkpX2PZdshWUosCe5" },
        body: formData
      });

      const data = await response.json();
      res.status(200).json(data);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
