import React, { useState } from "react";
import axios from "axios";
import { Filter } from "./components/frontend/Filter.js";
import { Article } from "./components/frontend/Article.js";

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
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-700">
          📰 News Scraper
        </h1>

        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">
            Enter website URL:
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        {/* Filter section */}
        <div>
          <Filter />
        </div>

        {/* Scrape button */}
        <div className="text-center">
          <button
            onClick={handleScrape}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
          >
            Scrape
          </button>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Articles section */}
        <div>
          <Article article={articles} />
        </div>
      </div>
    </div>
  );
}

export default App;
