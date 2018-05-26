import { get } from 'axios';
import { find } from 'lodash';
import parseRss from './parsers';
import renderArticles from './renderer';

const sortArticlesByTime = articles => articles.sort((a, b) => a.date < b.date);

const addNewFeed = (items, url, state) => {
  state.feeds.push({ url, items });
  renderArticles(items);
};

const updateFeed = (articles, feedUrl, state) => {
  const existedFeed = find(state.feeds, feed => feed.url === feedUrl);
  const diffCount = articles.length - existedFeed.items.length;
  if (diffCount) {
    const newArticles = articles.slice(0, diffCount);
    newArticles.forEach(article => existedFeed.items.unshift(article));
    renderArticles(newArticles);
  }
};

const loadRss = (url, action, state) => {
  get('https://cors-proxy.htmldriven.com/', {
    params: { url },
  }).then((response) => {
    action(sortArticlesByTime(parseRss(response.data.body)), url, state);
  }).catch((error) => {
    console.error(error.response.data.message);
  });
};

export default (url, state) => {
  const newState = state;
  loadRss(url, addNewFeed, state);
  if (!newState.updateIsRunning) {
    newState.updateIsRunning = true;
    setInterval(() => {
      state.feeds.map(feed => loadRss(feed.url, updateFeed, state));
    }, 5000);
  }
};
