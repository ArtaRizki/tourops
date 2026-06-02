# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Smoke Tests - All Features & Pages >> Customer Routes Smoke Test
- Location: tests\smoke.spec.ts:56:3

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
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | // Helper to check for 404
  4   | async function expectNo404(page) {
  5   |   // Wait a little for the route to settle
  6   |   await page.waitForLoadState('domcontentloaded');
  7   |   // Explicitly verify the Not Found component text isn't present
  8   |   await expect(page.locator('text=404 Page Not Found')).toBeHidden();
  9   |   await expect(page.locator('text=Did you forget to add the page to the router?')).toBeHidden();
  10  | }
  11  | 
  12  | // Heavy pages that make external API calls — give them longer timeout
  13  | const HEAVY_ROUTES = ['/admin/tour-generator', '/admin/airline-search'];
  14  | 
  15  | test.describe('Smoke Tests - All Features & Pages', () => {
  16  |   
  17  |   test('Admin Routes Smoke Test', async ({ page }) => {
  18  |     // Increase timeout for this test — visits 12 pages, some are heavy
  19  |     test.setTimeout(120000);
  20  |     // Login as Admin
  21  |     await page.goto('/admin/login');
  22  |     await page.fill('#username', 'superadmin1');
  23  |     await page.fill('#password', 'password123');
  24  |     await page.click('button[type="submit"]');
  25  |     await page.waitForURL('/admin');
  26  |     await expectNo404(page);
  27  | 
  28  |     const adminRoutes = [
  29  |       '/admin/tours',
  30  |       '/admin/departures',
  31  |       '/admin/bookings',
  32  |       '/admin/users',
  33  |       '/admin/reports',
  34  |       '/admin/affiliates',
  35  |       '/admin/tour-generator',
  36  |       '/admin/airline-search',
  37  |       '/admin/master-data',
  38  |       '/admin/pricing',
  39  |       '/admin/transport',
  40  |       '/admin/rate-cards'
  41  |     ];
  42  | 
  43  |     for (const route of adminRoutes) {
  44  |       // Heavy pages that call external APIs need extra time
  45  |       const waitUntil = HEAVY_ROUTES.includes(route) ? 'domcontentloaded' : 'domcontentloaded';
  46  |       try {
  47  |         await page.goto(route, { waitUntil, timeout: 30000 });
  48  |       } catch {
  49  |         // If the page times out on navigation, try checking if it partially loaded
  50  |         console.log(`Warning: ${route} navigation was slow`);
  51  |       }
  52  |       await expectNo404(page);
  53  |     }
  54  |   });
  55  | 
  56  |   test('Customer Routes Smoke Test', async ({ page }) => {
  57  |     // Some routes don't strictly require login, but we'll login to access restricted ones like my-bookings
  58  |     await page.goto('/');
  59  |     // Fill login form using data-testids from LoginForm component
  60  |     await page.fill('[data-testid="input-username"]', 'customer1');
  61  |     await page.fill('[data-testid="input-password"]', 'password123');
  62  |     // window.location.href causes full-page redirect — use Promise.all to capture it
  63  |     await Promise.all([
> 64  |       page.waitForNavigation({ url: '**/tours', waitUntil: 'domcontentloaded', timeout: 25000 }),
      |            ^ TimeoutError: page.waitForNavigation: Timeout 25000ms exceeded.
  65  |       page.click('[data-testid="button-login-submit"]'),
  66  |     ]);
  67  |     await page.goto('/my-bookings', { waitUntil: 'domcontentloaded' });
  68  |     await expectNo404(page);
  69  | 
  70  |     const customerRoutes = [
  71  |       '/',
  72  |       '/tours',
  73  |       '/leader-dashboard',
  74  |       '/leader-payments',
  75  |       '/manage-passengers',
  76  |       '/join-groups'
  77  |     ];
  78  | 
  79  |     for (const route of customerRoutes) {
  80  |       await page.goto(route, { waitUntil: 'domcontentloaded' });
  81  |       await expectNo404(page);
  82  |     }
  83  |   });
  84  | 
  85  |   test('Ops & Supplier Routes Smoke Test', async ({ page }) => {
  86  |     // 1. Supplier
  87  |     await page.goto('/staff/login');
  88  |     await page.fill('#username', 'hotelmanager1');
  89  |     await page.fill('#password', 'password123');
  90  |     await page.click('button[type="submit"]');
  91  |     await page.waitForURL('/supplier');
  92  |     await expectNo404(page);
  93  |     
  94  |     // Clear cookies to switch users
  95  |     await page.context().clearCookies();
  96  | 
  97  |     // 2. Ops (Transport)
  98  |     await page.goto('/staff/login');
  99  |     await page.fill('#username', 'transportmanager1');
  100 |     await page.fill('#password', 'password123');
  101 |     await page.click('button[type="submit"]');
  102 |     await page.waitForURL('/ops'); // Transport manager redirects to /ops based on App.tsx
  103 |     await expectNo404(page);
  104 | 
  105 |     await page.goto('/ops/transport');
  106 |     await expectNo404(page);
  107 |   });
  108 | });
  109 | 
```