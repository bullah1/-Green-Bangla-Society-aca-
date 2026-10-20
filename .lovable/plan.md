# Admin-managed accounts (remove public signup)

## Goal
Remove the "নতুন অ্যাকাউন্ট" (signup) tab from /auth so the public cannot create accounts. Only an existing admin can create new admin accounts from the admin panel; credentials are stored in the database (Lovable Cloud auth + user_roles).

## Changes

1. **src/routes/auth.tsx** — login only
   - Remove the signup tab, Tabs wrapper, and `signUp` function.
   - Keep email/password sign-in form and session redirect to /admin.
   - Update copy: "অ্যাকাউন্ট না থাকলে অ্যাডমিনের সাথে যোগাযোগ করুন।"

2. **src/lib/admin-users.functions.ts** (new) — server functions
   - `createAdminUser`: `createServerFn` POST + `requireSupabaseAuth` middleware; verifies caller is admin via `context.supabase.rpc("has_role")`; loads `supabaseAdmin` inside handler (`await import("@/integrations/supabase/client.server")`); creates user with `supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name } })`; inserts `profiles` row and `user_roles` row (role 'admin'); returns error text on failure.
   - `listAdminUsers`: GET, same guard; lists `user_roles` (role admin) joined with `profiles` for display.

3. **src/components/admin/UsersAdmin.tsx** (new) — "অ্যাডমিন" tab content
   - List existing admins (name, email).
   - "নতুন অ্যাডমিন" dialog: name, email, password (min 8) → calls `createAdminUser`, Bangla toasts, invalidates list.

4. **src/routes/_authenticated/admin.tsx**
   - Add tab trigger "অ্যাডমিন" (ShieldCheck icon) and `<TabsContent value="users"><UsersAdmin /></TabsContent>`.

## Notes
- `bootstrap_first_admin` trigger stays (first-ever account still bootstraps), but public signup UI is gone.
- No schema changes needed; auth.users + user_roles already exist.
- Verify: typecheck + build log; browser check /auth shows only login.
