import $ from 'jquery';
import { handleInput, handleSubmit, handleArticleButton } from './handlers';

const input = $('[data-role="rss-input"]');
const form = $('[data-role="rss-form"]');

export default (state) => {
  input.on('input', event => handleInput(event, state));
  form.on('submit', event => handleSubmit(event, state));
  $(document).on('click', '[data-role="rss-article-details"]', event => handleArticleButton(event));
};
