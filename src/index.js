import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.css';
import run from './app';

const state = {
  isValidUrl: false,
  updateIsRunning: false,
  feeds: [],
};

run(state);
