function Filter() {
  return (
    <div className="bg-gray-50 p-4 rounded-xl shadow-sm space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        🔍 Choose a filter:
      </label>

      <input
        type="text"
        placeholder="Filter by keywords..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />

      <select
        id="filter"
        name="filter"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="publication-date">📅 Publication Date</option>
        <option value="relevance">⭐ Relevance</option>
      </select>
    </div>
  );
}

export { Filter };
