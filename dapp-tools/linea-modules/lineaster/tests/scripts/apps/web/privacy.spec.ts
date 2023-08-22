import { expect, test } from '@playwright/test';
import { APP_NAME } from 'data/constants';
import { WEB_BASE_URL } from 'test/constants';

test.beforeEach(async ({ page }) => {
  await page.goto(`${WEB_BASE_URL}/privacy`);
});

test('should have page title', async ({ page }) => {
  await expect(page).toHaveTitle(`Privacy Policy • ${APP_NAME}`);
});
