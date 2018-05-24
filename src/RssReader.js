import axios from 'axios/index';
import validator from 'validator';
import $ from 'jquery';

const parser = new DOMParser();

const getArticleTime = article => new Date($(article).find('pubDate').html()).getTime();

const retrieveArticlesFromFeed = (feed) => {
  const channel = $(parser.parseFromString(feed, 'application/xml')).find('channel');
  return [...$(channel).find('item')];
};

const renderArticle = (index, description, link, title) =>
  `<li class="list-group-item article">
    <button data-role="rss-article-details"
      data-article-index="${index}"
      class="btn btn-primary article__button">See details</button>
    <p class="article__description d-none">${description}</p>
    <a class="article__link" href="${link}">${title}</a>
  </li>`;

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
      updateProcessIsRunning: false,
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
    const mapArticles = (feed, index) => feed.items.map((article) => {
      const title = $(article).find('title').html();
      const link = $(article).find('link').html();
      const description = $(article).find('description').get(0).textContent;
      return $(renderArticle(index, description, link, title))
        .appendTo(this.articlesContainer);
    });
    this.state.rssArticles.map(mapArticles);
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
  getLastArticle(feedUrl) {
    return [...this.state.rssArticles.filter(feed => feed.url === feedUrl)][0].items.slice(0, 1);
  }
  checkUpdate(feed) {
    const timeOfLastArticle = getArticleTime(this.getLastArticle(feed.url));
    axios.get(this.serviceUrl, {
      params: {
        url: feed.url,
      },
    }).then((response) => {
      const result = retrieveArticlesFromFeed(response.data.body)
        .filter(article => getArticleTime(article) > timeOfLastArticle);
      if (result.length) {
        result.map(newArticle => feed.items.unshift(newArticle));
        this.clearArticles().renderArticles();
      }
    }).catch((error) => {
      this.showModal(error.response.data.message);
    });
  }
  startLookingForUpdate() {
    if (!this.state.updateProcessIsRunning) {
      this.state.updateProcessIsRunning = true;
      setInterval(() => {
        this.state.rssArticles.map(feed => this.checkUpdate(feed));
      }, 5000);
    }
    return this;
  }
  extractRssData(feed, rssUrl) {
    const result = {
      url: rssUrl,
      items: [],
    };
    retrieveArticlesFromFeed(feed).sort((a, b) => getArticleTime(b) - getArticleTime(a))
      .map(article => result.items.push(article));
    this.state.rssArticles.push(result);
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
        this.extractRssData(response.data.body, rssUrl)
          .updateButtonStatus()
          .clearInput()
          .clearArticles()
          .renderArticles()
          .startLookingForUpdate();
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
    $(document).on('click', '[data-role="rss-article-details"]', (event) => {
      this.showModal($(event.target).siblings('.article__description').html());
    });
    return this;
  }
}
