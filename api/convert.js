import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Form parse error" });

    const type = fields.type;
    if (!files.file && type !== "merge" && type !== "split" && type !== "compress" && type !== "protect" && type !== "unlock" && type !== "rotate") {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Read uploaded file as buffer
    let buffer = null;
    let filename = null;
    if (files.file) {
      buffer = await fs.promises.readFile(files.file.filepath);
      filename = files.file.originalFilename;
    }

    // Map type to PDF.co endpoints
    const urlMap = {
      word: "https://api.pdf.co/v1/pdf/convert/to/doc",
      excel: "https://api.pdf.co/v1/pdf/convert/to/xlsx",
      ppt: "https://api.pdf.co/v1/pdf/convert/to/pptx",
      image: "https://api.pdf.co/v1/pdf/convert/to/png",
      merge: "https://api.pdf.co/v1/pdf/merge",
      split: "https://api.pdf.co/v1/pdf/split",
      compress: "https://api.pdf.co/v1/pdf/optimize",
      protect: "https://api.pdf.co/v1/pdf/protect",
      unlock: "https://api.pdf.co/v1/pdf/unlock",
      rotate: "https://api.pdf.co/v1/pdf/rotate"
    };

    const apiUrl = urlMap[type];
    if (!apiUrl) return res.status(400).json({ error: "Invalid type" });

    const FormData = (await import("form-data")).default;
    const formData = new FormData();

    if (buffer) formData.append("file", buffer, filename);

    // Some endpoints need extra parameters
    switch (type) {
      case "protect":
        formData.append("password", "1234"); // Example password
        break;
      case "unlock":
        formData.append("password", fields.password || "1234");
        break;
      case "rotate":
        formData.append("angle", fields.angle || "90"); // default 90 degrees
        break;
      case "merge":
      case "split":
      case "compress":
        // Optional additional parameters can go here
        break;
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "x-api-key": "Q2FWxKPItP8orgCEX0UdyjMRzughFWahcpMPXrpe8o2Sy7CPkpX2PZdshWUosCe5" },
        body: formData
      });

      const data = await response.json();
      res.status(200).json(data);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  });
}
