import React, { useState, useMemo } from "react";
import axios from "axios";
import { Filter } from "./components/frontend/Filter.js";
import { Article } from "./components/frontend/Article.js";
import { LoadingSpinnerAnimation } from "./components/frontend/LoadingSpinnerAnimation.js";
import { ScrapeButtons } from "./components/frontend/ScrapeButtons.js";

function App() {
  const [url, setUrl] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("date");

  // this is the regular scrape code
  const handleScrape = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/scrape",
        { url },
        {
          //use this code to not get blocked by the website
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Upgrade-Insecure-Requests": "1",
          },
        }
      );
      setArticles(response.data);
    } catch (error) {
      console.error("Error scraping:", error);
    } finally {
      setLoading(false);
    }
  };

  // this is the dynamic scrape code
  const handleDynamicScrape = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/scrape-dynamic",
        { url },
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Upgrade-Insecure-Requests": "1",
          },
          timeout: 10000,
        }
      );
      setArticles(response.data);
    } catch (error) {
      console.error("Error in dynamic scrape:", error);
    } finally {
      setLoading(false);
    }
  };

  // this is the filter code
  const filteredAndSorted = useMemo(() => {
    let list = articles.filter((a) =>
      a.title.toLowerCase().includes(keyword.toLowerCase())
    );

    const sorted = [...list].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date) - new Date(a.date);
      } else {
        return (b.relevance || 0) - (a.relevance || 0);
      }
    });
    return sorted;
  }, [articles, keyword, sortBy]);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-700">
          📰 News Scraper
        </h1>
        <h2 className="text-2xl font-bold text-center text-blue-700"></h2>

        <input
          className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL..."
        />

        <Filter
          keyword={keyword}
          sortBy={sortBy}
          onChangeKeyword={setKeyword}
          onChangeSort={setSortBy}
        />

        <ScrapeButtons
          handleScrape={handleScrape}
          handleDynamicScrape={handleDynamicScrape}
        />

        {/* this is the loading spinner animation */}
        {loading && <LoadingSpinnerAnimation />}

        <div>
          <Article article={filteredAndSorted} />
        </div>
      </div>
    </div>
  );
}

export default App;
