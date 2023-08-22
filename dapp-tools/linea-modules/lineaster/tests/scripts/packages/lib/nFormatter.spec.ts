import { expect, test } from '@playwright/test';
import nFormatter from 'lib/nFormatter';

test.describe('nFormatter', () => {
  test('should format a number without any suffix if it is less than 10000 and no digits provided', () => {
    const result = nFormatter(1234);
    expect(result).toEqual('1,234');
  });

  test('should format a number with suffix if it is greater than or equal to 1000000', () => {
    const result = nFormatter(1234567890);
    expect(result).toEqual('1.2G');
  });

  test('should format a number with suffix and with specified decimal places', () => {
    const result = nFormatter(1234567, 2);
    expect(result).toEqual('1.23M');
  });

  test('should format a number with suffix and with default decimal places', () => {
    const result = nFormatter(1234567);
    expect(result).toEqual('1.2M');
  });

  test('should return "0" if input is zero', () => {
    const result = nFormatter(0);
    expect(result).toEqual('0');
  });
});
