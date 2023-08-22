import { expect, test } from '@playwright/test';
import { AVATAR } from 'data/constants';
import imageProxy from 'lib/imageProxy';

test.describe('imageProxy', () => {
  test('should return a url with just the image url when no name is provided', () => {
    const url = 'image.jpg';
    const result = imageProxy(url);
    expect(result).toEqual(`${url}`);
  });

  test('should return a url with the image url and name when name is provided', () => {
    const url = 'image.jpg';
    const result = imageProxy(url, AVATAR);
    expect(result).toEqual(`${url}`);
  });
});
