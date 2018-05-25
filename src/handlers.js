import $ from 'jquery';
import { isValidUrl, showModal, getUrlFromForm, hasFeed } from './utils';
import { addRss } from './rss';

const modal = $('[role="dialog"]');
const input = $('[data-role="rss-input"]');

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
  } else {
    showModal(modal, 'Enter valid URL please');
  }
};

export const handleArticleButton = (event) => {
  const message = $(event.target).siblings('.article__description').html();
  showModal(modal, message);
};
