import $ from 'jquery';

const articlesContainer = $('[data-role="rss-articles"]');

const parseArticles = (article) => {
  const title = $(article).find('title').html();
  const link = $(article).find('link').html();
  const description = $(article).find('description').get(0).textContent;
  return { description, link, title };
};

const renderArticle = articleData =>
  `<li class="list-group-item article">
    <button data-role="rss-article-details"
      class="btn btn-primary article__button">See details</button>
    <p class="article__description d-none">${articleData.description}</p>
    <a class="article__link" href="${articleData.link}">${articleData.title}</a>
  </li>`;

export default (articles) => {
  articles.map(article => articlesContainer
    .append(renderArticle(parseArticles(article))));
};
