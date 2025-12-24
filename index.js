const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
app.use(cors());

// ✅ VERY IMPORTANT: memoryStorage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// health check
app.get("/", (req, res) => {
  res.send("BG Remover Backend Running");
});

// remove background
app.post("/remove-bg", upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Image buffer not found" });
    }

    const formData = new FormData();
    formData.append(
      "image_file",
      req.file.buffer,
      req.file.originalname
    );
    formData.append("size", "auto");

    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "X-Api-Key": process.env.REMOVE_BG_KEY
        },
        responseType: "arraybuffer",
        timeout: 60000
      }
    );

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", "inline; filename=bg.png");
    res.send(response.data);

  } catch (err) {
    console.error("REMOVE.BG ERROR:", err.response?.data || err.message);

    res.status(500).json({
      error: "Background remove failed",
      details: err.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
