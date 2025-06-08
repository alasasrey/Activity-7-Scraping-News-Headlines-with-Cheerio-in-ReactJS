import express, { json } from "express";
import axios from "axios";
import cheerio from "cheerio";
import { URL } from "url";
import puppeteer from "puppeteer";

const app = express();
const PORT = 3000;

app.use(json());

//regular version
app.post("/scrape", async (req, res) => {
  const { url } = req.body;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const articles = [];

    $("article").each((i, elem) => {
      const title = $(elem).find("h1, h2, h3").first().text().trim();
      const author =
        $(elem).find('[itemprop="author"]').text().trim() || "Unknown";
      const date = $(elem).find("time").attr("datetime") || "Unknown";
      const link = $(elem).find("a").attr("href");
      const absoluteLink = new URL(link, url).href;

      if (title) {
        articles.push({ title, author, date, link: absoluteLink });
      }
    });

    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: "Error scraping the website." });
  }
});

//dynamic version
app.post("/scrape-dynamic", async (req, res) => {
  const { url } = req.body;
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    const content = await page.content();
    const $ = cheerio.load(content);
    const articles = [];

    $("article").each((i, elem) => {
      const title = $(elem).find("h1, h2, h3").first().text().trim();
      const author =
        $(elem).find('[itemprop="author"]').text().trim() || "Unknown";
      const date = $(elem).find("time").attr("datetime") || "Unknown";
      const link = $(elem).find("a").attr("href");
      const absoluteLink = new URL(link, url).href;

      if (title) {
        articles.push({ title, author, date, link: absoluteLink });
      }
    });

    await browser.close();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: "Error scraping the dynamic website." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
