---
marp: true
theme: default
paginate: true
backgroundColor: #fff
---

# Accessibility Testing Demo

## Automated WCAG Compliance Testing

**Case Working Application**
March 2026

---

## Agenda

1. Why Accessibility Testing Matters
2. Our Testing Approach
3. Technology Stack
4. Live Demo
5. Key Findings
6. Next Steps

---

## Why Accessibility Testing?

### The Numbers

- **15% of global population** has some form of disability
- **1 billion people** worldwide affected
- **£249 billion** spending power (UK Purple Pound)

### Legal Requirements

- UK: Equality Act 2010
- EU: European Accessibility Act
- WCAG 2.1 Level AA compliance **required**

---

## Accessibility is For Everyone

### Benefits All Users

- Clear navigation helps everyone
- Good contrast improves readability
- Keyboard access helps power users
- Semantic HTML improves SEO

**"Accessible design is good design"**

---

## Types of Disabilities

### Visual

- Blindness, low vision, color blindness
- **Tools**: Screen readers, magnifiers

### Motor

- Limited dexterity, tremors
- **Tools**: Keyboard-only navigation, voice control

### Cognitive

- Dyslexia, ADHD, memory issues
- **Need**: Clear language, consistent layout

### Auditory

- Deafness, hearing loss
- **Need**: Captions, transcripts

---

## WCAG 2.1 Guidelines

### Four Principles: POUR

- **P**erceivable: Can users perceive the content?
- **O**perable: Can users operate the interface?
- **U**nderstandable: Can users understand the content?
- **R**obust: Can content work with assistive technologies?

---

## WCAG Conformance Levels

### Level A (Must Have)

Basic accessibility features
Essential for some users

### Level AA (Should Have) ⭐

Enhanced accessibility
**Our target level**

### Level AAA (Nice to Have)

Specialized accessibility
Not always achievable

---

## Our Testing Approach

### Automated Testing

- **wcagChecker** engine by Deque
- Scans every page automatically
- Catches 30-40% of issues
- Fast and consistent

### Manual Testing

- Screen reader testing
- Keyboard navigation
- Real user testing
- Catches remaining 60-70%

---

## Technology Stack

```
┌─────────────────────────────────────┐
│         WebDriverIO v9.4            │  Test Framework
├─────────────────────────────────────┤
│         wcagChecker                 │  A11y Wrapper
│         (bundles axe-core 4.10.2)   │
├─────────────────────────────────────┤
│         Mocha + Allure              │  Test Runner + Reporter
├─────────────────────────────────────┤
│         Chrome + ChromeDriver       │  Browser Automation
└─────────────────────────────────────┘
```

---

## Why wcagChecker?

### Custom WebDriverIO Wrapper

- Built specifically for WebDriverIO integration
- Internally uses axe-core 4.10.2 (industry standard by Deque)
- Generates formatted HTML reports
- 80+ WCAG rules covered
- Zero false positives

### Fast & Accurate

- Scans pages in milliseconds
- Precise XPath selectors
- Detailed remediation guidance
- Reports grouped by category and WCAG guideline

---

## Test Architecture

```javascript
describe('E2E Accessibility Test', () => {
  before(() => {
    // Initialize accessibility testing
    initialiseAccessibilityChecking()
  })

  it('Complete user journey', async () => {
    // Navigate to page
    await browser.url('/cases')

    // Scan for accessibility issues
    await analyseAccessibility('All Cases Page')

    // Continue E2E flow...
  })

  after(() => {
    // Generate HTML reports
    generateAccessibilityReports('case-working')
  })
})
```

---

## Test Coverage

### 15 Pages Scanned

- All Cases Page
- Case Details & Tasks
- Task completion pages
- Approval workflows
- Agreement pages

### Key Checkpoints

✅ After page navigation
✅ After form submission
✅ After dynamic content loads
✅ Before critical actions

---

## Running Tests

### Local Development

