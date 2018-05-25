import validator from 'validator';
import $ from 'jquery';
import qs from 'querystring';

export const clearInput = input => input.val('');

export const hasFeed = (feedUrl, state) => {
  const { feeds } = state;
  return feeds.filter(feed => feed.url === feedUrl).length > 0;
};

export const isValidUrl = url => validator.isURL(url);

export const showModal = (instance, message) => {
  instance.find('[data-role="modal-content"]').html(message);
  instance.modal('toggle');
};

export const getUrlFromForm = form => qs.parse($(form).serialize()).url;

export const getArticleTime = article => new Date($(article).find('pubDate').html()).getTime();
