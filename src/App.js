import React, { useState } from "react";
import axios from "axios";
import { Filter } from "./components/frontend/Filter";
import { Article } from "./components/frontend/Article";

function App() {
  const [url, setUrl] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleScrape = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/scrape", {
        url,
      });
      setArticles(response.data);
    } catch (error) {
      console.error("Error scraping the website:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>News Scraper</h1>
      <label for="">Enter website URL: </label>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter website URL"
      />

      {/* filter section */}
      <Filter />

      {/* the scrape button */}
      <br />
      <button onClick={handleScrape}>Scrape</button>

      {/* loading spinner or progress indicator */}
      {loading && <p>Loading...</p>}

      {/* some articles that are being scrape */}
      <Article article={articles} />
    </div>
  );
}

export default App;
