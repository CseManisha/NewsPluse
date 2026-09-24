import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [news, setNews] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [refreshing,setRefreshing] = useState(false);

  // Fetch articles
  const fetchNews = () => {
    setLoading(true);

    fetch(`${import.meta.env.VITE_API_URL}/api/articles`)
      .then((response) => response.json())
      .then((data) => {
        setNews(data);
      })
      .catch((error) => {
        console.log("News Error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Fetch clusters
  const fetchClusters = () => {
    fetch(`${import.meta.env.VITE_API_URL}/api/clusters`)
      .then((response) => response.json())
      .then((data) => {
        console.log("CLUSTERS:", data);
        setClusters(data);
      })
      .catch((error) => {
        console.log("Cluster Error:", error);
      });
  };

  useEffect(() => {
    fetchNews();
    fetchClusters();
  }, []);

  // Search
  const handleSearch = () => {
    if (!search.trim()) {
      fetchNews();
      return;
    }

    const filteredNews = news.filter((article) =>
      article.title
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );

    setNews(filteredNews);
  };

  // Show cluster articles
  const handleClusterClick = async (clusterId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/clusters/${clusterId}`
      );

      const data = await response.json();

      setSelectedCluster({
        clusterId,
        articles: data
      });

    } catch (error) {
      console.log("Cluster details error:", error);
    }
  };

  {/*refresh handle */}

  const handleRefresh = async () => {
  try {
    setRefreshing(true);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/refresh`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    console.log("Refresh:", data);

    if (!response.ok) {
      throw new Error(data.message || "Refresh failed");
    }

    // Check refresh status
    const checkStatus = setInterval(async () => {
      try {
        const statusResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/refresh/status`
        );

        const status = await statusResponse.json();

        console.log("Refresh status:", status);

        if (!status.running) {
          clearInterval(checkStatus);

          setRefreshing(false);

          if (status.success) {
            // Get newly imported data
            fetchNews();
            fetchClusters();

            console.log("Refresh completed successfully");
          } else {
            console.log("Refresh failed:", status.message);
          }
        }
      } catch (error) {
        clearInterval(checkStatus);
        setRefreshing(false);
        console.log("Status error:", error);
      }
    }, 1000);

  } catch (error) {
    setRefreshing(false);
    console.log("Refresh error:", error);
  }
};

  return (
    <div className="container">

      {/* HEADER */}

      <div className="header">

        <h1>News Pulse</h1>

        <p>
          Latest news from multiple sources
        </p>

        <div className="search-box">

          <input
            type="text"
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />

          <button onClick={handleSearch}>
            Search
          </button>

          <button onClick={handleRefresh}
          disabled={refreshing}
          >
          { refreshing ? "Refreshing..":"Refresh"}
          </button>

        </div>

      </div>


      {/* CLUSTERS */}

      <section className="clusters-section">
        <h2>News Topics</h2>

        <div className="clusters">
          {clusters.map((cluster) => (
            <button
              className="cluster-card"
              key={cluster.clusterId}
              onClick={() => handleClusterClick(cluster.clusterId)}
            >
              <span className="cluster-name">
                {cluster.clusterId}
              </span>

              <strong>
                {cluster.articleCount} articles
              </strong>
            </button>
          ))}
        </div>
      </section>


      {/* SELECTED CLUSTER */}

      {selectedCluster && (

        <section className="cluster-details">

          <div className="cluster-header">

            <h2>
              {selectedCluster.clusterId}
            </h2>

            <button
              onClick={() =>
                setSelectedCluster(null)
              }
            >
              Close
            </button>

          </div>

          <div className="cluster-articles">

            {selectedCluster.articles.map((article) => (

              <div
                className="cluster-article"
                key={article._id}
              >

                <h3>
                  {article.title}
                </h3>

                <p>
                  {article.summary}
                </p>

                <span>
                  {article.source}
                </span>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Read Article
                </a>

              </div>

            ))}

          </div>

        </section>

      )}


      {/* LATEST NEWS */}

      <section>

        <h2 className="latest-title">
          Latest News
        </h2>

        <div className="news-container">

          {loading && (
            <p className="loading">
              Loading news...
            </p>
          )}

          {!loading && news.length === 0 && (
            <p className="loading">
              No news found.
            </p>
          )}

          {news.map((article) => (

            <div
              className="news-card"
              key={article._id}
            >

              <div className="news-image">
                📰
              </div>

              <div className="news-content">

                <h3>
                  {article.title}
                </h3>

                <p>
                  {article.summary}
                </p>

                <p className="source">
                  Source: {article.source}
                </p>

                <p className="date">
                  Published:{" "}
                  {article.publishedAt
                    ? new Date(
                      article.publishedAt
                    ).toLocaleString()
                    : "Unknown"}
                </p>

                <p className="cluster">
                  Cluster:{" "}
                  {article.clusterId || "Uncategorized"}
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

      </section>

    </div>
  );
}

export default App;