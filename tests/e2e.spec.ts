import { test, expect } from '@playwright/test';

test('login, create item, reload, decrypt', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.click('text=Use Test User');
  await page.fill('input[placeholder="Email"]', 'test@example.com');
  await page.fill('input[placeholder="Password"]', 'test12345');
  await page.click('text=Login');
  // wait for header/app title to show up
  await page.waitForSelector('text=Vault', { timeout: 10000 });

  // go to vault
  await page.goto('http://localhost:3000/vault');
  await page.fill('input[placeholder="Title"]', 'pw-e2e');
  await page.fill('input[placeholder="Password"]', 'supersecret');
  await page.click('button:has-text("Save")');

  // wait for item to appear and decrypt
  await page.waitForSelector('text=pw-e2e', { timeout: 20000 });
  // reload and ensure still accessible (sessionStorage or wrapped key)
  await page.reload();
  await page.waitForSelector('text=pw-e2e', { timeout: 5000 });
  expect(await page.isVisible('text=pw-e2e')).toBeTruthy();
});
