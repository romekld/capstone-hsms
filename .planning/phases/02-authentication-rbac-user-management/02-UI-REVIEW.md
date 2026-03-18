# Phase 02 — UI Review

**Audited:** 2026-03-18
**Baseline:** 02-UI-SPEC.md (approved design contract)
**Screenshots:** Not captured (no dev server running on ports 3000, 5173, or 8080)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 2/4 | Login headline and subhead diverge from contract; internal role string exposed in admin subheading |
| 2. Visuals | 3/4 | Login split-panel departs from single-column spec; strong visual hierarchy elsewhere |
| 3. Color | 2/4 | `--primary` token overwritten to neutral black in globals.css; CHO 2 brand color not applied |
| 4. Typography | 3/4 | Font stack conflict — Inter Variable overrides IBM Plex Sans at runtime; sizes/weights otherwise disciplined |
| 5. Spacing | 3/4 | Arbitrary pixel values on decorative elements; core interactive controls on standard scale |
| 6. Experience Design | 3/4 | All four states handled; activity log table missing Actor and Target User columns; no pagination |

**Overall: 16/24**

---

## Top 3 Priority Fixes

1. **`--primary` is neutral black, not CHO 2 blue** — Every primary CTA button, the sidebar active indicator, and the login panel background render as near-black instead of the contracted `oklch(42% 0.18 240)` blue. Visually the application has no brand identity and does not match the government health system context. Fix: in `globals.css` `:root`, replace `--primary: oklch(0.205 0 0)` with `oklch(42% 0.18 240)` and update `.dark` `--primary` from `oklch(0.922 0 0)` to `oklch(65% 0.16 240)`.

2. **`@theme inline` block in globals.css overrides `--font-sans` to Inter Variable** — `globals.css` line 173 sets `--font-sans: 'Inter Variable', sans-serif` inside an `@theme inline` block that runs after the outer `@theme` block declaring IBM Plex Sans. The `@import "@fontsource-variable/inter"` on line 4 loads the Inter font. Result: the body font is Inter, not IBM Plex Sans, regardless of the correct font imports in `main.tsx`. Fix: remove the `@theme inline` block entirely or delete the `--font-sans` override and `@import "@fontsource-variable/inter"` from globals.css.

3. **Login page headline does not match copywriting contract** — The UI-SPEC mandates the exact string `"Sign in to LINK"` as the Display-size headline (LoginPage.tsx line 169 renders `"Sign in to your account"`). The contracted subhead `"Barangay Health Station Management — CHO 2 Dasmariñas"` is absent from the form panel entirely. These strings were locked in the copywriting contract and differ in brand specificity. Fix: change line 169 to `Sign in to LINK` and add a subhead paragraph beneath it with `Barangay Health Station Management — CHO 2 Dasmariñas`.

---

## Detailed Findings

### Pillar 1: Copywriting (2/4)

**Mismatches against UI-SPEC copywriting contract:**

| Element | Contracted | Implemented | File:Line |
|---------|-----------|-------------|-----------|
| Login page headline | "Sign in to LINK" | "Sign in to your account" | LoginPage.tsx:169 |
| Login page subhead | "Barangay Health Station Management — CHO 2 Dasmariñas" | Absent from form panel (appears only in the brand sidebar) | LoginPage.tsx:165-175 |
| Auth error — wrong credentials | "Incorrect email or password. Try again." | "Incorrect email or password. Please try again." | LoginPage.tsx:63 |
| Admin page subheading | (no spec; should be user-facing) | "Manage system_admin-provisioned accounts" — exposes internal role identifier to users | UsersPage.tsx:540 |
| Activity log empty state body | "User management actions will appear here once you create or edit accounts." | "User management actions will appear here once you create or edit accounts." | UsersPage.tsx:428 — PASS |

**Passing copy:**
- "Sign In" CTA button label: PASS
- "Create User" button: PASS
- "Save User" / "Save Changes" modal CTA: PASS
- "No users yet" / "Create the first user account to get started.": PASS
- "No activity yet": PASS
- "Your account is inactive. Contact the system administrator.": PASS
- "Unable to sign in. Please try again in a moment.": PASS
- "Deactivate {Name}?" / "Keep User" / "Deactivate User": PASS
- Deactivation dialog body copy: PASS
- Success toast strings: PASS
- Footer note "For authorized health personnel only. Unauthorized access is prohibited.": PASS (extended with RA citation — acceptable)

