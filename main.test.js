import fs from 'fs';
import path from 'path';
import { expect } from 'chai';

import hierarchicalSort from './main';

describe('Run samples tests', () => {
  it('should match the content of sample 1.out', async () => {
    const actual = hierarchicalSort({ filePath: '/tests/1.in', getSortValueFn: ((row) => row.net_sales) });

    const expected = fs.readFileSync(path.join(__dirname, '/tests/1.out'), 'utf8');

    expect(actual).to.equal(expected);
  });

  it('should match the content of sample 2.out', async () => {
    const actual = hierarchicalSort({ filePath: '/tests/2.in', getSortValueFn: ((row) => row.net_sales) });

    const expected = fs.readFileSync(path.join(__dirname, '/tests/2.out'), 'utf8');

    expect(actual).to.equal(expected);
  });

  it('should match the content of sample 3.out', async () => {
    const actual = hierarchicalSort({ filePath: '/tests/3.in', getSortValueFn: ((row) => row.net_sales) });

    const expected = fs.readFileSync(path.join(__dirname, '/tests/3.out'), 'utf8');

    expect(actual).to.equal(expected);
  });
});
