# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer.spec.ts >> Customer Role Tests (CRUD) >> Customer Registration, Browsing, Booking
- Location: tests\customer.spec.ts:30:3

# Error details

```
TimeoutError: page.waitForNavigation: Timeout 25000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/tours" until "domcontentloaded"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - navigation [ref=e4]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - img [ref=e8]
          - generic [ref=e11]: TourOps
        - generic [ref=e12]:
          - link "Features" [ref=e13] [cursor=pointer]:
            - /url: "#features"
          - link "Destinations" [ref=e14] [cursor=pointer]:
            - /url: "#destinations"
          - link "How It Works" [ref=e15] [cursor=pointer]:
            - /url: "#how-it-works"
        - generic [ref=e16]:
          - button "🇬🇧 EN" [ref=e17] [cursor=pointer]:
            - img
            - generic [ref=e18]: 🇬🇧 EN
          - button [ref=e19] [cursor=pointer]:
            - img
          - link "Staff Portal" [ref=e20] [cursor=pointer]:
            - /url: /staff/login
            - button "Staff Portal" [ref=e21]
          - link "Sign In" [ref=e22] [cursor=pointer]:
            - /url: "#login"
            - button "Sign In" [ref=e23]
          - link "Sign Up" [ref=e24] [cursor=pointer]:
            - /url: "#register"
            - button "Sign Up" [ref=e25]
    - generic [ref=e26]:
      - img "Tour destinations" [ref=e28]
      - generic [ref=e31]:
        - generic [ref=e32]:
          - img [ref=e33]
          - text: Professional Tour Operations
        - heading "Book Unforgettable Tour Experiences" [level=1] [ref=e35]:
          - text: Book Unforgettable
          - text: Tour Experiences
        - paragraph [ref=e36]: From group adventures to custom family vacations, discover curated tours with seamless booking, expert guides, and end-to-end trip management.
        - generic [ref=e37]:
          - link "Get Started" [ref=e38] [cursor=pointer]:
            - /url: "#login"
            - button "Get Started" [ref=e39]:
              - text: Get Started
              - img
          - link "Explore Tours" [ref=e40] [cursor=pointer]:
            - /url: /tours
            - button "Explore Tours" [ref=e41]
        - generic [ref=e42]:
          - generic [ref=e43]:
            - img [ref=e44]
            - generic [ref=e47]: Free to browse
          - generic [ref=e48]:
            - img [ref=e49]
            - generic [ref=e52]: Instant booking
          - generic [ref=e53]:
            - img [ref=e54]
            - generic [ref=e57]: Full trip support
    - generic [ref=e59]:
      - generic [ref=e60]:
        - heading "Why Choose TourOps" [level=2] [ref=e61]
        - paragraph [ref=e62]: A complete tour booking platform built for travelers and operators alike
      - generic [ref=e63]:
        - generic [ref=e65] [cursor=pointer]:
          - img [ref=e67]
          - heading "Group & Family Booking" [level=3] [ref=e72]
          - paragraph [ref=e73]: Book as a group leader, join existing groups via invite code, or plan a private family vacation with custom itineraries.
        - generic [ref=e75] [cursor=pointer]:
          - img [ref=e77]
          - heading "End-to-End Fulfillment" [level=3] [ref=e79]
          - paragraph [ref=e80]: Track your booking from confirmation to completion. Airlines, hotels, transport, guides, and attractions are all managed for you.
        - generic [ref=e82] [cursor=pointer]:
          - img [ref=e84]
          - heading "Multi-Country Tours" [level=3] [ref=e87]
          - paragraph [ref=e88]: Explore tours spanning multiple destinations with day-by-day itineraries, local experts, and country-level operational support.
    - generic [ref=e90]:
      - generic [ref=e91]:
        - heading "Popular Destinations" [level=2] [ref=e92]
        - paragraph [ref=e93]: Handpicked tours to the world's most extraordinary locations
      - generic [ref=e94]:
        - link "France France 1 tours available" [ref=e95] [cursor=pointer]:
          - /url: /tours?search=France
          - img "France" [ref=e96]
          - generic [ref=e98]:
            - heading "France" [level=3] [ref=e99]
            - paragraph [ref=e100]: 1 tours available
        - link "Italy Italy 1 tours available" [ref=e101] [cursor=pointer]:
          - /url: /tours?search=Italy
          - img "Italy" [ref=e102]
          - generic [ref=e104]:
            - heading "Italy" [level=3] [ref=e105]
            - paragraph [ref=e106]: 1 tours available
        - link "il il 1 tours available" [ref=e107] [cursor=pointer]:
          - /url: /tours?search=il
          - img "il" [ref=e108]
          - generic [ref=e110]:
            - heading "il" [level=3] [ref=e111]
            - paragraph [ref=e112]: 1 tours available
        - link "Egypt Egypt 1 tours available" [ref=e113] [cursor=pointer]:
          - /url: /tours?search=Egypt
          - img "Egypt" [ref=e114]
          - generic [ref=e116]:
            - heading "Egypt" [level=3] [ref=e117]
            - paragraph [ref=e118]: 1 tours available
        - link "Singapore Singapore 1 tours available" [ref=e119] [cursor=pointer]:
          - /url: /tours?search=Singapore
          - img "Singapore" [ref=e120]
          - generic [ref=e122]:
            - heading "Singapore" [level=3] [ref=e123]
            - paragraph [ref=e124]: 1 tours available
        - link "United States United States 1 tours available" [ref=e125] [cursor=pointer]:
          - /url: /tours?search=United%20States
          - img "United States" [ref=e126]
          - generic [ref=e128]:
            - heading "United States" [level=3] [ref=e129]
            - paragraph [ref=e130]: 1 tours available
        - link "Turkey Turkey 1 tours available" [ref=e131] [cursor=pointer]:
          - /url: /tours?search=Turkey
          - img "Turkey" [ref=e132]
          - generic [ref=e134]:
            - heading "Turkey" [level=3] [ref=e135]
            - paragraph [ref=e136]: 1 tours available
        - link "Saudi Arabia Saudi Arabia 1 tours available" [ref=e137] [cursor=pointer]:
          - /url: /tours?search=Saudi%20Arabia
          - img "Saudi Arabia" [ref=e138]
          - generic [ref=e140]:
            - heading "Saudi Arabia" [level=3] [ref=e141]
            - paragraph [ref=e142]: 1 tours available
      - link "Explore All Destinations" [ref=e144] [cursor=pointer]:
        - /url: /tours
        - button "Explore All Destinations" [ref=e145]:
          - text: Explore All Destinations
          - img
    - generic [ref=e147]:
      - generic [ref=e148]:
        - heading "How It Works" [level=2] [ref=e149]
        - paragraph [ref=e150]: Simple steps to your dream vacation
      - generic [ref=e151]:
        - generic [ref=e152]:
          - generic [ref=e153]: "1"
          - heading "Browse Tours" [level=3] [ref=e154]
          - paragraph [ref=e155]: Explore our curated catalog of tours worldwide
        - generic [ref=e156]:
          - generic [ref=e157]: "2"
          - heading "Pick a Date" [level=3] [ref=e158]
          - paragraph [ref=e159]: Choose from available departure dates and group types
        - generic [ref=e160]:
          - generic [ref=e161]: "3"
          - heading "Book & Invite" [level=3] [ref=e162]
          - paragraph [ref=e163]: Create a booking and invite travelers to join
        - generic [ref=e164]:
          - generic [ref=e165]: "4"
          - heading "Travel" [level=3] [ref=e166]
          - paragraph [ref=e167]: We handle flights, hotels, guides, and everything else
    - generic [ref=e169]:
      - generic [ref=e170]:
        - heading "Customer Sign In" [level=2] [ref=e171]
        - paragraph [ref=e172]: Log in to browse tours, manage bookings, and track your trips.
        - generic [ref=e173]:
          - button "Sign In" [ref=e174] [cursor=pointer]
          - button "Sign Up" [ref=e175] [cursor=pointer]
      - generic [ref=e177]:
        - generic [ref=e178]:
          - heading "Sign In to Your Account" [level=2] [ref=e179]
          - paragraph [ref=e180]: Enter your customer credentials below.
        - generic [ref=e181]:
          - generic [ref=e182]:
            - img [ref=e183]
            - generic [ref=e185]: Invalid username or password
          - generic [ref=e186]:
            - text: Username
            - textbox "Username" [ref=e187]: customer1
          - generic [ref=e188]:
            - text: Password
            - textbox "Password" [ref=e189]: password123
          - button "Sign In" [ref=e190] [cursor=pointer]:
            - img
            - text: Sign In
        - generic [ref=e191]:
          - text: Don't have an account?
          - button "Sign Up" [ref=e192] [cursor=pointer]
      - generic [ref=e193]:
        - paragraph [ref=e194]:
          - text: Admin Portal?
          - link "Admin Portal" [ref=e195] [cursor=pointer]:
            - /url: /admin/login
        - paragraph [ref=e196]:
          - text: Staff Portal?
          - link "Staff Portal" [ref=e197] [cursor=pointer]:
            - /url: /staff/login
    - contentinfo [ref=e198]:
      - generic [ref=e199]:
        - generic [ref=e200]:
          - generic [ref=e201]:
            - img [ref=e202]
            - generic [ref=e205]: TourOps
          - paragraph [ref=e206]: Premium tour operations and booking platform. Simplifying global travel for everyone.
        - generic [ref=e207]:
          - heading "Company" [level=4] [ref=e208]
          - list [ref=e209]:
            - listitem [ref=e210]:
              - link "About Us" [ref=e211] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e212]:
              - link "Careers" [ref=e213] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e214]:
              - link "Contact Support" [ref=e215] [cursor=pointer]:
                - /url: "#"
        - generic [ref=e216]:
          - heading "Legal" [level=4] [ref=e217]
          - list [ref=e218]:
            - listitem [ref=e219]:
              - link "Terms of Service" [ref=e220] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e221]:
              - link "Privacy Policy" [ref=e222] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e223]:
              - link "Cookie Policy" [ref=e224] [cursor=pointer]:
                - /url: "#"
        - generic [ref=e225]:
          - heading "Connect" [level=4] [ref=e226]
          - list [ref=e227]:
            - listitem [ref=e228]:
              - link "Twitter" [ref=e229] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e230]:
              - link "Instagram" [ref=e231] [cursor=pointer]:
                - /url: "#"
            - listitem [ref=e232]:
              - link "LinkedIn" [ref=e233] [cursor=pointer]:
                - /url: "#"
      - generic [ref=e234]: © 2026 TourOps Inc. All rights reserved.
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Customer Role Tests (CRUD)', () => {
  4  |   const customerUser = {
  5  |     username: 'e2e_customer_' + Date.now(),
  6  |     password: 'password123',
  7  |     firstName: 'E2E',
  8  |   };
  9  | 
  10 |   // Helper: login as existing customer1 using the landing page form
  11 |   // LoginForm uses window.location.href = '/tours' after success, so we
  12 |   // use page.waitForNavigation to catch the full-page reload redirect.
  13 |   async function loginAsCustomer1(page: any) {
  14 |     await page.goto('/');
  15 |     // Scroll to the #login section by clicking the Sign In nav button
  16 |     await page.click('[data-testid="button-login"]');
  17 |     await page.waitForTimeout(500);
  18 | 
  19 |     // Fill in the login form (inputs have data-testids from LoginForm)
  20 |     await page.fill('[data-testid="input-username"]', 'customer1');
  21 |     await page.fill('[data-testid="input-password"]', 'password123');
  22 | 
  23 |     // window.location.href causes a full-page navigation, so use Promise.all
  24 |     await Promise.all([
> 25 |       page.waitForNavigation({ url: '**/tours', waitUntil: 'domcontentloaded', timeout: 25000 }),
     |            ^ TimeoutError: page.waitForNavigation: Timeout 25000ms exceeded.
  26 |       page.click('[data-testid="button-login-submit"]'),
  27 |     ]);
  28 |   }
  29 | 
  30 |   test('Customer Registration, Browsing, Booking', async ({ page }) => {
  31 |     // 1. Visit landing page
  32 |     await page.goto('/');
  33 |     await expect(page.locator('text=Popular').first()).toBeVisible();
  34 | 
  35 |     // 2. Login with seeded customer1
  36 |     await loginAsCustomer1(page);
  37 |     await expect(page.locator('text=Explore Tours').first()).toBeVisible();
  38 | 
  39 |     // 3. Navigate to My Bookings (customer dashboard)
  40 |     await page.goto('/my-bookings');
  41 |     await expect(page.getByTestId('text-my-bookings-title')).toBeVisible();
  42 | 
  43 |     // 4. Browse a tour detail
  44 |     await page.goto('/tours');
  45 |     await expect(page.locator('text=Explore Tours').first()).toBeVisible();
  46 |     const firstTourLink = page.locator('a[href^="/tours/"]').first();
  47 |     await expect(firstTourLink).toBeVisible();
  48 |     await firstTourLink.click();
  49 |     await expect(page.getByTestId('text-tour-title')).toBeVisible();
  50 | 
  51 |     // 5. Try Create Booking (only if departure slots available)
  52 |     const bookButtons = page.locator('button[data-testid^="button-book-"]');
  53 |     if (await bookButtons.count() > 0) {
  54 |       await bookButtons.first().click();
  55 |       await expect(page.getByTestId('input-party-size')).toBeVisible();
  56 |       await page.fill('[data-testid="input-group-name"]', 'E2E Family Vacation');
  57 |       await page.fill('[data-testid="input-party-size"]', '4');
  58 |       await page.click('[data-testid="select-booking-type"]');
  59 |       await page.locator('div[role="option"]').first().click();
  60 |       await page.click('[data-testid="button-confirm-booking"]');
  61 |       await page.waitForURL('**/my-bookings');
  62 |       await expect(page.getByTestId('text-my-bookings-title')).toBeVisible();
  63 |       await expect(page.locator('text=E2E Family Vacation').first()).toBeVisible();
  64 |     } else {
  65 |       console.log('No departure dates available — skipping booking assertion.');
  66 |     }
  67 |   });
  68 | 
  69 |   test('Customer Registration via Sign Up form', async ({ page }) => {
  70 |     // Go to landing page
  71 |     await page.goto('/');
  72 |     // Click Sign Up button in the nav — sets showRegister=true, scrolls to #register
  73 |     await page.click('[data-testid="button-register"]');
  74 |     await page.waitForTimeout(500);
  75 | 
  76 |     // RegisterForm has IDs: reg-firstName, reg-username, reg-password, reg-confirm-password
  77 |     await expect(page.locator('#reg-firstName')).toBeVisible({ timeout: 10000 });
  78 |     await page.fill('#reg-firstName', customerUser.firstName);
  79 |     await page.fill('#reg-username', customerUser.username);
  80 |     await page.fill('#reg-password', customerUser.password);
  81 |     await page.fill('#reg-confirm-password', customerUser.password);
  82 | 
  83 |     // RegisterForm redirects to "/" using window.location.href on success
  84 |     await Promise.all([
  85 |       page.waitForNavigation({ url: '**/', waitUntil: 'domcontentloaded', timeout: 20000 }),
  86 |       page.click('button:has-text("Create Account")'),
  87 |     ]);
  88 | 
  89 |     // After registration, user is logged in — verify by going to my-bookings
  90 |     await page.goto('/my-bookings');
  91 |     await expect(page.getByTestId('text-my-bookings-title')).toBeVisible();
  92 |   });
  93 | });
  94 | 
```