import $ from 'jquery';
import qs from 'querystring';
import { clearInput, isValidUrl, showModal } from './utils';
import { addRss } from './rss';

const modal = $('[role="dialog"]');
const input = $('[data-role="rss-input"]');

const getUrlFromForm = form => qs.parse($(form).serialize()).url;

const hasFeed = (feedUrl, state) => {
  const { feeds } = state;
  return feeds.filter(feed => feed.url === feedUrl).length > 0;
};

export const handleInput = (event, state) => {
  const newState = state;
  const value = input.val();
  newState.isValidUrl = isValidUrl($(event.target).val()) && !hasFeed(value, newState);
  $(event.target).toggleClass('is-invalid', !newState.isValidUrl);
};

export const handleSubmit = (event, state) => {
  event.preventDefault();
  const url = getUrlFromForm(event.target);
  if (state.isValidUrl) {
    addRss(url, state);
    clearInput(input);
  } else {
    showModal(modal, 'Enter valid URL please');
  }
};

export const handleArticleButton = (event) => {
  const message = $(event.target).siblings('.article__description').html();
  showModal(modal, message.length ? message : 'There is no description');
};
