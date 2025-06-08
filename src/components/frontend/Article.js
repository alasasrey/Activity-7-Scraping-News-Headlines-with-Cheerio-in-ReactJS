function Article(props) {
  return (
    <div>
      <ul>
        {props.article.map((article, index) => (
          <li key={index}>
            <a href={article.link} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
            <p>Author: {article.author}</p>
            <p>Date: {article.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Article;
