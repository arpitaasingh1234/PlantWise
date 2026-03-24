

## Plan: Remove Google Sign-In

Remove the Google OAuth button and related imports from the Auth page.

### Changes

**`src/pages/Auth.tsx`**
- Remove the `lovable` import from `@/integrations/lovable`
- Remove the divider ("or" separator) and the "Continue with Google" button (lines ~103-131)

No other files need changes.

