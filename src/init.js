import RssReader from './RssReader';

export default (container) => {
  const obj = new RssReader(container);
  return obj.init();
};