```bash
# Set environment variables
export $(cat .env | grep -v '^#' | xargs)

# Run tests
npm run test:local
```

### CI/CD Pipeline

```bash
# Automatic execution on
- Pull requests
- Merges to main
- Scheduled nightly runs
```

---

## Demo Time! 🎬

### What We'll Show

1. Running the test suite
2. E2E journey with accessibility scans
3. Report generation
4. Analyzing findings
5. Understanding violations

---

## Live Demo

```bash
# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Execute tests
npm run test:local
```

**What happens:**

1. Clean old reports
2. Create test application via API
3. Launch Chrome browser
4. Login to Case Working
5. Complete E2E journey
6. Scan each page with wcagChecker
7. Generate HTML reports

---

## Test Execution Flow

```
Start
  ↓
Clean Reports
  ↓
Create Application (API)
  ↓
Open Browser
  ↓
Login (Entra ID)
  ↓
Navigate Pages ──→ Scan with wcagChecker (×15)
  ↓
Complete Journey
  ↓
Generate Reports
  ↓
Open reports/index.html
```

---

## Report Structure

```
reports/
├── index.html
│   └── Main landing page
│
├── case-working-e2e-journey-accessibility-category.html
│   └── Grouped by violation type
│
└── case-working-e2e-journey-accessibility-guideline.html
    └── Grouped by WCAG criterion
```

---

## Understanding the Report

### Severity Levels

🔴 **Critical (High Impact)**
Severe barriers preventing access

🟡 **Medium (Moderate Impact)**
Creates difficulties but not blocking

🟢 **Low (Minor Impact)**
Best practice violations

---

## Current Test Results

### Summary

- **Pages Tested**: 15
- **Total Issues**: 546
- **Critical Issues**: 21
- **Medium Issues**: 0
- **Low Issues**: 525

### Conformance

- **Pages with 0 Critical Errors**: 9 (60%)
- **Pages with Critical Errors**: 6 (40%)

---

## Key Finding #1: aria-allowed-attr

### Issue

Radio buttons using unsupported `aria-expanded` attribute

### Impact

- **Pages Affected**: 6
- **Occurrences**: 21 instances
- **WCAG**: 2.1 Level A (4.1.2)

### User Impact

Screen readers may misinterpret the element's state

---

## aria-allowed-attr Violation

### The Problem

```html
<!-- ❌ WRONG -->
<input
  type="radio"
  name="actionCode"
  value="APPROVE_APPLICATION"
  aria-controls="conditional-actionCode"
  aria-expanded="false"
/>
```

`aria-expanded` is only for expandable widgets (menus, accordions)
**Not for radio buttons!**

---

## The Fix

```html
<!-- ✅ CORRECT -->
<input
  type="radio"
  name="actionCode"
  value="APPROVE_APPLICATION"
  aria-controls="conditional-actionCode"
/>
```

### Action Required

Remove `aria-expanded` from all radio inputs
Likely in a shared component

---

## Positive Finding: Fixed Issues ✅

### Redundant Alternative Text

**Status**: ✅ RESOLVED

Previously reported issue with header logo:

- Image alt text duplicating nearby text
- Screen readers announcing text twice

**No longer present in current tests!**

---

## Issue Distribution by Page

| Page                 | Critical | Total   |
| -------------------- | -------- | ------- |
| All Cases Page       | 0        | 84      |
| Case Details         | 0        | 22      |
| Task Pages (3-6)     | 3 each   | 41 each |
| Approval Pages (7-9) | 4 each   | 47 each |
| After Case Approved  | 0        | 24      |
| Agreement Tasks      | 2 each   | 35-36   |
| Agreement Pages      | 0        | 21-29   |

---

## Low Severity Issues

### Common Patterns (All pages)

- Missing landmark regions
- Non-descriptive link text ("Click here")
- Redundant title attributes
- Missing skip links

### Impact

Minor UX issues, not blocking but worth addressing

