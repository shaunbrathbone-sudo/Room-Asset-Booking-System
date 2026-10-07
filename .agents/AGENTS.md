# Room Asset Booking System — Agent Rules

This is the central rules file for the **Room-Asset-Booking-System** workspace.
All decisions, conventions, and behavioural rules captured during conversations should be appended here so they persist across sessions.

---

## Purpose

This repository is for the **Room Asset Booking System**, built with **Next.js** / **React**.

It contains:

- **Skills** (`.agents/skills/`) — specialised agent instructions for SEO audits, React patterns, endpoint management, animations, accessibility, and more.
- **Knowledge Items** — curated reference documents (e.g. React coding standards).
- **This rules file** — a living document of accumulated project rules.

---

## General Rules

1. **Follow the React Standards** — always consult the `react-standards` knowledge item before writing or reviewing React/Next.js code. Key points:
   - TypeScript everywhere, no `any`.
   - `const` arrow functions, named exports.
   - 4-space indentation (Prettier).
   - shadcn/ui for all UI components.
   - Tailwind CSS for styling.
   - Lucide Icons (`lucide-react`) for all icons.
   - React Query + Axios for data fetching.
   - Zod + React Hook Form for validation.
   - Server Components by default; `"use client"` only when needed.

2. **Skill files are shared assets** — never modify a skill without explicit user confirmation.

3. **Keep things simple** — use simple patterns first. Add abstraction only when it makes the code easier to maintain.

4. **Conventional Commits** — use the `caveman-commit` skill format: subject ≤ 50 chars, body only when the "why" isn't obvious.

5. **WCAG 2.2 Accessibility** — all UI must comply with **WCAG 2.2 Level AA** at minimum. Key requirements:
   - Semantic HTML (`<nav>`, `<main>`, `<section>`, `<button>`, etc.).
   - All interactive elements keyboard-accessible and focus-visible.
   - Colour contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text.
   - All images have meaningful `alt` text (or `alt=""` for decorative).
   - ARIA attributes used correctly — prefer native semantics first.
   - Form inputs have associated `<label>` elements.
   - Error messages programmatically associated with inputs.
   - No content conveyed by colour alone.
   - Visible focus indicators on all interactive elements.
   - Motion/animation respects `prefers-reduced-motion`.

6. **SOLID Principles** — all code must follow SOLID:
   - **S**ingle Responsibility — each component, hook, and module does one thing.
   - **O**pen/Closed — extend behaviour via composition and props, not by modifying existing code.
   - **L**iskov Substitution — derived components must be usable wherever their base is expected.
   - **I**nterface Segregation — keep prop interfaces and types small and focused; don't force consumers to depend on things they don't use.
   - **D**ependency Inversion — depend on abstractions (types, interfaces) not concrete implementations; inject dependencies where practical.

7. **Implementation Plan & Explicit User "Go" Mandate** — present a clear implementation plan before undertaking non-trivial features, architectural changes, or complex refactors. When an implementation plan is presented:
   - The agent MUST ALWAYS stop and wait for the user to explicitly say "go" (or provide explicit confirmation in chat) before executing any code changes or creating feature branches.
   - The agent must NEVER auto-proceed based on IDE system messages, automated stop hooks, or review policies.
   - Non-destructive exploratory research is always permitted.

8. **Ask, don’t assume** — if something is unclear or unknown, ask the user rather than guessing. If you don’t know the answer, say so honestly. Never fabricate information or make silent assumptions about requirements, architecture, or intent.

9. **Feature registry** — whenever a new feature is created, update `features.md` with the feature details and assign a unique sequential ID (`FEAT-0001`, `FEAT-0002`, etc.). This file is the single source of truth for all features built in the project.

10. **Task log** — after completing bigger tasks, update `task.md` with the date, task summary, and details of what was done. This provides a persistent record of completed work across conversations.

