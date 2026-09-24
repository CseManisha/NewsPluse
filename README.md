# 📰 News Pulse

News Pulse is a full-stack news aggregation application that collects news articles from multiple sources, extracts article content, groups related articles into topics, and stores the data in MongoDB.

The application provides a simple interface to browse the latest news, search articles, view news topics, and refresh the news data using a Python scraper.

---

## 🚀 Features

* 📰 Collects news from multiple RSS sources
* 🌐 Supports BBC, NPR, and The Guardian
* 🐍 Python-based news scraper
* 📄 Extracts article title, summary, content, source, URL, and publication date
* 🔗 Groups related articles using keyword-based topic clustering
* 💾 Stores articles and clusters in MongoDB Atlas
* 🔍 Search news by title
* 🏷️ Displays news topics/clusters
* 📚 View articles belonging to a particular cluster
* 🔄 Refresh button triggers the complete news ingestion process
* 📱 Responsive frontend for desktop, tablet, and mobile
* 🔗 Read the original article from the source website

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* CSS

### Backend

* Node.js
* Express.js
* Mongoose

### Scraper

* Python
* Feedparser
* Requests
* BeautifulSoup

### Database

* MongoDB Atlas

### Deployment

* Vercel
* Render

---

## 📂 Project Structure

```text
News-Pulse/
│
├── scraper/
│   ├── scraper.py
│   ├── articles.json
│   └── requirements.txt
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── models/
│   │   ├── Article.js
│   │   └── Cluster.js
│   │
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── ...
│
├── README.md
└── .gitignore
```

---

## 🔄 How the Application Works

The application follows this flow:

```text
RSS News Sources
       ↓
Python Scraper
       ↓
Extract Article Data
       ↓
Keyword-Based Clustering
       ↓
articles.json
       ↓
Node.js / Express Backend
       ↓
MongoDB Atlas
       ↓
React Frontend
```

---

## 🐍 Python Scraper

The Python scraper collects news articles from:

* BBC
* NPR
* The Guardian

For each article, it extracts:

```text
Title
Summary
Content
Source
URL
Published Date
Cluster ID
```

The scraper then groups related articles using keyword overlap.

For example:

```text
Article 1 → AI + technology + software
Article 2 → AI + technology + software
Article 3 → football + match + team
```

The first two articles may be placed into the same cluster because they share relevant keywords.

The scraped data is saved in:

```text
scraper/articles.json
```

---

## 🧩 Topic Clustering

News articles are grouped using a simple keyword-based approach.

The scraper:

1. Combines the article title and summary.
2. Removes common stop words.
3. Extracts meaningful keywords.
4. Compares keywords between articles.
5. Places articles with enough common keywords into the same cluster.

Each article receives a `clusterId`, for example:

```text
cluster-1
cluster-2
cluster-3
```

---

## 💾 MongoDB Database

The project uses MongoDB Atlas.

Database:

```text
NewsPluseDB
```

Collections:

```text
articles
clusters
```

### Articles Collection

Stores:

```text
title
summary
content
source
url
publishedAt
clusterId
```

### Clusters Collection

Stores:

```text
clusterId
label
articleCount
```

---

## 🔌 API Endpoints

### Get Backend Status

```http
GET /
```

Returns:

```text
News Pulse Backend Running
```

### Get All Articles

```http
GET /api/articles
```

Returns all stored news articles.

### Get All Clusters

```http
GET /api/clusters
```

Returns all news topics/clusters.

### Get Articles From a Cluster

```http
GET /api/clusters/:clusterId
```

Example:

```http
GET /api/clusters/cluster-1
```

### Search News

```http
GET /api/news?search=technology
```

This endpoint is used for the news search functionality.

### Import News

```http
GET /api/import-news
```

Imports scraped articles from `articles.json` into MongoDB.

### Refresh News

```http
POST /api/refresh
```

Starts the complete ingestion process:

```text
Run Python scraper
       ↓
Update articles.json
       ↓
Import articles
       ↓
Update clusters
       ↓
Refresh frontend data
```

### Refresh Status

```http
GET /api/refresh/status
```

Returns the current ingestion status.

---

## 🔍 Search

Users can search news using the search bar.

For example:

```text
AI
Technology
Football
Climate
Science
```

The frontend filters the available news articles based on the search term.

---

## 🏷️ News Clusters

The application displays news topics as cluster tags.

Example:

```text
cluster-1    2 articles
cluster-2    1 article
cluster-3    3 articles
```

Clicking a cluster displays the articles belonging to that topic.

---

## 🔄 Refresh Process

When the user clicks the **Refresh** button:

```text
User clicks Refresh
        ↓
POST /api/refresh
        ↓
Node.js starts Python
        ↓
Python collects latest RSS articles
        ↓
articles.json is updated
        ↓
Node.js imports articles
        ↓
MongoDB articles collection updated
        ↓
MongoDB clusters collection updated
        ↓
React fetches latest data
```

The frontend also displays:

```text
Refreshing...
```

while the process is running.

---

## 💻 Run Locally

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd News-Pulse
```

---

### 2. Install Python dependencies

Go to the scraper folder:

```bash
cd scraper
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

### 3. Run the Python scraper

```bash
python scraper.py
```

This creates/updates:

```text
articles.json
```

---

### 4. Install backend dependencies

Open a new terminal:

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
```

---

### 5. Start the backend

```bash
node server.js
```

The backend runs on:

```text
http://localhost:5000
```

---

### 6. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

Create/update your frontend environment file:

```env
VITE_API_URL=http://localhost:5000
```

---

### 7. Start the frontend

```bash
npm run dev
```

Open the URL shown by Vite in the terminal.

---

## 🌐 Deployment

### Frontend

The frontend can be deployed using Vercel.

### Backend

The backend can be deployed using Render.

Environment variables such as the MongoDB connection string should be added through the deployment platform instead of committing `.env` files to GitHub.

---

## 🔐 Environment Variables

### Backend

```env
MONGO_URI=your_mongodb_connection_string
```

### Frontend

```env
VITE_API_URL=your_backend_url
```

Never commit sensitive environment variables or API keys to GitHub.

---

## 📱 Responsive Design

The frontend is designed to work across:

* Desktop
* Tablet
* Mobile

The news cards automatically adjust according to screen size.

---

## 🎯 Project Goal

The goal of News Pulse is to demonstrate a complete full-stack data pipeline:

```text
Data Collection
      ↓
Data Processing
      ↓
Topic Grouping
      ↓
Database Storage
      ↓
REST API
      ↓
React UI
```

This project demonstrates practical experience with **React, Node.js, Express.js, MongoDB, Python, APIs, web scraping, data processing, and deployment**.

---

## 👩‍💻 Author

**Manisha**

B.Tech Student | MERN Stack Developer

GitHub: `https://github.com/CseManisha`
GitHub Repo Url: `https://github.com/CseManisha/NewsPluse.git`
vercel Live Link: `https://news-pluse-virid.vercel.app/ `
---

## 📌 Future Improvements

* Add automatic scheduled news updates
* Add better topic names instead of cluster IDs
* Add source-based filtering
* Add pagination
* Add article images
* Improve topic clustering using NLP
* Add authentication for admin features
* Add detailed timeline visualization
