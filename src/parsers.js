import $ from 'jquery';

const parser = new DOMParser();

const retrieveArticlesFromFeed = (feed) => {
  const channel = $(parser.parseFromString(feed, 'application/xml')).find('channel');
  return [...$(channel).find('item')];
};

const getRssNodeContent = (article, name) => $(article).find(name).html();

export default (feed) => {
  const articles = retrieveArticlesFromFeed(feed);
  return articles.reduce((acc, article) => {
    acc.push({
      description: getRssNodeContent(article, 'description'),
      link: getRssNodeContent(article, 'link'),
      title: getRssNodeContent(article, 'title'),
      date: new Date(getRssNodeContent(article, 'pubDate')).getTime(),
    });
    return acc;
  }, []);
};