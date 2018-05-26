import axios from 'axios';
import $ from 'jquery';
import { find } from 'lodash';
import renderArticles from './renderer';
import { showModal } from './utils';
import { parseArticles } from './parsers';

const button = $('[data-role="rss-submit"]');
const articlesContainer = $('[data-role="rss-articles"]');

const toggleButtonActiveStatus = () => {
  const isDisabled = button.attr('disabled');
  return isDisabled ? button.removeAttr('disabled') : button.attr('disabled', '');
};

export const loadRss = (serviceUrl, feedUrl, action, state) => {
  axios.get(serviceUrl, {
    params: {
      url: feedUrl,
    },
  }).then((response) => {
    try {
      action(response.data.body, feedUrl, state);
    } catch (e) {
      console.error(e);
    }
  }).catch((error) => {
    toggleButtonActiveStatus();
    showModal(error.response.data.message);
  });
};

const sortArticlesByTime = (articles) => {
  return articles.sort((a, b) => a.date < b.date);
};

const addNewFeed = (feed, feedUrl, state) => {
  toggleButtonActiveStatus();
  const articles = sortArticlesByTime(parseArticles(feed));
  state.feeds.push({
    url: feedUrl,
    items: articles,
  });
  articlesContainer.append(renderArticles(articles));
};

const updateFeed = (feed, feedUrl, state) => {
  const articles = sortArticlesByTime(parseArticles(feed));
  const existedFeed = find(state.feeds, (f) => f.url === feedUrl);
  const diffCount = articles.length - existedFeed.items.length + 1;
  if (diffCount) {
    const newArticles = articles.slice(0, diffCount);
    newArticles.map(article => existedFeed.items.unshift(article));
    articlesContainer.prepend(renderArticles(newArticles));
  }
};

export const addRss = (feedUrl, state) => {
  const newState = state;
  const serviceUrl = 'https://cors-proxy.htmldriven.com/';
  loadRss(serviceUrl, feedUrl, addNewFeed, state);
  toggleButtonActiveStatus();
  if (!newState.updateIsRunning) {
    newState.updateIsRunning = true;
    setInterval(() => {
      state.feeds.map(feed => loadRss(serviceUrl, feed.url, updateFeed, state));
    }, 5000);
  }
};
