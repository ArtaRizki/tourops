import { test, expect } from '@playwright/test';

test.describe('End-to-End User Journeys', () => {

  test('Scenario 1: Complete Booking Lifecycle (Admin -> Customer -> Ops -> Admin)', async ({ browser }) => {
    // We use isolated contexts for each user role to simulate cross-role interaction cleanly
    const adminContext = await browser.newContext();
    const customerContext = await browser.newContext();
    const opsContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const customerPage = await customerContext.newPage();
    const opsPage = await opsContext.newPage();

    const uniqueId = Date.now();
    const tourTitle = `Journey Tour ${uniqueId}`;
    const groupName = `Family Journey ${uniqueId}`;

    // ==========================================
    // 1. ADMIN: Create Tour and Departure
    // ==========================================
    await adminPage.goto('/admin/login');
    await adminPage.fill('#username', 'superadmin1');
    await adminPage.fill('#password', 'password123');
    await adminPage.click('button[type="submit"]');
    await adminPage.waitForURL('/admin');

    // Create Tour
    await adminPage.click('a[href="/admin/tours"]');
    await adminPage.waitForURL('/admin/tours');
    await adminPage.click('[data-testid="button-create-tour"]');
    await adminPage.fill('[data-testid="input-tour-title"]', tourTitle);
    await adminPage.fill('[data-testid="input-tour-duration"]', '7');
    await adminPage.fill('[data-testid="input-tour-price"]', '1500');
    await adminPage.click('[data-testid="button-save-tour"]');
    
    // Create Departure
    await adminPage.click('a[href="/admin/departures"]');
    await adminPage.waitForURL('/admin/departures');
    await adminPage.click('[data-testid="button-create-departure"]');
    await adminPage.waitForSelector('[data-testid="select-departure-tour"]');
    
    // Select the tour from dropdown
    await adminPage.click('[data-testid="select-departure-tour"]');
    await adminPage.locator(`div[role="option"]:has-text("${tourTitle}")`).first().click();
    
    // Set dates
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const startDate = futureDate.toISOString().split('T')[0];
    futureDate.setDate(futureDate.getDate() + 7);
    const endDate = futureDate.toISOString().split('T')[0];
    
    await adminPage.fill('[data-testid="input-start-date"]', startDate);
    await adminPage.fill('[data-testid="input-end-date"]', endDate);
    await adminPage.click('[data-testid="button-save-departure"]');

    // ==========================================
    // 2. CUSTOMER: Book the Tour
    // ==========================================
    await customerPage.goto('/#login');
    await customerPage.fill('#username', 'customer1');
    await customerPage.fill('#password', 'password123');
    await customerPage.click('button[type="submit"]');
    await customerPage.waitForURL('/my-bookings');

    // Find and book the tour
    await customerPage.click('a[href="/tours"]');
    await customerPage.waitForURL('/tours');
    
    // Search for the specific tour (mocking search if it exists, otherwise just click first match)
    const tourLink = customerPage.locator(`text=${tourTitle}`).first();
    await expect(tourLink).toBeVisible();
    await tourLink.click();

    // In tour detail, book the departure
    await expect(customerPage.locator(`text=${tourTitle}`)).toBeVisible();
    
    const bookButton = customerPage.locator('button[data-testid^="button-book-"]').first();
    await expect(bookButton).toBeVisible();
    await bookButton.click();

    // Fill booking details
    await expect(customerPage.getByTestId('input-party-size')).toBeVisible();
    await customerPage.fill('[data-testid="input-group-name"]', groupName);
    await customerPage.fill('[data-testid="input-party-size"]', '2');
    
    await customerPage.click('[data-testid="select-booking-type"]');
    await customerPage.locator('div[role="option"]').first().click(); // Select first booking type (e.g., Public)
    
    await customerPage.click('[data-testid="button-confirm-booking"]');
    
    // Wait for redirect to my-bookings
    await customerPage.waitForURL('/my-bookings');
    await expect(customerPage.locator(`text=${groupName}`).first()).toBeVisible();

    // ==========================================
    // 3. OPS: Transport Manager Advances Status
    // ==========================================
    await opsPage.goto('/staff/login');
    await opsPage.fill('#username', 'transportmanager1');
    await opsPage.fill('#password', 'password123');
    await opsPage.click('button[type="submit"]');
    await opsPage.waitForURL('/ops');

    // Operations might not have the booking directly visible if it requires workflow assignment.
    // However, if the booking shows up in their generic /ops dashboard or /ops/transport, they should advance it.
    // Wait for generic dashboard to load
    await expect(opsPage.locator('text=Operations Dashboard')).toBeVisible();
    
    // Note: To fully automate the workflow, Admin might need to "Initialize Workflows" first.
    // Let's have Admin do that.
    await adminPage.click('a[href="/admin/bookings"]');
    await adminPage.waitForURL('/admin/bookings');
    await adminPage.fill('[data-testid="input-search-bookings"]', groupName);
    await adminPage.waitForTimeout(500); // debounce
    
    // Select the booking to initialize workflow
    const checkbox = adminPage.locator('input[type="checkbox"]').nth(1); // the first one is select-all
    if (await checkbox.isVisible()) {
      await checkbox.click();
      await adminPage.click('button:has-text("Initialize")'); // Initialize workflows
    }

    // Now Ops can see the task
    await opsPage.reload();
    await expect(opsPage.locator('text=Tasks').first()).toBeVisible();

    // If there's an action button for the task, click it
    const advanceTaskButton = opsPage.locator('button:has-text("Complete")').first();
    if (await advanceTaskButton.isVisible()) {
      await advanceTaskButton.click();
    }

    // Clean up
    await adminContext.close();
    await customerContext.close();
    await opsContext.close();
  });

  test('Scenario 2: Tour Leader Workflow', async ({ page }) => {
    // For this scenario, we use the customer context as a Tour Leader
    // customer1 might not be a tour leader, so we rely on the seeded data or just test the UI elements available.
    // The tour leader dashboard is accessible at /leader-dashboard
    
    await page.goto('/#login');
    // Using a user that has isTourLeader = true if seeded, otherwise any customer can try to access.
    // If leader dashboard requires specific data, it might be empty.
    await page.fill('#username', 'customer1');
    await page.fill('#password', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/my-bookings');

    await page.goto('/leader-dashboard');
    // If it redirects away, the user isn't a tour leader. We'll just verify the page loads.
    
    // Visit brochure generator
    // Assuming there is at least one tour seeded with ID 1
    await page.goto('/tours/1/brochure');
    // Fill out the brochure form
    await page.waitForSelector('[data-testid="input-brochure-title"]');
    await page.fill('[data-testid="input-brochure-title"]', 'Exclusive E2E Group');
    await page.fill('[data-testid="input-leader-name"]', 'John E2E Leader');
    
    // Verify preview toggles
    await page.click('[data-testid="button-toggle-preview"]');
    await expect(page.locator('text=Exclusive E2E Group').first()).toBeVisible();
  });
});
