# Repository Audit Report - June 28, 2026

## 1. Database Schema
### Connections Table Existence
* **Status**: **Exists**
* **Verification**: Querying the live database via service role client successfully resolves `connections` (HTTP 200). The table is defined in the initial migration `20261019000000_init.sql` and has not been dropped in any applied migration.

### Database Tables & RLS Status
All 22 tables defined in the schema exist on the live database. RLS is explicitly **enabled** (ON) on all of them via migrations.

| Table Name | RLS Status | Verified In Migration |
|---|---|---|
| `profiles` | **ON** | `20261019000000_init.sql` |
| `wallets` | **ON** | `20261019000000_init.sql` |
| `transactions` | **ON** | `20261019000000_init.sql` |
| `tests` | **ON** | `20261019000000_init.sql` |
| `tasks` | **ON** | `20261019000000_init.sql` |
| `connections` | **ON** | `20261019000000_init.sql` |
| `submissions` | **ON** | `20261019000000_init.sql` |
| `messages` | **ON** | `20261019000000_init.sql` |
| `mod_queue` | **ON** | `20261104000000_security_fixes.sql` |
| `standards` | **ON** | `20261106000000_full_spec.sql` |
| `intentions` | **ON** | `20261106000000_full_spec.sql` |
| `freeze_transactions` | **ON** | `20261106000000_full_spec.sql` |
| `daily_discover_views` | **ON** | `20261106000000_full_spec.sql` |
| `audit_logs` | **ON** | `20261106000000_full_spec.sql` |
| `reports` | **ON** | `20261106000000_full_spec.sql` |
| `blocked_pairs` | **ON** | `20261201000000_add_fk_cascade_rules.sql` |
| `push_subscriptions` | **ON** | `20261105000000_push_subscriptions.sql` |
| `rate_limits` | **ON** | `20261105000001_rate_limits.sql` |
| `likes` | **ON** | `20261205000001_reconcile_likes_matches_chat.sql` (blockers branch) |
| `matches` | **ON** | `20261205000001_reconcile_likes_matches_chat.sql` (blockers branch) |
| `conversations` | **ON** | `20261205000001_reconcile_likes_matches_chat.sql` (blockers branch) |
| `photos` | **ON** | `20261205000001_reconcile_likes_matches_chat.sql` (blockers branch) |

---

## 2. Split-Brain Analysis
* **Status**: **Incomplete**
* **Verification**: Grepping the codebase for `.from('connections')` returns **15 active references** in code files (excluding tests/playwright reports). 
* **Details**: References are concentrated in `app/messages/page.tsx`, `components/connections/useManConnections.ts`, and `components/connections/useWomanConnections.ts`, as well as several internal cron jobs and administrative API endpoints. Both the old connections-based flow and the new likes/matches/conversations flow coexist, which will lead to split-brain behavior if not systematically pruned.

---

## 3. Dead Files
The files from the previous chat/likes implementation have been successfully deleted from the local workspace:
* `lib/supabase/profile.ts`: **Confirmed Deleted** (not in `lib/supabase/` directory).
* `hooks/useWallet.ts`: **Confirmed Deleted** (not in `hooks/` directory).
* `components/discover/ProfileCard.tsx`: **Confirmed Deleted** (not in `components/discover/` directory).
* `app/api/connections/*`: **Partially Present** (folders and start routes still exist locally, but are slated for cleanup).

---

## 4. Auth Library Audit
* **Current Branch (`fix/age-gate-legal`)**: `@supabase/auth-helpers-nextjs` has **0 references** and has been successfully replaced with `@supabase/ssr`.
* **Blocker Branch (`fix/blockers-p0-mega`)**: `@supabase/auth-helpers-nextjs` has **21 active references** across 17 files, including `package.json` dependencies.
* **Risk**: Merging the `fix/blockers-p0-mega` branch directly will re-introduce the banned auth-helpers package.

---

## 5. Legal Compliance
* **Age Gate Check**: `app/onboarding/dob/page.tsx` exists and restricts access to users under 18 (calls `signOut` and redirects to `/?error=Must%20be%2018%2B`).
* **Middleware Integration**: `middleware.ts` successfully queries `profiles.dob` and redirects users with missing or invalid DOB values to `/onboarding/dob`.
* **TOS / Privacy Pages**: `app/privacy/page.tsx` and `app/terms/page.tsx` exist.
* **Footer Links**: `components/layout/Footer.tsx` exists and links to both pages.
* **Public Exceptions**: `/privacy`, `/terms`, and `/onboarding/dob` are properly added to the public paths whitelist in `middleware.ts` to prevent redirect loops.

---

## 6. Tasks Spec & Stub Status
* **Tasks Table**: The database contains the `tasks` and `submissions` tables (relics of the old connections flow).
* **New Spec Status**: The new `docs/tasks-spec.md` is a **design spec only**. The schema changes (switching tables to reference `conversation_id` instead of `connection_id`) have not been implemented in the active database or migrations.
* **TaskPanel Component**: `app/chat/[conversationId]/TaskPanel.tsx` is confirmed to be a **UI stub only** with no audio recording or upload logic wired up.

---

## 7. Wallet & Coin Deductions
* **Atomic Function Name**: `deduct_coins`
* **Definition**: Located in `supabase/migrations/20261019000000_init.sql`.
* **Logic**: Uses a `FOR UPDATE` lock on the `wallets` table row to prevent race conditions (double spending), deducts the coins, and inserts a log into `transactions` in a single database transaction:
  ```sql
  SELECT balance INTO v_balance FROM wallets WHERE user_id = p_user_id FOR UPDATE;
  ```

---

## 8. TypeScript Compilation Status
* **Command**: `npx tsc --noEmit` (`pnpm` is not installed in the zsh environment).
* **Result**: **SUCCESS** (Exit code 0, no compiler errors).

---

## 9. App Store Blockers Matrix

| Requirement | Status | Comments / Notes |
|---|---|---|
| **18+ Gate** | **PASS** | DOB gate page implemented; validated in both UI and middleware redirects. |
| **Privacy URL** | **PASS** | Page live at `/privacy`, listed in public paths, linked in footer. |
| **TOS URL** | **PASS** | Page live at `/terms`, listed in public paths, linked in footer. |
| **No Split-Brain** | **FAIL** | Codebase contains duplicate logic. Both `connections` and `matches/conversations` paths are active. |
| **No Crash on Like** | **FAIL** | Discover page still triggers connection-based swipes. Liking in discover page still calls connections start endpoint. |

---

## 10. Top 3 Risks Right Now

1. **Auth Helper Deprecation & Regression Risk**: The `fix/blockers-p0-mega` branch is at commit `62c1c72` and relies heavily on the deprecated `@supabase/auth-helpers-nextjs` package. Merging it directly will overwrite the `@supabase/ssr` migration and introduce runtime dependencies on the banned package.
2. **Coexistence of Connections and Likes (Split-Brain)**: Because both schemas are partially supported in the code, a user could start a connection via `/api/connections/start` but attempt to chat via `/chat/[conversationId]`, which queries the `conversations` table. This creates a state mismatch where matches/conversations are not updated atomically with connections.
3. **Branch Desynchronization and Merge Conflicts**: The workspace contains extensive uncommitted changes for the compliance UI on branch `fix/age-gate-legal` that are not staged. Merging `fix/blockers-p0-mega` will require merging changes to `middleware.ts` and `types/supabase.ts`, creating a risk of code loss or merge errors if not staged first.
