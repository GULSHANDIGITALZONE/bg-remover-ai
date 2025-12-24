import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";

const app = express();
app.use(cors());

// memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// health check
app.get("/", (req, res) => {
  res.send("FREE AI Background Remover Running");
});

// remove background using HuggingFace RMBG
app.post("/remove-bg", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const form = new FormData();
    form.append("image", req.file.buffer, {
      filename: req.file.originalname
    });

    const response = await fetch(
      "https://api-inference.huggingface.co/models/briaai/RMBG-1.4",
      {
        method: "POST",
        body: form
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", "image/png");
    res.send(buffer);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Background remove failed" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
