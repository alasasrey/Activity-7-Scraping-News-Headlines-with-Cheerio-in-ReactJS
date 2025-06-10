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

const app = express();
const PORT = 4000;

app.use(json());
//use this code to not get block by other websites
app.use(cors());

//regular version
app.post("/scrape", async (req, res) => {
  const { url } = req.body;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const websiteName = new URL(url).hostname.replace("www.", "");
    const articles = [];

    // Loop through multiple heading tags
    $("h1, h2, h3").each((i, element) => {
      const title = $(element).text().trim();

      // Try to find the closest link or parent link
      let link =
        $(element).find("a").attr("href") ||
        $(element).closest("a").attr("href");

      // if link it a link use the url if not use null
      const absoluteLink = link ? new URL(link, url).href : null;

      // Look for nearest time or author elements within parent or ancestor
      const parent = $(element).closest("article, div, section");

      let author =
        parent.find('[itemprop="author"], [rel="author"]').text().trim() ||
        parent
          .find(".author a, .byline a, .writer a, .contributor a")
          .first()
          .text()
          .trim() ||
        parent
          .find(".author, .byline, .writer, .contributor")
          .first()
          .text()
          .trim();

      //if still unknown find it in another element
      if (!author || author === "Unknown") {
        author =
          $('[itemprop="author"], [rel="author"]').first().text().trim() ||
          $(".author a, .byline a, .writer a, .contributor a")
            .first()
            .text()
            .trim() ||
          $(".author, .byline, .writer, .contributor").first().text().trim() ||
          "Unknown";
      }

      let date =
        parent.find("time").attr("datetime") ||
        parent.find("time").text().trim() ||
        parent.find(".date, .published, .pubdate").first().text().trim();

      //if still unknown find it in another element
      if (!date || date === "Unknown" || date === "") {
        date =
          $("time").attr("datetime") ||
          $("time").text().trim() ||
          $(".date, .published, .pubdate").first().text().trim() ||
          $('meta[property="article:published_time"]').attr("content") ||
          $('meta[name="pubdate"]').attr("content") ||
          $('meta[name="date"]').attr("content") ||
          "Unknown";
      }

      const relevance =
        parent.find(".tag, .label, .category, .badge").first().text().trim() ||
        "None";

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
    });

    //use this code to send the data to the frontend
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
    const websiteName = new URL(url).hostname.replace("www.", "");
    const $ = cheerio.load(content);
    const articles = [];

    $("h1, h2, h3").each((i, element) => {
      const title = $(element).text().trim();
      let link =
        $(element).find("a").attr("href") ||
        $(element).closest("a").attr("href");
      const absoluteLink = link ? new URL(link, url).href : null;

      const parent = $(element).closest("article, div, section");

      // Look for author
      const author =
        parent.find('[itemprop="author"]').text().trim() ||
        parent.find('[rel="author"]').text().trim() ||
        parent
          .find(".author, .byline, .writer, .contributor")
          .first()
          .text()
          .trim() ||
        "Unknown";

      // Look for date
      const date =
        parent.find("time").attr("datetime") ||
        parent.find("time").text().trim() ||
        parent.find(".date, .published, .pubdate").first().text().trim() ||
        "Unknown";

      const relevance =
        parent.find(".tag, .label, .category, .badge").first().text().trim() ||
        "None";

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
    });

    //to really make sure the scraper finds the author
    await page.waitForSelector(".author, .byline, .writer, .contributor", {
      timeout: 5000,
    });
    await browser.close();
    //use this code to send the data to the frontend
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: "Error scraping the dynamic website." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
