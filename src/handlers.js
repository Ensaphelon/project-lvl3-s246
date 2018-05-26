import $ from 'jquery';
import qs from 'querystring';
import validator from 'validator';
import addRss from './rss';

const isValidUrl = url => validator.isURL(url);

const showModal = (message) => {
  const modal = $('[role="dialog"]');
  modal.find('[data-role="modal-content"]').html(message);
  modal.modal('toggle');
};

const hasFeed = (feedUrl, state) => {
  const { feeds } = state;
  return feeds.filter(feed => feed.url === feedUrl).length > 0;
};

export const handleInput = (event, state) => {
  const newState = state;
  const input = $(event.target);
  const value = input.val();
  newState.isValidUrl = isValidUrl($(event.target).val()) && !hasFeed(value, newState);
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