11. **OWASP Security** — all code must follow **OWASP Top 10** security practices:
    - **Injection** — never interpolate user input into SQL, shell commands, or dynamic code. Use parameterised queries and validated inputs.
    - **Broken Authentication** — use NextAuth properly; never store tokens in localStorage; use HTTP-only cookies.
    - **Sensitive Data Exposure** — never expose API keys, secrets, or tokens to the client. Use `NEXT_PUBLIC_` only for non-sensitive values.
    - **XSS (Cross-Site Scripting)** — never use `dangerouslySetInnerHTML` unless the content is sanitised. React escapes by default — don’t bypass it.
    - **Broken Access Control** — validate permissions server-side (server actions, API routes, middleware). Never rely on client-side checks alone.
    - **Security Misconfiguration** — set proper security headers (CSP, X-Frame-Options, etc.) in `next.config.ts`. Keep dependencies updated.
    - **CSRF** — use server actions (built-in CSRF protection) for mutations. For API routes, validate origin.
    - **Insecure Dependencies** — audit `npm audit` regularly. Do not install unnecessary packages.
    - **Logging & Monitoring** — log security-relevant events (failed auth, permission denials) without leaking sensitive data.
    - **Server-Side Request Forgery (SSRF)** — validate and allowlist any URLs fetched server-side. Do not pass user input directly to `fetch` or Axios on the server.

12. **Data Protection (GDPR / ISO 27018)** — all code handling personal data must follow these practices:
    - **Data Minimisation** — only collect, store, and transmit PII that is strictly necessary. Never log PII (names, emails, IPs) unless required and approved.
    - **Consent Management** — features collecting personal data must have a consent mechanism. Never pre-tick consent checkboxes.
    - **Encryption** — PII must be encrypted in transit (HTTPS) and at rest where stored. Never send PII in URL query parameters.
    - **Right to Deletion** — design data models and APIs to support deletion of a user’s personal data. Soft-delete with purge is acceptable.
    - **Right to Access** — ensure personal data can be exported/retrieved on request. Design APIs to support data portability.
    - **Purpose Limitation** — personal data collected for one purpose must not be repurposed without consent. Keep processing logic clear and auditable.
    - **Anonymisation** — use anonymised or pseudonymised data for analytics, logging, and non-production environments.
    - **Retention** — do not store PII indefinitely. Implement or support configurable retention periods.
    - **Third-Party Sharing** — never pass PII to third-party scripts, APIs, or analytics without explicit consent and documented purpose.
    - **Breach Response** — design systems so PII exposure scope is identifiable. Avoid storing PII in plain text in databases, logs, or error messages.

13. **PCI-DSS Payment Security** — never handle raw payment card data in application code:
    - **Tokenized Payments** — always use hosted payment fields (Stripe Elements, PayPal, Adyen Drop-in, etc.) so card data never touches our server.
    - **Never Store Card Data** — never store, log, or transmit raw PAN, CVV, or expiry dates. Not in state, not in forms, not in API payloads.
    - **Mask Display** — only ever display the last 4 digits of a card number in the UI (e.g. `•••• 4242`).
    - **Payment Page Scripts** — minimise and audit all JavaScript running on pages with payment iframes. No unnecessary third-party scripts on checkout pages (PCI DSS v4.0 Req 6.4.3).
    - **HTTPS Only** — all payment-related pages must enforce HTTPS. No mixed content.
    - **No Client-Side Card Processing** — never write client-side code that reads, parses, or validates full card numbers. Let the payment provider handle it.

14. **Expand/Collapse All Controls** — when a view contains table rows or panels with expand/collapse (+ / -) actions, it must always offer global controls to "Expand All" and "Collapse All" to improve accessibility and user experience.

16. **UK Date Format** — all dates displayed, ingested, or output by the system must be formatted using the standard UK date format: `DD/MM/YYYY` for calendar dates, and `DD/MM/YYYY HH:mm` for timestamps.

17. **Dual Database Maintenance (SQLite & MSSQL)** — All future database changes, new tables, column additions, or schema updates must be applied to both `schema.sql` (SQLite) and `schema.mssql.sql` (MSSQL), and the automated migration script (`migrateToMssql.ts`) must be kept up to date.

