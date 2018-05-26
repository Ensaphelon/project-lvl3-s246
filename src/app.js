import $ from 'jquery';
import { handleInput, handleSubmit, handleArticleButton } from './handlers';

export default (state) => {
  $('[data-role="rss-input"]').on('input', event => handleInput(event, state));
  $('[data-role="rss-form"]').on('submit', event => handleSubmit(event, state));
  $(document).on('click', '[data-role="rss-article-details"]', event => handleArticleButton(event));
};
