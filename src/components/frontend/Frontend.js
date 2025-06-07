import React, { useState } from "react";
import axios from "axios";

function Frontend() {
  const [url, setUrl] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleScrape = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/scrape", {
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
      <br />
      <label for="filter">Choose a filter:</label> <br />
      <input type="text" placeholder="filter by keywords" />
      <select id="filter" name="filter">
        <option value="publication-date">publication date</option>
        <option value="relevance">relevance</option>
      </select>
      {/* the scrape button */}
      <br />
      <button onClick={handleScrape}>Scrape</button>
      {loading && <p>Loading...</p>}
      <ul>
        {articles.map((article, index) => (
          <li key={index}>
            <a href={article.link} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
            <p>Author: {article.author}</p>
            <p>Date: {article.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Frontend;