**Issues:**
- Wrong credentials copy has an extra word ("Please") that was not in the contract. Minor but the contract specified the exact string.
- "Manage system_admin-provisioned accounts" (UsersPage.tsx:540) is technical jargon that exposes an internal role identifier. Users of this admin panel are system_admin users, but the copy reads as a developer note, not a UI string. Suggest: "Manage user accounts and access" or similar user-facing copy.
- The login form panel headline departs from the contracted Display-size `"Sign in to LINK"`. The brand name in the headline is the primary differentiator for this government system.

---

### Pillar 2: Visuals (3/4)

**Login page layout deviates from single-column spec:**

The UI-SPEC block selection section explicitly states: "Block selection between login-01 and login-02: executor chooses whichever is centered/single-column. The two-column (image + form) variant is not appropriate — no marketing imagery for a government health system." The implemented LoginPage.tsx uses a two-column split layout (`grid lg:grid-cols-[1fr_1fr]`) with a branded left panel. The left panel contains decorative SVG elements, stats, and marketing copy ("Health data that works for the field.").

The left panel content is aesthetically strong and relevant (32 BHS stations, 164K+ residents), and the single-column spec rationale was about avoiding marketing imagery. The brand panel as implemented contains data and institutional identity rather than marketing graphics. This is a specification deviation, but a visually defensible one. Scored at 3 not 2 because the form panel itself meets all spec requirements and the deviation improves first impressions for a government health context.

**Passing visual items:**
- Clear focal point: "Sign In" primary button is the dominant interactive element on the form side
- Visual hierarchy in admin panel: page title > tab labels > table content
- Inactive user row correctly shows `text-muted-foreground` on name and email
- Status badge color differentiation (green/red via CSS custom properties)
- Icon-only sidebar buttons use `tooltip={item.label}` for accessible tooltip text (passes the icon-only accessibility requirement)
- Loading skeleton rows present for both user list and activity log
- Password show/hide toggle with proper `aria-label`

**Minor gaps:**
- The activity log table (ActivityLogTab) renders only Timestamp and Action columns (UsersPage.tsx:438-441). The UI-SPEC requires four columns: Timestamp | Actor (full name) | Action | Target User. The actor name and resolved target user name are missing, reducing the audit trail's utility.
- Role overflow tooltip ("+N more") is implemented as a Badge, not a Tooltip — tapping it on mobile provides no expandable view of the remaining roles.

---

### Pillar 3: Color (2/4)

**Critical: `--primary` token is neutral, not CHO 2 brand blue.**

The UI-SPEC mandates `--primary: oklch(42% 0.18 240)` (a blue hue with chroma 0.18, hue 240). The implemented globals.css (line 57) sets `--primary: oklch(0.205 0 0)` — zero chroma, zero hue, which is near-black (neutral dark). This means:

- The login page left panel background (`bg-primary`) is black, not blue
- All CTA buttons ("Sign In", "Create User", "Save User") render black, not the branded CHO 2 blue
- The sidebar active item indicator uses black
- The `--ring` value (focus ring) at line 69 is `oklch(0.708 0 0)` — also neutral gray, not blue

Additionally, the `.dark` mode `--primary` is `oklch(0.922 0 0)` (near-white) rather than the spec's `oklch(65% 0.16 240)`.

**Root cause:** The `npx shadcn@latest init --preset base-nova` command generated base-nova's default neutral palette. The UI-SPEC OKLCH token values were not applied over the generated defaults. The `@theme inline` block at globals.css line 172-210 (added by shadcn init) re-declares all tokens and would have overwritten any manual edits to the `:root` block for these values.

**Project-specific semantic tokens — PASS:**
Status tokens are correctly defined and used:
- `--status-safe: oklch(58% 0.16 145)` and `--status-critical: oklch(53% 0.22 27)` match spec
- Applied in UsersPage.tsx:652-656 via `bg-[color:var(--status-safe)]/15` — correct CSS variable pattern, no hardcoded hex

**No hardcoded hex or RGB values in component files** — all color references use CSS variables or Tailwind utility classes. This is a PASS.

