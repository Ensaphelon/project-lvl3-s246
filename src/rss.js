import { get } from 'axios';
import { find } from 'lodash';
import parseRss from './parsers';
import renderArticles from './renderer';

const sortArticlesByTime = articles => articles.sort((a, b) => a.date < b.date);

const updateFeed = (articles, feedUrl, state) => {
  const existedFeed = find(state.feeds, feed => feed.feedUrl === feedUrl);
  if (existedFeed) {
    const diffCount = articles.length - existedFeed.articles.length;
    if (diffCount) {
      const newArticles = articles.slice(0, diffCount);
      newArticles.forEach(article => existedFeed.articles.unshift(article));
      renderArticles(newArticles);
    }
  } else {
    state.feeds.push({ feedUrl, articles });
    renderArticles(articles);
  }
};

const loadRss = (url, action, state) => get('https://cors-proxy.htmldriven.com/', {
  params: { url },
}).then((response) => {
  console.log(parseRss(response.data.body));
  action(sortArticlesByTime(parseRss(response.data.body)), url, state);
}).catch((error) => {
  console.error(error.response.data.message);
});

const checkForUpdate = state => Promise.all(state.feeds
  .map(feed => loadRss(feed.feedUrl, updateFeed, state)))
  .then(() => setTimeout(() => checkForUpdate(state), 5000))
  .catch(() => setTimeout(() => checkForUpdate(state), 5000));

export default (url, state) => {
  const newState = state;
  loadRss(url, updateFeed, newState);
  if (!newState.updateIsRunning) {
    newState.updateIsRunning = true;
    checkForUpdate(newState);
  }
};
