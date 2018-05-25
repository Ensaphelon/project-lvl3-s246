import axios from 'axios';
import $ from 'jquery';
import renderArticles from './renderer';
import { showModal, clearInput, getArticleTime } from './utils';

const parser = new DOMParser();
const input = $('[data-role="rss-input"]');
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
    action(response.data.body, feedUrl, state);
  }).catch((error) => {
    toggleButtonActiveStatus();
    showModal(error.response.data.message);
  });
};

const retrieveArticlesFromFeed = (feed) => {
  const channel = $(parser.parseFromString(feed, 'application/xml')).find('channel');
  return [...$(channel).find('item')];
};

const sortArticlesByTime = (feed) => {
  const articles = retrieveArticlesFromFeed(feed);
  return articles.sort((a, b) => getArticleTime(a) < getArticleTime(b));
};

const addNewFeed = (feed, feedUrl, state) => {
  toggleButtonActiveStatus();
  const sortedArticles = sortArticlesByTime(feed);
  state.feeds.push({
    url: feedUrl,
    items: sortedArticles,
  });
  clearInput(input);
  articlesContainer.append(renderArticles(sortedArticles));
};

const updateFeed = (feed, feedUrl, state) => {
  const articles = sortArticlesByTime(feed);
  const existedFeedArticles = [...state.feeds.filter(current => current.url === feedUrl)];
  const diffCount = articles.length - existedFeedArticles[0].items.length;
  if (diffCount) {
    const newArticles = articles.slice(0, diffCount);
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