**Accent (`--primary`) overuse check:** 27 occurrences of `text-primary`/`bg-primary` across 3 page files — the count is elevated but reviewing the usage, these map to the 5 contracted accent elements (CTA buttons, sidebar indicator, focus ring) plus legitimate state indicators in the sidebar and avatar components. This passes the intent of the 60/30/10 rule, pending the color value being corrected.

---

### Pillar 4: Typography (3/4)

**Font stack conflict in globals.css:**

- `main.tsx` lines 3-5: Imports `@fontsource/ibm-plex-sans/400.css`, `/600.css`, `@fontsource/ibm-plex-mono/400.css` — correct
- `globals.css` line 4: `@import "@fontsource-variable/inter"` — loads Inter Variable font
- `globals.css` line 8: `--font-sans: "IBM Plex Sans"` in outer `@theme` block — correct
- `globals.css` line 173: `--font-sans: 'Inter Variable', sans-serif` inside `@theme inline` block — **overrides** IBM Plex Sans with Inter at cascade resolution time

The `@theme inline` block is generated by `npx shadcn add` commands and inserts itself at the end of globals.css. Its `--font-sans` override means the body font at runtime is Inter Variable, not IBM Plex Sans. This violates the UI-SPEC typography contract.

**Font size distribution (pages only, excluding shadcn component primitives):**

Sizes found in page files: `text-xs`, `text-sm`, `text-base`, `text-lg` (mobile only), `text-xl`, `text-2xl`, `text-3xl`

That is 7 distinct size steps in page-level code. The UI-SPEC declares 4 roles (Body 14px, Label 14px, Heading 20px, Display 28px). The divergence comes from:
- `text-3xl` on LoginPage.tsx:126 — brand panel headline ("Health data that works for the field.") — this is in the decorative left panel, not the form UI, so can be considered acceptable brand display copy
- `text-lg` on LoginPage.tsx:162 — mobile LINK wordmark — single instance, mobile-only
- `text-xl` on UsersPage.tsx:538 — page heading "User Management" — at 20px this maps to the Heading role

Excluding the decorative brand panel content, the form UI and admin panel use 4 sizes mapping cleanly to the spec. Scored 3 for the font stack conflict.

**Font weight distribution:**
Weights found: `font-normal`, `font-medium`, `font-semibold`, `font-bold`

That is 4 weights across page-level components. UI-SPEC permits 2 (400 regular, 600 semibold). `font-bold` appears on LoginPage.tsx:114, 138, 142, 162 — all in the decorative brand panel. `font-medium` is used for table cell text and subheadings. The form UI itself uses only `font-semibold` for labels/headings and implicit `font-normal` for body text. The 4-weight count is a minor over-use attributable to the brand panel deviation.

---

### Pillar 5: Spacing (3/4)

**Arbitrary spacing values found in page files:**

| File | Line | Value | Context |
|------|------|-------|---------|
| LoginPage.tsx | 75 | `w-[520px] h-[520px]` | Decorative glow element |
| LoginPage.tsx | 76 | `w-[400px] h-[400px]` | Decorative glow element |
| LoginPage.tsx | 118 | `pl-[52px]` | Logo subhead indent |
| LoginPage.tsx | 165 | `max-w-[400px]` | Form container width |
| DashboardPage.tsx | 151 | `text-[11px]` | Stat card sub-label |
| DashboardPage.tsx | 178 | `text-[10px]` | Badge text size |
| UsersPage.tsx | 168 | `sm:max-w-[480px]` | Sheet/drawer width |
| UsersPage.tsx | 248 | `min-h-[40px]` | Role checkbox tap target |

The glow element pixel dimensions are decorative and do not affect interactive layout — acceptable. `pl-[52px]` is an icon-width indent workaround — acceptable. `max-w-[400px]` and `sm:max-w-[480px]` are container widths — within spec intent (440px login card, 540px modal). `min-h-[40px]` for role checkboxes matches the UI-SPEC's 40px minimum tap height requirement for field worker tablet use — this is correct.

`text-[11px]` and `text-[10px]` are the only values that fall outside the standard spacing scale without clear justification. `text-[10px]` is below the spec's smallest declared size (`text-xs` = 12px) and may be illegible on field worker tablets.

