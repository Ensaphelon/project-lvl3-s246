import $ from "jquery";

const parser = new DOMParser();

const retrieveArticlesFromFeed = (feed) => {
  const channel = $(parser.parseFromString(feed, 'application/xml')).find('channel');
  return [...$(channel).find('item')];
};

export const parseArticles = (feed) => {
  const articles = retrieveArticlesFromFeed(feed);
  return articles.reduce((acc, article) => {
    acc.push({
      description: $(article).find('description').html(),
      link: $(article).find('link').html(),
      title: $(article).find('title').html(),
      date: new Date ($(article).find('pubDate').html()).getTime(),
    });
    return acc;
  }, []);
};
