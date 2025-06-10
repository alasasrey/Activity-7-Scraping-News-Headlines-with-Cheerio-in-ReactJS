function ScrapeButtons(props) {
  return (
    <div className="text-center space-x-4">
      <button
        onClick={props.handleScrape}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
      >
        Scrape
      </button>

      <button
        onClick={props.handleDynamicScrape}
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg"
      >
        Dynamic Scrape
      </button>
    </div>
  );
}

export { ScrapeButtons };
