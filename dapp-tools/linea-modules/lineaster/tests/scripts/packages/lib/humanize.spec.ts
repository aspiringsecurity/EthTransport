import { expect, test } from '@playwright/test';
import humanize from 'lib/humanize';

test.describe('humanize', () => {
  test('should return comma-separated thousands', () => {
    expect(humanize(0)).toEqual('0');
    expect(humanize(10)).toEqual('10');
    expect(humanize(100)).toEqual('100');
    expect(humanize(1000)).toEqual('1,000');
    expect(humanize(10000)).toEqual('10,000');
    expect(humanize(100000)).toEqual('100,000');
    expect(humanize(1000000)).toEqual('1,000,000');
    expect(humanize(123456789)).toEqual('123,456,789');
  });
});
