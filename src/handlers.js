import $ from 'jquery';
import qs from 'querystring';
import validator from 'validator';
import { find } from 'lodash';
import addRss from './rss';

const showModal = (message) => {
  const modal = $('[role="dialog"]');
  modal.find('[data-role="modal-content"]').html(message);
  modal.modal('toggle');
};

const hasFeed = (feedUrl, state) => find(state.feeds, feed => feed.url === feedUrl);

const isValidUrl = (url, state) => validator.isURL(url) && !hasFeed(url, state);

export const handleInput = (event, state) => {
  const newState = state;
  const input = $(event.target);
  newState.isValidUrl = isValidUrl(input.val(), state);
  input.toggleClass('is-invalid', !newState.isValidUrl);
};

export const handleSubmit = (event, state) => {
  event.preventDefault();
  const { url } = qs.parse($(event.target).serialize());
  if (state.isValidUrl) {
    addRss(url, state);
    $(event.target).find('[data-role="rss-input"]').val('');
  } else {
    showModal('Enter valid URL please');
  }
};

export const handleArticleButton = (event) => {
  const message = $(event.target).siblings('.article__description').html();
  showModal(message.length ? message : 'There is no description');
};
