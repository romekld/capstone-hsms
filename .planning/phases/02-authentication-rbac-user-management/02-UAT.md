---
status: complete
phase: 02-authentication-rbac-user-management
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03a-SUMMARY.md, 02-03b-SUMMARY.md, 02-04-SUMMARY.md, 02-05-SUMMARY.md, 02-05b-SUMMARY.md, 02-06-SUMMARY.md, 02-07-SUMMARY.md]
started: 2026-03-17T00:00:00Z
updated: 2026-03-17T00:00:00Z
---

## Current Test

number: complete
name: —
awaiting: —

## Tests

### 1. User Login with Valid Credentials
expected: Navigate to /login. Enter a valid email and password. Click Sign In. You should see a loading/spinner state briefly, then be redirected to /dashboard.
result: pass

### 2. User Login with Wrong Password
expected: Enter a valid email but the wrong password. Click Sign In. You should see a destructive/red alert with the message "Incorrect email or password. Try again." and stay on /login.
result: pass

### 3. User Login with Inactive Account
expected: Attempt to log in with an account that has been deactivated. You should see an alert: "Your account is inactive. Contact the system administrator."
result: pass

### 4. User Logout
expected: While logged in, open the user menu (top-right or sidebar) and click Sign Out. You should be redirected to /login and the session should be cleared.
result: pass

### 5. Unauthenticated Redirect
expected: Open a new browser tab while not logged in and navigate directly to /dashboard (or any protected route). You should be redirected to /login instead of seeing the page.
result: pass (fixed — spinner race condition resolved via setIsLoading(false) in login; logout made immediate; NavUser render prop conflict removed; email persisted in localStorage)

### 6. Admin Panel Access Control
expected: Log in as a non-system_admin user (e.g., nurse or bhw). Navigate to /admin/users. You should see an unauthorized page, NOT the user management panel.
result: pass

### 7. Admin User List Table
expected: Log in as system_admin and navigate to /admin/users. You should see a table listing users with columns for email, name, roles, BHS, and an actions column. Clicking a column header should sort the table.
result: pass

### 8. Create User as System Admin
expected: On /admin/users, click "Create User" (or similar). Fill in email, name, password, select a role, and optionally assign a BHS. Submit the form. You should see a success toast ("User created" or similar) and the new user should appear in the list.
result: pass

### 9. System Admin Exclusivity in Create User Form
expected: In the Create/Edit User modal, check the "system_admin" role checkbox. All other role checkboxes should become disabled, and the BHS Assignment field should hide (system_admin has no BHS).
result: pass

### 10. Edit User as System Admin
expected: In the user list, click Edit on an existing user. The modal should open pre-filled with that user's current data (email, roles, BHS). Make a change and save. You should see a success toast and the list should reflect the update.
result: pass

### 11. Deactivate User with Confirmation
expected: Click the Deactivate button on an active user. A confirmation dialog should appear showing the user's name and roles, with a destructive "Deactivate User" button and a cancel option. Confirming should deactivate the user and show a toast.
result: pass

### 12. Reactivate User
expected: On an inactive user row, click Reactivate. No confirmation dialog — the user should be reactivated immediately with a success toast. The row should update to show active status.
result: pass

### 13. Dashboard Shows User Role and BHS
expected: Log in as a non-admin user (e.g., nurse). On /dashboard, you should see your email address, role badge(s) (e.g., "Nurse"), and your assigned BHS name. A system_admin should see no BHS assignment.
result: pass

### 14. Session Restore on Browser Refresh
expected: Log in, then do a hard refresh (Ctrl+F5 or close/reopen the tab). You should remain logged in and land back on /dashboard without being sent to /login.
result: pass

## Summary

total: 14
passed: 14
issues: 0
pending: 0
skipped: 0

## Gaps

[none]
