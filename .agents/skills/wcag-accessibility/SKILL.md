---
name: wcag-accessibility
description: >
  Audits HTML and React/Next.js components for WCAG 2.2 Level AA compliance.
  Checks colour contrast, keyboard access, ARIA usage, form labels, focus management,
  motion safety, and content accessibility. Use when writing, reviewing, or auditing
  UI for accessibility compliance.
license: MIT
metadata:
  version: "1.0"
  wcag-version: "2.2"
  conformance-target: "Level AA"
---

# WCAG 2.2 Accessibility Audit

Audit pages and components for **WCAG 2.2 Level AA** conformance.

> **Scope**: This skill covers interactive and content accessibility. For semantic HTML structure and ARIA landmarks, see the [semantic-layout](../semantic-layout/SKILL.md) skill. For mobile touch targets and viewport, see the [mobile-optimization](../mobile-optimization/SKILL.md) skill.

---

## 1. Colour contrast

Check foreground/background colour pairs against WCAG 2.2 thresholds:

| Text type | Minimum ratio | Missing = |
|---|---|---|
| Normal text (< 18px / < 14px bold) | 4.5:1 | ❌ FAIL |
| Large text (≥ 18px / ≥ 14px bold) | 3:1 | ❌ FAIL |
| UI components & graphical objects | 3:1 | ❌ FAIL |

- Inline `color` and `background-color` styles → check ratio
- Tailwind text/bg classes → check mapped colour values
- If colours cannot be determined statically → ⚠️ WARN "Verify contrast manually"

---

## 2. Keyboard accessibility

### 2.1 Interactive elements

All interactive elements must be operable via keyboard:

| Check | Status |
|---|---|
| `<div>` or `<span>` with `onClick` but no `role`, `tabIndex`, or `onKeyDown` | ❌ FAIL "Use `<button>` or add keyboard support" |
| Custom components using `onClick` without keyboard handler | ⚠️ WARN "Verify keyboard accessibility" |
| `<a>` without `href` used as button | ⚠️ WARN "Use `<button>` instead" |
| All interactive elements reachable via Tab | ✅ PASS |

### 2.2 Focus order

- `tabindex` > 0 found → ⚠️ WARN "Positive tabindex disrupts natural focus order"
- `tabindex="-1"` on interactive elements → ⚠️ WARN "Element removed from tab order — verify intentional"

### 2.3 Focus visible (WCAG 2.4.7 / 2.4.11 / 2.4.12)

| Check | Status |
|---|---|
| `outline: none` or `outline: 0` without replacement focus style | ❌ FAIL "Focus indicator removed" |
| `:focus-visible` styles present | ✅ PASS |
| Tailwind `focus-visible:ring-*` classes present | ✅ PASS |
| No focus styles found on interactive elements | ⚠️ WARN "Add visible focus indicators" |

### 2.4 Focus trapping

- Modal/dialog components must trap focus within while open
- Focus must return to trigger element on close
- `<dialog>` or `[role="dialog"]` without focus management → ⚠️ WARN

---

## 3. ARIA usage

### 3.1 Valid ARIA

| Check | Status |
|---|---|
| Invalid `role` value | ❌ FAIL |
| `aria-*` attribute not valid for the element's role | ❌ FAIL |
| `aria-labelledby` or `aria-describedby` referencing non-existent `id` | ❌ FAIL |
| `aria-hidden="true"` on focusable element | ❌ FAIL |
| Redundant ARIA (e.g. `role="button"` on `<button>`) | ⚠️ WARN "Unnecessary — native semantics sufficient" |

### 3.2 Prefer native semantics

- `<div role="button">` → ⚠️ WARN "Use native `<button>` instead"
- `<div role="link">` → ⚠️ WARN "Use native `<a>` instead"
- `<div role="heading">` → ⚠️ WARN "Use native `<h1>`–`<h6>` instead"
- `<span role="checkbox">` → ⚠️ WARN "Use native `<input type='checkbox'>` instead"

### 3.3 Live regions

- Dynamic content updates without `aria-live` → ⚠️ WARN "Screen readers may miss updates"
- Toast/notification components without `role="alert"` or `aria-live="polite"` → ⚠️ WARN

---

## 4. Forms and labels

| Check | Status |
|---|---|
| `<input>` / `<select>` / `<textarea>` without associated `<label>`, `aria-label`, or `aria-labelledby` | ❌ FAIL |
| `<label>` without matching `for`/`htmlFor` attribute | ⚠️ WARN |
| Placeholder used as only label | ❌ FAIL "Placeholder disappears on input — use a proper label" |
| Required fields without `aria-required="true"` or `required` attribute | ⚠️ WARN |
| Error messages not programmatically associated (`aria-describedby` or `aria-errormessage`) | ❌ FAIL |
| Form submission errors not announced to screen readers | ⚠️ WARN "Use `aria-live` or `role='alert'`" |
| `autocomplete` attribute missing on common fields (name, email, tel, address) | ⚠️ WARN (WCAG 1.3.5) |

