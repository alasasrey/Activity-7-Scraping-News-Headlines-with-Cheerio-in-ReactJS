function Filter() {
  return (
    <div>
      <br />
      <label for="filter">Choose a filter:</label> <br />
      <input type="text" placeholder="filter by keywords" />
      <select id="filter" name="filter">
        <option value="publication-date">publication date</option>
        <option value="relevance">relevance</option>
      </select>
    </div>
  );
}

export default Filter;
