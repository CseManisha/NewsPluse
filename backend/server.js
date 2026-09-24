const express = require("express");
const cors = require("cors");
require("dotenv").config();


//  article and cluster  path

const Article = require("./models/Article");
const Cluster = require("./models/Cluster");


const fs = require("fs");
const path = require("path");
const {spawn}=require("child_process");



const connectDB = require("./config/db");

const app = express();

// adding refresh status

let ingestionStatus = {
  running: false,
  success: null,
  message: "Idle"
};

app.use(cors());
app.use(express.json());

connectDB();


app.get("/", (req, res) => {
  res.send("News Pulse Backend Running");
});


// refresh route

const importArticlesAndClusters = async () => {
  const filePath = path.join(__dirname, "../scraper/articles.json");

  const data = fs.readFileSync(filePath, "utf-8");
  const articles = JSON.parse(data);

  const clusterMap = {};

  // Save articles
  for (const article of articles) {
    await Article.findOneAndUpdate(
      { url: article.url },
      {
        title: article.title,
        summary: article.summary,
        content: article.content,
        source: article.source,
        url: article.url,
        publishedAt: article.publishedAt,
        clusterId: article.clusterId
      },
      {
        new: true,
        upsert: true
      }
    );

    // Count clusters
    if (article.clusterId) {
      if (!clusterMap[article.clusterId]) {
        clusterMap[article.clusterId] = 0;
      }

      clusterMap[article.clusterId]++;
    }
  }

  // Save clusters
  for (const clusterId in clusterMap) {
    await Cluster.findOneAndUpdate(
      { clusterId: clusterId },
      {
        clusterId: clusterId,
        label: clusterId,
        articleCount: clusterMap[clusterId]
      },
      {
        new: true,
        upsert: true
      }
    );
  }

  return {
    articles: articles.length,
    clusters: Object.keys(clusterMap).length
  };
};

// refersh api

app.post("/api/refresh", (req, res) => {
  if (ingestionStatus.running) {
    return res.status(409).json({
      message: "Refresh is already running"
    });
  }

  ingestionStatus = {
    running: true,
    success: null,
    message: "Scraping latest news..."
  };

  const pythonProcess = spawn(
    "python",
    ["scraper.py"],
    {
      cwd: path.join(__dirname, "../scraper")
    }
  );

  pythonProcess.stdout.on("data", (data) => {
    console.log(`Python: ${data}`);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.log(`Python Error: ${data}`);
  });

  pythonProcess.on("close", async (code) => {
    if (code !== 0) {
      ingestionStatus = {
        running: false,
        success: false,
        message: "Python scraper failed"
      };

      return;
    }

    try {
      ingestionStatus.message = "Importing news into MongoDB...";

      const result = await importArticlesAndClusters();

      ingestionStatus = {
        running: false,
        success: true,
        message: `Refresh completed: ${result.articles} articles and ${result.clusters} clusters`
      };

      console.log(ingestionStatus.message);

    } catch (error) {
      console.log("IMPORT ERROR:", error);

      ingestionStatus = {
        running: false,
        success: false,
        message: "MongoDB import failed"
      };
    }
  });

  res.json({
    message: "Refresh started"
  });
});
// status of refersh 
app.get("/api/refresh/status", (req, res) => {
  res.json(ingestionStatus);
});

// News API  Integration

app.get("/api/news", async (req, res) => {
  try {

    const {search}= req.query;
    console.log("search term",search);
    
    const query= search || "technology";

    const response = await fetch(
  `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`
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


// article route
app.post("/api/articles", async (req, res) => {
  try {
    const article = await Article.create(req.body);

    res.status(201).json({
      message: "Article saved successfully",
      article
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to save article",
      error: error.message
    });
  }
});

// importinf articles

app.get("/api/import-news", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "../scraper/articles.json");

    const data = fs.readFileSync(filePath, "utf-8");
    const articles = JSON.parse(data);

    const clusterMap = {};

    // Save articles
    for (const article of articles) {
      await Article.findOneAndUpdate(
        { url: article.url },
        {
          title: article.title,
          summary: article.summary,
          content: article.content,
          source: article.source,
          url: article.url,
          publishedAt: article.publishedAt,
          clusterId: article.clusterId
        },
        {
          new: true,
          upsert: true
        }
      );

      // Count articles in each cluster
      if (article.clusterId) {
        if (!clusterMap[article.clusterId]) {
          clusterMap[article.clusterId] = 0;
        }

        clusterMap[article.clusterId]++;
      }
    }

    // Save clusters
    for (const clusterId in clusterMap) {
      await Cluster.findOneAndUpdate(
        { clusterId: clusterId },
        {
          clusterId: clusterId,
          label: clusterId,
          articleCount: clusterMap[clusterId]
        },
        {
          new: true,
          upsert: true
        }
      );
    }

    res.json({
      message: "Articles and clusters imported successfully",
      articles: articles.length,
      clusters: Object.keys(clusterMap).length
    });

  } catch (error) {
    console.log("IMPORT ERROR:", error);

    res.status(500).json({
      message: "Import failed",
      error: error.message
    });
  }
});

// get artical api
app.get("/api/articles", async (req, res) => {
  try {
    const articles = await Article.find()
      .sort({ publishedAt: -1 });

    res.json(articles);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch articles",
      error: error.message
    });
  }
});

// get api cluster
app.get("/api/clusters", async (req, res) => {
  try {
    const clusters = await Cluster.find()
      .sort({ createdAt: 1 });

    res.json(clusters);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch clusters",
      error: error.message
    });
  }
});


// add cluster details api

app.get("/api/clusters/:clusterId", async (req, res) => {
  try {
    const articles = await Article.find({
      clusterId: req.params.clusterId
    }).sort({ publishedAt: -1 });

    res.json(articles);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch cluster articles",
      error: error.message
    });
  }
});


// server port
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});