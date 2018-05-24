import axios from 'axios/index';
import validator from 'validator';
import $ from 'jquery';

const parser = new DOMParser();

export default class RssReader {
  constructor(container) {
    this.state = {
      input: {
        value: '',
        valid: true,
      },
      button: {
        disabled: false,
      },
      rssFeeds: [],
      rssArticles: [],
    };
    this.serviceUrl = 'https://cors-proxy.htmldriven.com/';
    this.form = $(container).find('[data-role="rss-form"]');
    this.input = $(container).find('[data-role="rss-input"]');
    this.submitButton = $(container).find('[data-role="rss-submit"]');
    this.modal = $(container).find('[role="dialog"]');
    this.modalContent = $(container).find('[data-role="modal-content"]');
    this.articlesContainer = $(container).find('[data-role="rss-articles"]');
  }
  getInputValue() {
    return this.input.val();
  }
  clearInput() {
    this.input.val(this.state.input.value = '');
    return this;
  }
  hasRssFeed(link) {
    return this.state.rssFeeds.includes(link);
  }
  isValidInput(value) {
    this.state.isValidInput = !this.hasRssFeed(value) && validator.isURL(value);
    return this.state.isValidInput;
  }
  updateInputStatus(isValid) {
    this.input.toggleClass('is-invalid', !isValid);
    return this;
  }
  updateButtonStatus() {
    this.state.button.disabled = !this.state.button.disabled;
    if (this.state.button.disabled) {
      this.submitButton.attr('disabled', '');
    } else {
      this.submitButton.removeAttr('disabled');
    }
    return this;
  }
  clearArticles() {
    this.articlesContainer.empty();
    return this;
  }
  renderArticles() {
    this.state.rssArticles.map((article, index) => {
      const title = $(article).find('title').html();
      const link = $(article).find('link').html();
      const description = $(article).find('description').get(0).textContent;
      return $(`
        <li class="list-group-item article">
          <button data-article-index="${index}" class="btn btn-primary article__button">See details</button>
          <p class="article__description d-none">${description}</p>
          <a class="article__link" href="${link}">${title}</a>
        </li>
        `)
        .prependTo(this.articlesContainer);
    });
    return this;
  }
  showModal(message) {
    this.modalContent.html(message);
    this.modal.modal('toggle');
    return this;
  }
  inputProcess() {
    const value = this.getInputValue();
    this.state.input.value = value;
    this.updateInputStatus(this.isValidInput(value));
  }
  extractRssData(feed) {
    const channel = $(parser.parseFromString(feed, 'application/xml')).find('channel');
    const items = $(channel).find('item');
    [...items].map(article => this.state.rssArticles.push(article));
    return this;
  }
  submitProcess(event) {
    event.preventDefault();
    const rssUrl = this.state.input.value;
    if (this.isValidInput(this.getInputValue())) {
      this.updateButtonStatus(this.submitButton);
      axios.get(this.serviceUrl, {
        params: {
          url: rssUrl,
        },
      }).then((response) => {
        this.state.rssFeeds.push(rssUrl);
        const rssData = this.extractRssData(response.data.body);
        this.extractRssData(rssData)
          .updateButtonStatus()
          .clearInput()
          .clearArticles()
          .renderArticles();
      }).catch((error) => {
        this.updateButtonStatus()
          .showModal(error.response.data.message);
      });
    } else {
      this.showModal('Enter correct URL');
    }
  }
  init() {
    this.input.on('input', () => this.inputProcess(this));
    this.form.on('submit', event => this.submitProcess(event));
    $(document).on('click', '.article__button', (event) => {
      this.showModal($(event.target).siblings('.article__description').html());
    });
    return this;
  }
}
