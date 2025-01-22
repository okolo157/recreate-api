const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Middleware
app.use(cors());

// Gemini API endpoint
app.post("/api/generate-code", async (req, res) => {
  const { image, framework } = req.body;

  if (!image || !framework) {
    return res.status(400).json({ error: "Image and framework are required" });
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              { text: `Convert this UI to ${framework} code:` },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: image,
                },
              },
            ],
          },
        ],
      }
    );

    const rawCode = response.data.candidates[0].content.parts[0].text;
    const cleanedCode = rawCode
      .replace(/```[\s\S]*?\n/, "")
      .replace(/```$/, "");
    res.json({ code: cleanedCode });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to generate code" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