**Core interactive spacing — PASS:**
- Form inputs use `h-11` (44px) consistently — matches spec touch target requirement
- CTA buttons use `h-11` or default button height
- Role checkboxes use `min-h-[40px]` — matches spec 40px minimum

**No non-standard spacing in the admin table or modal form fields** — gap, padding, and margin values are all standard Tailwind tokens (`gap-1`, `gap-2`, `gap-4`, `px-6`, `py-4`, `py-8`, etc.).

---

### Pillar 6: Experience Design (3/4)

**State coverage per surface:**

| Surface | Default | Loading | Empty | Error |
|---------|---------|---------|-------|-------|
| Login form | PASS — blank inputs, disabled submit until fields non-empty | PASS — spinner + "Signing in…" | N/A | PASS — destructive Alert with `role="alert"` |
| User list | PASS — populated table | PASS — 5 skeleton rows | PASS — empty state with CTA | PASS — destructive-styled banner |
| Create/Edit modal | PASS — Sheet with form | PASS — save button spinner | N/A | PASS — field-level errors + toast for server errors |
| Activity log | PASS — populated table | PASS — 5 skeleton rows | PASS — empty state | PASS — error banner |

**Notable gaps:**

1. **Activity log table missing Actor and Target User columns.** The UI-SPEC requires 4 columns: Timestamp | Actor (full name) | Action | Target User. The implementation renders only Timestamp and Action (UsersPage.tsx:438-441). The `getActionCopy` function (lines 386-403) attempts to derive target user information from `new_values.target_user_id` but shows `user #123` (a numeric ID) rather than a resolved full name. The Actor column is absent entirely.

2. **No pagination on user list.** The UI-SPEC requires pagination at 25 rows. The user list renders all `sorted` entries with no page boundary (UsersPage.tsx:622-712). For a system with potentially hundreds of users across 32 health stations, this will degrade performance and usability.

3. **Create/Edit modal implemented as Sheet (side drawer), not Dialog.** The UI-SPEC specifies `Dialog` centered at `max-width 540px` for tablet breakpoint. The implementation uses `Sheet` (UsersPage.tsx:167-322). On tablet, a right-side sheet at 480px width may occlude the user list and does not match the spec contract. The UI-SPEC does specify Drawer for mobile, but Dialog for tablet/desktop — the Sheet pattern conflates the two.

4. **ProtectedRoute loading spinner not scoped.** `ProtectedRoute.tsx` shows a loading spinner while auth is resolving, which is correct. However, the spinner is a full-page overlay — if the session restore fails silently, the spinner could theoretically persist (though the code has a `finally` guard). Low risk but worth noting.

**Interaction patterns — PASS:**
- system_admin checkbox exclusivity: checking system_admin clears other roles and disables their checkboxes with `opacity-50` — matches spec
- BHS Assignment field hidden when system_admin is selected — matches spec
- Deactivation uses `AlertDialog` (not `Dialog`) — matches spec
- Reactivation executes immediately with toast — matches spec
- Row hover `hover:bg-muted/50` — matches spec
- Inactive user row `text-muted-foreground` on name and email — matches spec
- Sort icon shown on active column — matches spec
- Password show/hide toggle with Eye/EyeOff icons — matches spec

---

## Registry Safety

Registry audit: shadcn initialized (base-nova style). `components.json` has `"registries": {}` — no third-party registries declared. All blocks are from the shadcn official registry. No third-party registry checks required.

---

## Files Audited

**Page components:**
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/pages/admin/UsersPage.tsx`
- `frontend/src/pages/admin/ActivityLogPage.tsx` (re-export only)

**Layout and shell:**
- `frontend/src/layouts/AppShell.tsx`
- `frontend/src/components/app-sidebar.tsx`
- `frontend/src/components/nav-user.tsx`
- `frontend/src/components/team-switcher.tsx`

**Design system:**
- `frontend/src/styles/globals.css`
- `frontend/components.json`
- `frontend/src/main.tsx`

**Auth infrastructure (interaction review only):**
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/contexts/AuthContext.tsx`

**Planning documents:**
- `.planning/phases/02-authentication-rbac-user-management/02-UI-SPEC.md`
- All 9 SUMMARY.md and PLAN.md files for plans 01-07
- `.planning/phases/02-authentication-rbac-user-management/02-CONTEXT.md`
