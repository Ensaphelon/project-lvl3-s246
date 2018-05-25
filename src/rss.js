import axios from 'axios';
import $ from 'jquery';
import renderArticles from './renderer';
import { showModal, clearInput, getArticleTime } from './utils';

const parser = new DOMParser();
const input = $('[data-role="rss-input"]');

export const loadRss = (serviceUrl, feedUrl, action, state) => {
  axios.get(serviceUrl, {
    params: {
      url: feedUrl,
    },
  }).then((response) => {
    action(response.data.body, feedUrl, state);
  }).catch((error) => {
    showModal(error.response.data.message);
  });
};

const retrieveArticlesFromFeed = (feed) => {
  const channel = $(parser.parseFromString(feed, 'application/xml')).find('channel');
  return [...$(channel).find('item')];
};

const addNewFeed = (feed, feedUrl, state) => {
  const articles = retrieveArticlesFromFeed(feed);
  const sortedArticles = articles.sort((a, b) => getArticleTime(a) > getArticleTime(b));
  state.feeds.push({
    url: feedUrl,
    sortedArticles,
  });
  clearInput(input);
  renderArticles(sortedArticles);
};

export const addRss = (feedUrl, state) => {
  const serviceUrl = 'https://cors-proxy.htmldriven.com/';
  loadRss(serviceUrl, feedUrl, addNewFeed, state);
};