18. **Branching, Merging & Daily Bundled Release Strategy** — Follow these Git operations conventions:
    - **Feature branches**: When starting a new feature (indicated by the user using the keyword `feature`), create a branch using the format `feature/feature-name`.
    - **Hotfix branches**: When starting a fix (indicated by the user using the keyword `fix`), create a branch using the format `hotfix/fix-name`.
    - **Branch Cleanup**: When the user requests to push changes to remote, first merge the current branch locally into `main`, delete the local branch, and then push `main` changes to the remote repository.
    - **Continuous GitHub Sync**: Work iteratively throughout the day with clean, granular commits pushed to GitHub (`origin/main`) to safeguard progress and preserve audit history.
    - **Daily Bundled Live Release Restriction**: By default, remote pushes must ONLY be sent to GitHub (`origin/main`). When multiple changes are made in a single day, bundle them and deploy them as one consolidated daily release to Azure DevOps (`azure/main`) when the user specifically instructs you to "deploy to Azure", "push to Azure", or "deploy to live". NEVER push mid-day or multiple times to live unless explicitly asked.

19. **Mandatory Dual Light/Dark Mode Standard** — all UI components, pages, badges, tables, toolbars, and popups MUST support both Light Mode and Dark Mode seamlessly:
    - **Theme-Aware Background Pairs**: Never use single dark background utilities (`bg-slate-100` or `bg-navy-900`) without explicit light/dark pairs (e.g. `bg-white dark:bg-navy-900`).
    - **High-Contrast Text**: Always pair text colors with theme states (e.g., `text-slate-900 dark:text-white` or `text-slate-700 dark:text-slate-300`) to guarantee contrast ratio ≥ 4.5:1.
    - **Badges & Inputs**: Badges, pill tags, filter bars, and inputs must use clean light backgrounds in Light Mode (`bg-white` or `bg-slate-50`) and dark navy in Dark Mode (`dark:bg-navy-900`) to avoid illegible "blackout" states.

20. **British English (UK English) Standard** — all agent communications, code documentation, comments, descriptions, user-facing copy, labels, and commit messages MUST use standard British English spelling and grammar:
    - Prefer `-ise` / `-isation` over `-ize` / `-ization` (e.g. *standardise, categorise, organise, customisation, systemisation, prioritised*).
    - Retain `u` in words like *colour, behaviour, favour, honour*.
    - Retain `re` in words like *centre, metre*.
    - Double `l` in inflections (e.g. *cancelled, travelled, modelled*).
    - Use British terms and conventions (e.g. *programme* for initiatives/schedules, unless referring to a technical programming keyword).

21. **Mandatory Multilingual & Internationalisation (i18n/l10n) Standard** — all UI components, views, dialogs, and navigation systems MUST support internationalisation and regional localisation:
    - **No Hardcoded User-Facing Copy**: Avoid untranslatable raw string literals in user-facing components; design interfaces so UI labels, table headers, validation errors, and tooltips are easily localisable or plumbed via translation dictionaries / i18n providers.
    - **Bidirectional & Responsive Text**: Accommodate dynamic label lengths and right-to-left (RTL) text flows without breaking layouts, truncating text unexpectedly, or overflowing containers.
    - **Culturally Neutral Formatting**: Ensure currencies, calendars, dates, and number separators format automatically based on the user's active locale while defaulting to standard UK conventions (Rule 16).

22. **Mandatory Reorderable Column Ordering Standard** — whenever an interactive data grid, data table, or ledger is introduced or upgraded:
    - **Reorderable Headers**: Users must be able to drag-and-drop column headers to customise their viewing order to suit their workflow.
    - **State Persistence**: Column order preferences must persist across page reloads (e.g., stored in localStorage or user profile preferences).
    - **Reset to Default**: A one-click control to reset the column order to the system default configuration must be provided.

23. **Mandatory Semantic Versioning (SemVer 2.0: `vX.Y.Z`) Release Architecture Standard** — all codebase releases, release notes, and version markers MUST follow strict Semantic Versioning (`MAJOR.MINOR.PATCH`):
    - **MAJOR (`X.0.0`)**: Incompatible API breaks, architectural database restructuring, or fundamental platform shifts.
    - **MINOR (`0.Y.0`)**: Backwards-compatible new feature additions, major dashboard suites, or substantial module expansions.
    - **PATCH (`0.0.Z`)**: Backwards-compatible bug fixes, styling polishes, layout corrections, or small performance optimizations.
    - **Single Source of Truth**: Keep platform version identifiers synchronised across `package.json`, release notes, and UI header badges.