---

## What Automated Testing Catches

✅ Missing alt text
✅ Invalid ARIA attributes
✅ Color contrast issues
✅ Missing form labels
✅ Keyboard access problems
✅ Landmark structure

**~30-40% of total accessibility issues**

---

## What Automated Testing Misses

❌ Logical heading order
❌ Meaningful alt text quality
❌ Focus management
❌ Screen reader experience
❌ Cognitive accessibility
❌ Content clarity

**Manual testing required! ~60-70% of issues**

---

## Remediation Priority

### High Priority (Fix Now)

🔴 Critical violations (21 items)

- **aria-allowed-attr** on radio buttons
- Blocks screen reader users

### Medium Priority (Fix Soon)

🟡 Medium violations (0 items)

- None currently

### Low Priority (Backlog)

🟢 Low violations (525 items)

- Best practices
- Minor UX improvements

---

## Recommended Actions

### Immediate (This Sprint)

1. ✅ Remove `aria-expanded` from radio inputs
2. ✅ Test fix across all affected pages
3. ✅ Re-run accessibility tests

### Short-term (Next Sprint)

4. 📋 Address high-impact low severity issues
5. 📋 Add skip navigation links
6. 📋 Improve landmark structure

---

## Recommended Actions (Cont'd)

### Medium-term (Next Quarter)

7. 🎯 Manual screen reader testing
8. 🎯 Keyboard navigation audit
9. 🎯 User testing with disabled users

### Long-term (Ongoing)

10. 🔄 Run tests on every PR
11. 🔄 Accessibility training for team
12. 🔄 Include a11y in DoD

---

## CI/CD Integration

### Current Setup

- ✅ Tests run on local development
- ✅ Tests run on CDP pipeline
- ⚠️ Tests run but don't block deployment

### Recommended

- ✅ Run on every pull request
- ✅ Block merge if critical issues found
- ✅ Upload reports as artifacts
- ✅ Track issues over time

---

## Best Practices

### For Developers

1. **Use semantic HTML** first
2. **Test with keyboard** regularly
3. **Check color contrast** in designs
4. **Run axe DevTools** during development
5. **Consider screen readers** early

---

## Best Practices (Cont'd)

### For QA

1. **Include a11y in test plans**
2. **Test with screen readers** (NVDA, JAWS, VoiceOver)
3. **Test keyboard navigation**
4. **Test at 200% zoom**
5. **Test in high contrast mode**

---

## Testing Tools

### Automated

- **axe DevTools** - Browser extension
- **WAVE** - Visual feedback overlay
- **Lighthouse** - Chrome DevTools audit

### Manual

- **NVDA** - Free Windows screen reader
- **JAWS** - Professional screen reader
- **VoiceOver** - macOS/iOS built-in
- **Keyboard only** - Unplug your mouse!

---

## Quick Wins

### Easy Fixes, Big Impact

1. ✅ Add alt text to images
2. ✅ Associate labels with inputs
3. ✅ Use semantic HTML (`<button>` not `<div>`)
4. ✅ Ensure sufficient color contrast
5. ✅ Add skip navigation links
6. ✅ Use heading hierarchy properly

---

## Accessibility Checklist

### Before Every Release

- [ ] Run automated accessibility tests
- [ ] Manual keyboard navigation test
- [ ] Screen reader spot check
- [ ] Zoom to 200% and verify layout
- [ ] Check forms have proper labels
- [ ] Verify color contrast ratios
- [ ] Test with high contrast mode

---

## Success Metrics

### Track Over Time

- Number of critical violations
- Number of pages with 0 errors
- Accessibility test coverage
- Time to fix violations
- User feedback from disabled users

**Goal: 100% of pages with 0 critical errors**

---

## ROI of Accessibility

### Business Benefits

💰 **Larger Market**: +15% potential users
⚖️ **Legal Protection**: Avoid lawsuits
💡 **Better UX**: Benefits all users
🎯 **SEO Improvement**: Better rankings
🏆 **Brand Reputation**: Shows you care