---

## 5. Images and media

| Check | Status |
|---|---|
| `<img>` without `alt` attribute | ❌ FAIL |
| Decorative `<img>` without `alt=""` and `role="presentation"` | ⚠️ WARN |
| `<img alt="image">` or `<img alt="photo">` (non-descriptive) | ⚠️ WARN "Alt text should describe the image content" |
| Next.js `<Image>` without `alt` prop | ❌ FAIL |
| `<svg>` without `aria-label`, `aria-labelledby`, or `<title>` | ⚠️ WARN |
| Decorative `<svg>` without `aria-hidden="true"` | ⚠️ WARN |
| `<video>` without `<track kind="captions">` | ⚠️ WARN (WCAG 1.2.2) |
| `<audio>` without transcript link | ⚠️ WARN (WCAG 1.2.1) |

---

## 6. Headings and content structure

| Check | Status |
|---|---|
| No `<h1>` on page | ❌ FAIL |
| Multiple `<h1>` elements | ⚠️ WARN "Use a single `<h1>` per page" |
| Heading levels skipped (e.g. `<h1>` → `<h3>`) | ⚠️ WARN "Maintain sequential heading hierarchy" |
| Information conveyed by colour alone (e.g. red text for errors without icon or prefix) | ❌ FAIL (WCAG 1.4.1) |

---

## 7. Motion and animation

| Check | Status |
|---|---|
| CSS animations/transitions without `@media (prefers-reduced-motion: reduce)` | ⚠️ WARN |
| Framer Motion / Motion components without `useReducedMotion()` hook | ⚠️ WARN |
| Auto-playing content without pause/stop control | ❌ FAIL (WCAG 2.2.2) |
| Content that flashes more than 3 times per second | ❌ FAIL (WCAG 2.3.1) |
| Parallax or scroll-jacking effects without reduced-motion fallback | ⚠️ WARN |

---

## 8. Links and navigation

| Check | Status |
|---|---|
| Links with identical text but different destinations | ⚠️ WARN (WCAG 2.4.9) |
| `<a>` with no text content, `aria-label`, or child with text | ❌ FAIL "Link has no accessible name" |
| Icon-only links/buttons without `aria-label` | ❌ FAIL |
| "Click here" or "Read more" as sole link text | ⚠️ WARN "Use descriptive link text" |
| Links that open in new window without warning | ⚠️ WARN "Add `aria-label` indicating new window, or visible indicator" |

---

## 9. Tables

| Check | Status |
|---|---|
| Data table without `<th>` elements | ❌ FAIL |
| `<th>` without `scope` attribute | ⚠️ WARN |
| Complex table without `<caption>` | ⚠️ WARN |
| Layout table without `role="presentation"` | ⚠️ WARN |

---

## 10. Dragging and pointer gestures (WCAG 2.5.7 / 2.5.8 — New in 2.2)

| Check | Status |
|---|---|
| Drag-and-drop without keyboard alternative | ❌ FAIL (WCAG 2.5.7) |
| Multi-point or path-based gestures without single-pointer alternative | ⚠️ WARN (WCAG 2.5.1) |
| Target size < 24×24px (excluding inline links) | ⚠️ WARN (WCAG 2.5.8) |

---

## 11. Consistent help and authentication (WCAG 3.2.6 / 3.3.8 — New in 2.2)

| Check | Status |
|---|---|
| Help mechanisms in different locations across pages | ⚠️ WARN (WCAG 3.2.6) |
| Login requiring cognitive function test (e.g. CAPTCHA) without alternative | ⚠️ WARN (WCAG 3.3.8) |

---

## Edge cases

- **shadcn/ui components** handle many accessibility patterns out of the box (Radix primitives). Still verify: custom styling hasn't broken focus indicators, `aria-label` props are passed where needed, and `Dialog` components trap focus correctly.
- **Server Components** in Next.js render static HTML — audit the rendered output. Client Components with dynamic behaviour need runtime testing.
- **CSS Modules / Tailwind** — contrast checks require resolving class names to actual colour values. Flag for manual verification when colours are set via CSS variables or theme tokens.
- **Dark mode** — audit both light and dark themes separately. Contrast that passes in light mode may fail in dark mode.
- **Third-party embeds** (iframes, widgets) — note as limitation; accessibility of embedded content is outside direct control.
- **Dynamic content** (modals, dropdowns, toasts) — must be tested at runtime for focus management and screen reader announcements.
- **Reduced motion** — `framer-motion` / `motion` components should use the `useReducedMotion()` hook or the `motion.div` `layout` prop carefully. See the [motion](../framer-motion-best-practices/SKILL.md) skill.
