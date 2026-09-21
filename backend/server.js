const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("News Pulse Backend Running");
});

// News API key Integration

app.get("/api/news", async (req, res) => {
  try {
    const response = await fetch(
  `https://newsapi.org/v2/everything?q=technology&language=en&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`
);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to fetch news",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});