**Cost of fixing later = 100x more than building accessibly**

---

## Common Myths

### Myth #1: "Accessibility is expensive"

**Reality**: Building accessibly from start is cheap

### Myth #2: "We have no disabled users"

**Reality**: You do, they just can't use your app

### Myth #3: "Automated testing is enough"

**Reality**: Catches only 30-40% of issues

### Myth #4: "It's just for blind people"

**Reality**: Benefits everyone

---

## Learning Resources

### Official Guidelines

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Checklist](https://webaim.org/standards/wcag/checklist)

### Training

- [WebAIM Articles](https://webaim.org/articles/)
- [A11y Project](https://www.a11yproject.com/)
- [Deque University](https://dequeuniversity.com/)

### Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Extension](https://wave.webaim.org/extension/)

---

## Next Steps

### This Week

1. Review accessibility report with team
2. Create tickets for critical violations
3. Assign owners for fixes

### This Month

4. Fix all critical violations
5. Re-run tests to verify fixes
6. Plan manual testing session

---

## Team Training Plan

### Month 1: Foundation

- WCAG overview workshop
- Install testing tools
- Fix first violations

### Month 2: Practice

- Screen reader training
- Keyboard testing practice
- Review common patterns

### Month 3: Integration

- Include a11y in DoD
- Run tests on every PR
- Regular a11y reviews

---

## Questions to Consider

1. Should we block deployment on critical violations?
2. Who owns accessibility on the team?
3. When should we do manual testing?
4. How do we track improvements over time?
5. Should we get an accessibility audit?

---

## Demo Recap

### What We Covered

✅ Why accessibility matters
✅ Our testing approach
✅ Technology stack
✅ Live test execution
✅ Report analysis
✅ Key findings and fixes

### Key Takeaway

**Automated testing + manual testing = accessible application**

---

## Thank You!

### Questions?

**Documentation**: `ACCESSIBILITY_TESTING_GUIDE.md`

**Reports**: `reports/index.html`

**Run Tests**: `npm run test:local`

---

## Appendix: Quick Reference

### Run Tests

```bash
export $(cat .env | grep -v '^#' | xargs)
npm run test:local
```

### View Reports

```bash
open reports/index.html
```

### Add Accessibility Check

```javascript
await analyseAccessibility('Page Name')
```

---

## Appendix: File Structure

```
case-working-accessibility-tests/
├── test/
│   ├── specs/
│   │   └── case_e2e_journey.js
│   ├── helper/
│   │   └── accessibility-checking.js
│   ├── page-objects/
│   └── utils/
├── reports/
│   └── index.html
├── wdio.local.conf.js
└── package.json
```

---

## Appendix: Common WCAG Violations

| Rule              | Description                | Impact |
| ----------------- | -------------------------- | ------ |
| aria-allowed-attr | Invalid ARIA attributes    | High   |
| color-contrast    | Insufficient contrast      | Medium |
| image-alt         | Missing alt text           | High   |
| label             | Form inputs without labels | High   |
| link-name         | Links without text         | High   |
| button-name       | Buttons without labels     | High   |

---

## Appendix: Keyboard Testing

### Essential Shortcuts

- **Tab**: Navigate forward
- **Shift+Tab**: Navigate backward
- **Enter**: Activate buttons/links
- **Space**: Toggle checkboxes
- **Arrow keys**: Radio buttons, dropdowns
- **Esc**: Close dialogs

**Can you complete the entire user journey without a mouse?**

---

## Contact & Support

**Questions?**

- Review `ACCESSIBILITY_TESTING_GUIDE.md`
- Check existing reports
- Consult WCAG guidelines

**Need Help?**

- Reach out to the team
- Book accessibility office hours
- Join #accessibility Slack channel

---

# Thank You! 🎉

**Let's build an accessible web for everyone**
