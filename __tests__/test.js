// @flow

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);

beforeEach(async () => {
  const pathToHtml = path.resolve(__dirname, '__fixtures__/index.html');
  document.body.innerHTML = await readFile(pathToHtml, 'utf8');
});

describe('Rss Reader', () => {
  test('someTest', () => {});
});
