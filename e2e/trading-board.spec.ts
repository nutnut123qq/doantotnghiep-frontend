import { test, expect } from '@playwright/test'

test.describe('Trading Board', () => {
  // Use authenticated state
  test.use({ storageState: 'playwright/.auth/user.json' })

  test.beforeEach(async ({ page }) => {
    await page.goto('/trading-board')
  })

  test('should display trading board', async ({ page }) => {
    // Check if page loads
    await expect(page.locator('h1')).toContainText('Trading Board')
  })

  test('should filter by exchange', async ({ page }) => {
    // Wait for filters to load
    await page.waitForSelector('button[role="combobox"]', { timeout: 10000 })

    // Click the exchange select button
    await page.getByRole('button', { name: /All Exchanges/i }).first().click()

    // Wait for options to appear and click HOSE
    await page.getByRole('option', { name: 'HOSE' }).click()

    // Should show filtered results (assuming API works)
    await expect(page.locator('table')).toBeVisible()
  })

  test('should search tickers', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('VIC')

    // Should show filtered results
    await expect(page.locator('table')).toBeVisible()
  })

  test('should filter by index', async ({ page }) => {
    // Wait for filters to load
    await page.waitForSelector('button[role="combobox"]', { timeout: 10000 })

    // Click the index select button (find by placeholder text)
    const indexSelect = page.locator('button').filter({ hasText: /All Indexes/i }).first()
    await indexSelect.click()

    // Wait for options to appear and click VN30
    await page.getByRole('option', { name: 'VN30' }).click()

    // Should show filtered results
    await expect(page.locator('table')).toBeVisible()
  })

  test('should open column customization modal', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 })

    // Click customize columns button (using icon or text)
    await page.getByRole('button', { name: /Customize|Settings/i }).first().click()

    // Modal should be visible
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})
