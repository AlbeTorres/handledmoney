# Proposal: Terms & Conditions Acceptance Flow

## Intent
Add legally-compliant Terms & Conditions page and explicit user acceptance flow. Finance apps handling sensitive financial data need stronger consent than implicit "by creating an account" language.

## Scope
### In Scope
- `/terms` page (following existing `/privacy` pattern)
- `termsAcceptedAt` timestamp column on `user` table (Drizzle migration)
- Checkbox + validation in `RegisterForm` (disabled submit until checked)
- Link to `/terms` in `Footer` (replace `#` placeholder)
- i18n keys for checkbox label in `messages/en.json` and `messages/es.json`

### Out of Scope
- OAuth interstitial (deferred — social buttons are currently disabled anyway)
- Terms versioning system (future version acceptance tracking)
- Dashboard "Accept new terms" banner (for future T&C updates)
- Email notification of T&C changes

## Approach
1. Create `src/app/terms/page.tsx` mirroring `src/app/privacy/page.tsx`
2. Add `termsAcceptedAt` column to `user` table in `src/db/schema.ts`
3. Generate Drizzle migration
4. Add checkbox + zod validation to `RegisterForm` and `RegisterSchema`
5. Pass `termsAcceptedAt` to `authClient.signUp.email()` via BetterAuth `user.additionalFields`
6. Update `Footer.tsx` link from `#` to `/terms`
7. Add i18n keys for checkbox label in both locale files

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `src/app/terms/page.tsx` | New | T&C content page |
| `src/db/schema.ts` | Modified | Add `termsAcceptedAt` to user table |
| `drizzle/` | New | Migration file |
| `src/components/RegisterForm.tsx` | Modified | Add checkbox + validation |
| `src/lib/schema.ts` | Modified | Add `termsAccepted` to RegisterSchema |
| `src/lib/auth.ts` | Modified | Add `termsAcceptedAt` to additionalFields |
| `src/components/Footer.tsx` | Modified | Link to /terms |
| `messages/en.json` | Modified | Add terms keys |
| `messages/es.json` | Modified | Add terms keys |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| BetterAuth additionalFields not saving timestamp | Low | Test signup flow; fallback to DB default |
| Migration conflicts with existing data | Low | nullable column, no breaking change |
| OAuth users bypass acceptance | Low | SocialButtons currently disabled; deferred |

## Rollback Plan
- Revert schema.ts changes
- Run `drizzle-kit drop` for the migration
- Delete `src/app/terms/page.tsx`
- Revert Footer links

## Dependencies
- None

## Success Criteria
- [ ] `/terms` page renders correctly with all sections
- [ ] Register form shows checkbox, submit disabled until checked
- [ ] `termsAcceptedAt` is stored on user creation
- [ ] Footer link navigates to `/terms`
- [ ] All existing tests pass
