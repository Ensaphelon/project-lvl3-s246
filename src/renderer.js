import $ from 'jquery';

const renderArticle = articleData =>
  `<li class="list-group-item article">
    <button data-role="rss-article-details"
      class="btn btn-primary article__button">See details</button>
    <p class="article__description d-none">${articleData.description}</p>
    <a class="article__link" href="${articleData.link}">${articleData.title}</a>
  </li>`;

export default articles => articles
  .map(article => $('[data-role="rss-articles"]').prepend(renderArticle(article)));
