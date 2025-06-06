//REMINDER: USE NODEJS ON THE SERVER TO BYPASS THE CORS ERROR
//DELETE THIS FILE IF NOT NEEDED!

import axios from "axios";
import * as cheerio from "cheerio";
import { log } from "node:console";
import * as fs from "node:fs";

//USE THIS ALTERNATIVE REQUIRE IF THE IMPORT IS NOT WORKING
// const axios = require("axios");
// const cheerio = require("cheerio");
// const fs = require("node:fs");

// use this to not get block by the website
const config = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  },
};

function WebScrapers() {
  axios
    .get("https://www.scrapingcourse.com/ecommerce/", config)
    .then(({ data }) => {
      const $ = cheerio.load(data);

      const products = $("li.product")
        .map((_, product) => {
          const $product = $(product);
          const name = $product.find(".woocommerce-loop-product__title").text();
          const price = $product.find(".woocommerce-Price-amount").text();
          return { name: name, price: price };
        })
        .toArray();

      console.log(products);

      // fs.appendFile("mynewfile1.html", "" + $("div"), (err) => {
      //   if (err) throw err;
      //   console.log("Saved!");
      // });
    });
}

WebScrapers();

export default WebScrapers;