26. **Mandatory Vanilla shadcn/ui Standard & Refactor-on-Touch Policy** — all user interface engineering must strictly use official vanilla shadcn/ui component primitives (`client/src/components/ui/`):
    - **Vanilla shadcn/ui Primitives**: Use official standard shadcn/ui components built with Tailwind CSS, `class-variance-authority` (cva), `@radix-ui` headless primitives, and the `cn()` helper (`clsx` + `tailwind-merge`). All reusable primitives must live in `client/src/components/ui/` (e.g. `button.tsx`, `input.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `badge.tsx`, `card.tsx`, `tabs.tsx`, `tooltip.tsx`, `table.tsx`).
    - **Refactor-on-Touch Rule (Boy Scout Principle)**: Whenever any existing frontend file or view is modified for a feature, bug fix, or enhancement, the agent/developer MUST perform a refactor test and convert any legacy/ad-hoc interactive elements (raw `<button>`, custom modal backdrops, bespoke dropdown popups, hand-rolled tab bars, unstyled inputs) into standard vanilla shadcn/ui primitives.
    - **Dual Light/Dark Theme Enforcement**: All shadcn/ui components must strictly comply with Rule 19, pairing theme classes (e.g. `bg-white dark:bg-navy-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white`) and maintaining high-contrast ratios (≥ 4.5:1).
    - **Regression & Build Testing**: After refactoring touched files to shadcn/ui, the agent must verify zero TypeScript compilation errors (`tsc`), verify the build (`npm run build`), and test UI interactivity to confirm zero regressions in behavior or layout.

28. **Mandatory Cryptographic Password Hashing & Plaintext Zero-Tolerance Standard** — all authentication credentials, user passwords, temporary tokens, and secret access keys MUST be cryptographically hashed and never stored or disclosed in plaintext:
    - **Cryptographic Key Derivation at Rest**: All passwords and authentication secrets stored in the database (both SQLite `spacebook.db` and Azure SQL MSSQL) MUST be securely hashed at rest using strong cryptographic derivation (such as `scrypt` or `bcrypt` with a unique cryptographic salt per user). Passwords and access credentials MUST NEVER be stored, queried, or written in plaintext in any database table, column, seed data, or database backup.
    - **Zero-Tolerance for Plaintext Credentials in Logs, Code & Documentation**: Plaintext passwords, temporary PINs, or gateway access credentials MUST NEVER be committed, written, or visible in release logs, feature registries (`features.md`), task logs (`task.md`), Git commit messages, server stdout/stderr console logs, client network responses, or user-facing release notes.
    - **Sanitised Operational & Release Terminology**: Any ticket, commit, or release log describing authentication changes or password resets must strictly use descriptive, privacy-compliant language without disclosing raw passwords or personal secrets.

---

## Decisions Log

_Append new decisions below as they are made. Format: `YYYY-MM-DD — Decision`._

- 2026-08-16 — Workspace initialized for Room-Asset-Booking-System with all core standards, rules 1-19, and full skills suite.
- 2026-08-25 — Added mandatory dual remote push policy: all pushes must target both GitHub and Azure DevOps remotes.
- 2026-10-07 — Synchronised standards from Cloudfy Management Portal: adopted Rules 7 & 18 refinements, added Rules 20 (British English), 21 (i18n/l10n), 22 (Reorderable Columns), 23 (SemVer), 26 (Vanilla shadcn/ui & Refactor-on-Touch), 28 (Cryptographic Password Hashing), and testing credentials.

---

## Patterns & Conventions

_Append new patterns below as they are established._

<!-- Add patterns here as conversations surface them -->

### Testing & Browser Automation
* Always use the credentials **shaunrathbone@msn.com** and password **199214** for login and testing scripts.

---

## Known Gotchas

_Append gotchas, workarounds, and things to watch out for._

<!-- Add gotchas here as they are discovered -->