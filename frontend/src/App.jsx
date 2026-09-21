import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/news")
      .then((response) => response.json())
      .then((data) => {
        setNews(data.articles);
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  }, []);

  return (
    <div className="container">

      <div className="header">
        <h1>News Pulse</h1>
        <p>Latest technology news in one place</p>
      </div>

      <div className="news-container">

        {news.map((article, index) => (
          <div className="news-card" key={index}>

            <img
              src={article.urlToImage}
              alt={article.title}
            />

            <div className="news-content">

              <h3>{article.title}</h3>

              <p>
                {article.description}
              </p>

              <p className="source">
                Source: {article.source?.name}
              </p>

              <a
                className="read-more"
                href={article.url}
                target="_blank"
                rel="noreferrer"
              >
                Read More
              </a>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default App;