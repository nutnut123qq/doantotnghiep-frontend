import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login')

    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')

    // Submit form
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL('/')
  })

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')

    // Submit form
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=/error|failed/i')).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')

    // Click register link
    await page.click('text=create a new account')

    // Should be on register page
    await expect(page).toHaveURL('/register')
  })
})
