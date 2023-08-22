import { expect, test } from '@playwright/test';
import trimify from 'lib/trimify';

test.describe('trimify', () => {
  test('should remove multiple line breaks and spaces correctly', () => {
    const str = 'Hello.\n\nHow are you?\n\n  \nFine, thanks!   ';
    expect(trimify(str)).toBe('Hello.\n\nHow are you?\n\nFine, thanks!');
  });

  test('should work with empty strings', () => {
    expect(trimify('')).toBe('');
  });
});
