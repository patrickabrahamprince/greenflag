// Single source of truth for every coin cost in the app, imported by
// both the client (optimistic balance updates, dialog copy) and the
// server routes that actually charge them. Previously each cost was a
// separately-hardcoded constant in both the client component and the
// API route that charges it, with nothing keeping them in sync if one
// side changed -- a drift would show the wrong price/optimistic balance
// without ever causing an error, since no charge response echoes the
// amount actually deducted.
export const SUBMIT_COST = 10;
export const SPECIAL_SEND_COST = 150;
export const REVEAL_COST = 20;
export const RETRY_COST = 100;
export const REPEAT_NUDGE_COST = 50;
export const PHOTO_UNLOCK_COST = 100;
// "Meet Her Standard" -- charged inside the create_like() Postgres
// function (supabase/migrations/20270106000000_critical_security_audit_fixes.sql),
// not a route-level deduct_coins() call, so it can't be imported
// server-side the way the others are. Kept here anyway so the client
// has exactly one place to read it from instead of a third hardcoded
// copy.
export const MEET_STANDARD_COST = 500;
