# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Role Tests (CRUD) >> Users: Create, Update, Delete
- Location: tests\admin.spec.ts:94:3

# Error details

```
Error: expect(locator).toBeHidden() failed

Locator:  locator('text=Create New User')
Expected: hidden
Received: visible
Timeout:  15000ms

Call log:
  - Expect "toBeHidden" with timeout 15000ms
  - waiting for locator('text=Create New User')
    33 × locator resolved to <h2 id="radix-:re:" class="text-lg font-semibold leading-none tracking-tight">Create New User</h2>
       - unexpected value "visible"

```

```yaml
- heading "Create New User" [level=2]
```

# Test source

```ts
  18  |   };
  19  | 
  20  |   test('Login and navigate admin dashboard', async ({ page }) => {
  21  |     // 1. Login
  22  |     await page.goto('/admin/login');
  23  |     await page.fill('#username', 'superadmin1');
  24  |     await page.fill('#password', 'password123');
  25  |     await page.click('button[type="submit"]');
  26  |     await page.waitForURL('/admin');
  27  |     await expect(page.locator('text=Top Performing Tours').first()).toBeVisible();
  28  |   });
  29  | 
  30  |   test('Tours: Create, Read, Update, Delete', async ({ page }) => {
  31  |     // Ensure we are logged in
  32  |     await page.goto('/admin/login');
  33  |     await page.fill('#username', 'superadmin1');
  34  |     await page.fill('#password', 'password123');
  35  |     await page.click('button[type="submit"]');
  36  |     await page.waitForURL('/admin');
  37  | 
  38  |     // 1. Navigate to Tours
  39  |     await page.click('a[href="/admin/tours"]');
  40  |     await page.waitForURL('/admin/tours');
  41  |     
  42  |     // 2. CREATE Tour
  43  |     await page.click('[data-testid="button-create-tour"]');
  44  |     await page.waitForSelector('[data-testid="input-tour-title"]');
  45  |     await page.fill('[data-testid="input-tour-title"]', tourData.title);
  46  |     await page.fill('[data-testid="input-tour-duration"]', tourData.duration);
  47  |     await page.fill('[data-testid="input-tour-price"]', tourData.price);
  48  |     await page.fill('[data-testid="input-tour-description"]', tourData.description);
  49  |     await page.click('[data-testid="button-save-tour"]');
  50  |     
  51  |     // 3. READ Tour (Verify it appears in the list)
  52  |     await page.fill('[data-testid="input-search-tours"]', tourData.title);
  53  |     // Give it a moment to filter
  54  |     await page.waitForTimeout(500); 
  55  |     await expect(page.locator(`text=${tourData.title}`).first()).toBeVisible();
  56  | 
  57  |     // Find the tour ID (we might just select the first matched tour's edit button)
  58  |     // 4. UPDATE Tour
  59  |     const editButtons = page.locator('button[data-testid^="button-edit-tour-"]');
  60  |     await expect(editButtons.first()).toBeVisible();
  61  |     await editButtons.first().click();
  62  |     await page.fill('[data-testid="input-tour-price"]', '1050');
  63  |     await page.click('[data-testid="button-save-tour"]');
  64  |     
  65  |     // 5. DELETE Tour
  66  |     await page.fill('[data-testid="input-search-tours"]', tourData.title);
  67  |     await page.waitForTimeout(500);
  68  |     const deleteButtons = page.locator('button[data-testid^="button-delete-tour-"]');
  69  |     await expect(deleteButtons.first()).toBeVisible();
  70  |     await deleteButtons.first().click();
  71  |   });
  72  | 
  73  |   test('Bookings: Read, Filter, Delete', async ({ page }) => {
  74  |     await page.goto('/admin/login');
  75  |     await page.fill('#username', 'superadmin1');
  76  |     await page.fill('#password', 'password123');
  77  |     await page.click('button[type="submit"]');
  78  | 
  79  |     // Navigate to Bookings
  80  |     await page.click('a[href="/admin/bookings"]');
  81  |     await page.waitForURL('/admin/bookings');
  82  | 
  83  |     // Filter bookings
  84  |     await page.click('[data-testid="select-status-filter"]');
  85  |     await page.click('div[role="option"]:has-text("Confirmed")');
  86  | 
  87  |     // Search bookings
  88  |     await page.fill('[data-testid="input-search-bookings"]', 'GRP');
  89  | 
  90  |     // We may not want to delete real seed data, but here's how we'd test delete interaction (mocked by UI currently)
  91  |     // await page.click('.text-destructive'); 
  92  |   });
  93  | 
  94  |   test('Users: Create, Update, Delete', async ({ page }) => {
  95  |     await page.goto('/admin/login');
  96  |     await page.fill('#username', 'superadmin1');
  97  |     await page.fill('#password', 'password123');
  98  |     await page.click('button[type="submit"]');
  99  | 
  100 |     await page.click('a[href="/admin/users"]');
  101 |     await page.waitForURL('/admin/users');
  102 | 
  103 |     // CREATE User
  104 |     await page.click('[data-testid="button-create-user"]');
  105 |     await page.fill('[data-testid="input-create-username"]', userData.username);
  106 |     await page.fill('[data-testid="input-create-password"]', userData.password);
  107 |     await page.fill('[data-testid="input-create-firstname"]', userData.firstName);
  108 |     await page.fill('[data-testid="input-create-lastname"]', userData.lastName);
  109 |     await page.fill('[data-testid="input-create-email"]', userData.email);
  110 |     
  111 |     // Select Role
  112 |     await page.click('[data-testid="select-create-role"]');
  113 |     await page.locator('div[role="option"]:has-text("Country Manager")').click();
  114 | 
  115 |     await page.click('[data-testid="button-submit-create-user"]');
  116 | 
  117 |     // Wait for dialog to close (onSuccess calls setCreateOpen(false))
> 118 |     await expect(page.locator('text=Create New User')).toBeHidden({ timeout: 15000 });
      |                                                        ^ Error: expect(locator).toBeHidden() failed
  119 | 
  120 |     // READ User — the UI displays firstName + lastName, not the username
  121 |     // Search by firstName ('E2E') to find the newly created user
  122 |     await page.fill('[data-testid="input-search-users"]', userData.firstName);
  123 |     await page.waitForTimeout(500);
  124 |     // The display name is "E2E Tester" (firstName + lastName)
  125 |     const displayName = `${userData.firstName} ${userData.lastName}`;
  126 |     await expect(page.locator(`text=${displayName}`).first()).toBeVisible({ timeout: 15000 });
  127 | 
  128 |     // UPDATE User (Reset password)
  129 |     const resetButtons = page.locator('button[data-testid^="button-reset-password-"]');
  130 |     await resetButtons.first().click();
  131 |     await page.fill('[data-testid="input-reset-password"]', 'newpassword123');
  132 |     await page.click('[data-testid="button-submit-reset-password"]');
  133 |     
  134 |     // DELETE user is not currently implemented in the UI of users.tsx (only role change and password reset are present)
  135 |   });
  136 | });
  137 | 
```