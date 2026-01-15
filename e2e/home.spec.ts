import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display the hero section', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: /LinkedIn Carousels erstellen/i })
    ).toBeVisible()

    await expect(
      page.getByRole('link', { name: /Jetzt starten/i })
    ).toBeVisible()
  })

  test('should navigate to editor when clicking CTA', async ({ page }) => {
    await page.goto('/')

    await page
      .getByRole('link', { name: /Jetzt starten/i })
      .first()
      .click()

    await expect(page).toHaveURL(/\/app\/editor/)
  })

  test('should display features section', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: /Alles was du brauchst/i })
    ).toBeVisible()

    await expect(page.getByText(/Blitzschnell/i)).toBeVisible()
    await expect(page.getByText(/KI-Unterstützung/i)).toBeVisible()
    await expect(page.getByText(/Brand Kits/i)).toBeVisible()
  })
})
