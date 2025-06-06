import React, { useState } from "react";
import axios from "axios";
import * as cheerio from "cheerio";

function App() {
  const [url, setUrl] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const handleScrape = async () => {
    try {
      setLoading(true);
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
      const scrapedArticles = [];

      $("article").each((i, el) => {
        const title = $(el).find("h1, h2, h3").first().text().trim();
        const author = $(el)
          .find('[rel="author"], .author, .byline')
          .text()
          .trim();
        const date =
          $(el).find("time").attr("datetime") ||
          $(el).find("time").text().trim();
        let source = new URL(url).hostname;
        let link = $(el).find("a").attr("href");

        // Convert relative links to absolute
        if (link && !link.startsWith("http")) {
          const baseUrl = new URL(url);
          link = baseUrl.origin + link;
        }

        if (title) {
          scrapedArticles.push({ title, author, date, source, link });
        }
      });

      setArticles(scrapedArticles);
    } catch (error) {
      console.error("Scraping error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles
    .filter((article) =>
      article.title.toLowerCase().includes(keyword.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.date) - new Date(a.date);
      } else {
        return new Date(a.date) - new Date(b.date);
      }
    });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4 font-sans">
      <h1 className="text-2xl font-bold">📰 News Scraper with Cheerio</h1>

      <div className="flex flex-col gap-2">
        <input
          className="border p-2 rounded"
          placeholder="Enter website URL (with https://)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          onClick={handleScrape}
          disabled={loading || !url}
        >
          {loading ? "Scraping..." : "Scrape Headlines"}
        </button>
        <input
          className="border p-2 rounded"
          placeholder="Filter by keyword (e.g., technology)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="newest">Sort by Newest</option>
          <option value="oldest">Sort by Oldest</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((a, index) => (
            <div
              key={index}
              className="border p-4 rounded shadow hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold">
                <a
                  href={a.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {a.title}
                </a>
              </h2>
              <p className="text-sm text-gray-600">
                By: {a.author || "Unknown"} | {a.date || "Unknown date"} |
                Source: {a.source}
              </p>
            </div>
          ))
        ) : (
          <p>No articles to display.</p>
        )}
      </div>
    </div>
  );
}

export default App;
