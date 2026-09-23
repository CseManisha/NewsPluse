import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState ("");


useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/api/news`)
    .then((response) => response.json())
    .then((data) => {
      console.log("API DATA:", data);
      setNews(data.articles || []);
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}, []);

{/* search barr code */}
const handleSearch = () => {
  if (!search.trim()) {
    return;
  }

  fetch(
    `${import.meta.env.VITE_API_URL}/api/news?search=${encodeURIComponent(search)}`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("SEARCH DATA:", data);
      setNews(data.articles || []);
    })
    .catch((error) => {
      console.log("Search Error:", error);
    });
};


  return (
    <div className="container">

      <div className="header">
        <h1>News Pulse</h1>
        <p>Latest technology news in one place</p>
         
             {/* Search Bar */}
          <div className="search-box">
          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button onClick={handleSearch} >Search</button>
        </div>

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