// REMINDER: WHEN CODING IN THIS SERVER MAKE SURE TO RUN THIS CMD COMMAND:
// "npm run nodemon-server" use nodemon to automatically restart the server for you!
//INSTALL THE NODEMON IF YOU DON'T HAVE IN YOUR NPM: "npm install -g nodemon"
// TO MAKE SURE THAT YOUR CODE IS WORKING OR NOT!

import express, { json } from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "url";
import puppeteer from "puppeteer";
import cors from "cors";
import robotsParser from "robots-parser";
import bodyParser from "body-parser";

const app = express();
const PORT = 4000;

app.use(json());
//use this code to not get block by other websites
app.use(cors());
app.use(bodyParser.json());

//regular version
app.post("/scrape", async (req, res) => {
  const { url } = req.body;

  // check if URL is valid
  if (!url) throw new Error("URL is required");

  try {
    const parsedUrl = new URL(url);
    const robotsUrl = `${parsedUrl.origin}/robots.txt`;

    const robotsRes = await axios.get(robotsUrl).catch(() => null);
    const robots = robotsRes
      ? robotsParser(robotsUrl, robotsRes.data)
      : robotsParser(robotsUrl, "User-agent: *\nDisallow:");

    const isAllowed = robots.isAllowed(url, "Mozilla/5.0");

    if (!isAllowed) {
      return res
        .status(403)
        .json({ error: "Scraping is disallowed by robots.txt for this URL." });
    }

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const websiteName = new URL(url).hostname.replace("www.", "");
    const articles = [];

    // Loop through multiple heading tags
    $("article, .news-feature, .item, .articles, h1, h2, h3, div").each(
      (i, element) => {
        const title = $(element).text().trim();

        // Try to find the closest link or parent link
        let link =
          $(element).find("a").attr("href") ||
          $(element).closest("a").attr("href");

        // if it is a link use the url if not use null
        const absoluteLink = link ? new URL(link, url).href : null;

        // Look for nearest time or author elements within parent or ancestor
        const parent =
          $(element).closest("article, div, section, a, span") ||
          $(element).find("article, div, section, a, span");

        let date = $("time").first().text().trim();
        let author =
          $(".author").text().trim() || $('span:contains("By")').text().trim();

        let ld = $('script[type="application/ld+json"]').html();
        if (ld) {
          const data = JSON.parse(ld);
          if (!author) {
            author = Array.isArray(data.author)
              ? data.author[0]?.name
              : data.author?.name || data.author;
          }
          if (!date && data.datePublished) {
            date = data.datePublished;
          }
        }

        const relevance =
          parent
            .find(".tag, .label, .category, .badge")
            .first()
            .text()
            .trim() || "None";

        if (title && absoluteLink) {
          articles.push({
            title,
            author,
            date,
            link: absoluteLink,
            source: websiteName,
            relevance,
          });
        }
      }
    );

    //use this code to send the data to the frontend
    res.json(articles);
  } catch (error) {
    console.error("🧪 Error during /scrape:", {
      message: error.message,
      stack: error.stack,
      responseStatus: error.response?.status,
      responseData: error.response?.data?.substring?.(0, 200),
    });
    res.status(500).json({ error: "Error scraping the website." });
  }
});

//dynamic version
app.post("/scrape-dynamic", async (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ message: "Invalid URL" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      "accept-language": "en-US,en;q=0.9",
    });

    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Get the full rendered HTML
    const html = await page.content();
    await browser.close();

    const $ = cheerio.load(html);
    console.log(html);
    const websiteName = new URL(url).hostname.replace("www.", "");

    const articles = [];

    $("article, .news-feature, .item, .articles, h1, h2, h3, body").each(
      (i, el) => {
        const title =
          $(el).find("h1, h2, h3, .title").first().text().trim() || "No title";
        const link = $(el).find("a").first().attr("href") || "";
        const author =
          $('meta[name="author"]').attr("content") ||
          $(el).find(".author, .byline").first().text().trim() ||
          "Unknown";
        const date =
          $('meta[property="article:published_time"]').attr("content") ||
          $(el).find("time").first().attr("datetime") ||
          "Unknown";

        articles.push({ title, link, author, date, source: websiteName });
      }
    );

    res.json(articles);
  } catch (error) {
    console.error("Scraping failed:", error.message);
    res.status(500).json({ message: "Scraping failed", error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
