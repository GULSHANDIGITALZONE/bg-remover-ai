const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const FormData = require("form-data");

const app = express();
app.use(cors());

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

app.post("/remove-bg", upload.single("image"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("image_file", req.file.buffer, req.file.originalname);
    formData.append("size", "auto");

    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "X-Api-Key": process.env.REMOVE_BG_KEY
        },
        responseType: "arraybuffer"
      }
    );

    res.set("Content-Type", "image/png");
    res.send(response.data);

  } catch (err) {
    res.status(500).send("Background remove failed");
  }
});

app.get("/", (req, res) => {
  res.send("BG Remover Backend Running");
});

app.listen(3000, () => {
  console.log("Server running");
});
