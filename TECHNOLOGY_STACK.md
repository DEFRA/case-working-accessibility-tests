# Technology Stack

## Overview

This document explains the technology stack used for accessibility testing in the Case Working application.

---

## Core Components

### 1. WebDriverIO v9.4.3

**Role**: E2E Testing Framework

- Controls browser automation
- Runs test specs
- Manages test lifecycle
- Provides browser APIs

### 2. wcagChecker (Custom)

**Role**: Accessibility Testing Wrapper
**Location**: `dist/wcagchecker.js`

- Custom wrapper built for WebDriverIO integration
- **Internally bundles axe-core v4.10.2**
- Provides three main functions:
  - `init(browser)` - Initialize the checker
  - `analyse(browser, pageName)` - Scan a page for violations
  - `getHtmlReportByCategory()` - Generate category-based HTML report
  - `getHtmlReportByGuideLine()` - Generate WCAG guideline-based HTML report

**Important**: We use wcagChecker, **NOT** axe-core directly.

### 3. axe-core (Bundled)

**Role**: Accessibility Testing Engine
**Version**: v4.10.2 (bundled inside wcagChecker.js)

- Industry-standard accessibility engine by Deque
- Tests against 80+ WCAG rules
- Zero false positives by design
- Provides the actual violation detection

**Note**: axe-core v4.10.3 is listed in package.json as a devDependency but is **NOT imported or used directly** in the code. All accessibility testing goes through wcagChecker.

### 4. Mocha

**Role**: Test Framework

- Provides `describe`, `it`, `before`, `after` hooks
- Manages test execution
- Handles assertions

### 5. Allure Reporter

**Role**: Test Reporting

- Generates Allure test reports
- Separate from accessibility reports
- Used for general test execution reporting

---

## How It Works

```
┌─────────────────────────────────────────────────┐
│          Test Spec (case_e2e_journey.js)        │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│       Accessibility Helper Functions            │
│       (test/helper/accessibility-checking.js)   │
│                                                 │
│  - initialiseAccessibilityChecking()            │
│  - analyseAccessibility(pageName)               │
│  - generateAccessibilityReports()               │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│            wcagChecker                          │
│            (dist/wcagchecker.js)                │
│                                                 │
│  Bundles: axe-core v4.10.2                      │
│                                                 │
│  Methods:                                       │
│  - init(browser)                                │
│  - analyse(browser, suffix)                     │
│  - getHtmlReportByCategory()                    │
│  - getHtmlReportByGuideLine()                   │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│         axe-core Engine (v4.10.2)               │
│                                                 │
│  - Scans DOM for violations                     │
│  - Tests 80+ WCAG rules                         │
│  - Returns violations with XPath                │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│          HTML Reports Generated                 │
│                                                 │
│  - case-working-e2e-journey-accessibility-      │
│    category.html                                │
│  - case-working-e2e-journey-accessibility-      │
│    guideline.html                               │
│  - index.html (landing page)                    │
└─────────────────────────────────────────────────┘
```

---

## File Structure

```
case-working-accessibility-tests/
│
├── dist/
│   ├── wcagchecker.js          ← Main accessibility testing library
│   └── wave.min.js             ← Unused, can be deleted
│
├── test/
│   ├── specs/
│   │   └── case_e2e_journey.js ← Test that uses accessibility checks
│   │
│   └── helper/
│       └── accessibility-checking.js ← Wrapper around wcagChecker
│
├── reports/                     ← Generated HTML reports
│   ├── index.html
│   ├── *-accessibility-category.html
│   └── *-accessibility-guideline.html
│
└── node_modules/
    └── axe-core/               ← Installed but NOT used directly
```

---

## Code Flow

### 1. Test Initialization

```javascript
// In test spec
import {
  initialiseAccessibilityChecking,
  analyseAccessibility,
  generateAccessibilityReports
} from '../helper/accessibility-checking.js'

describe('My Test', () => {
  before(async () => {
    // This initializes wcagChecker
    await initialiseAccessibilityChecking()
  })
})
```

### 2. Page Scanning

```javascript
it('should test page', async () => {
  await browser.url('/some-page')

  // This calls wcagChecker.analyse(browser, 'My Page')
  await analyseAccessibility('My Page')
})
```

### 3. Report Generation

```javascript
after(async () => {
  // This calls wcagChecker methods to generate HTML
  generateAccessibilityReports('my-test-suite')
})
```

---

## What wcagChecker Does

### Function: `init(browser)`

- Injects axe-core into the browser context
- Prepares the testing environment
- Must be called once before any `analyse` calls

### Function: `analyse(browser, suffix)`

- Runs axe-core accessibility scan on current page
- Collects violations
- Stores results internally for report generation
- Tags results with the provided suffix (page name)

### Function: `getHtmlReportByCategory()`

- Generates HTML report grouped by violation type
- Example: All "aria-allowed-attr" violations together
- Returns HTML string

### Function: `getHtmlReportByGuideLine()`

- Generates HTML report grouped by WCAG success criterion
- Example: All WCAG 4.1.2 violations together
- Returns HTML string

---

## Why wcagChecker Instead of Direct axe-core?

### Benefits of wcagChecker wrapper:

1. **WebDriverIO Integration**: Designed specifically for WebDriverIO
2. **Report Generation**: Built-in HTML report formatting
3. **State Management**: Aggregates results across multiple page scans
4. **Ease of Use**: Simple API (init, analyse, generate)

### If using axe-core directly:

- Would need to inject it into browser manually
- Would need to write custom report generation
- Would need to manage state across scans
- More code to maintain

---

## Dependencies in package.json

```json
{
  "dependencies": {
    "@wdio/allure-reporter": "9.4.3",
    "@wdio/cli": "9.4.3"
    // ... other WebDriverIO packages
  },
  "devDependencies": {
    "axe-core": "4.10.3", // NOT used directly
    "chromedriver": "144.0.0"
    // ... other dev dependencies
  }
}
```

**Note**: `axe-core` v4.10.3 is installed but not imported anywhere. The actual axe-core being used is v4.10.2 bundled inside `wcagchecker.js`.

---

## Common Misconceptions

### ❌ Misconception 1: "We use axe-core directly"

**Reality**: We use wcagChecker, which bundles axe-core internally.

### ❌ Misconception 2: "axe-core in package.json is what we use"

**Reality**: That's v4.10.3 and not imported. wcagChecker uses bundled v4.10.2.

### ❌ Misconception 3: "We should update to latest axe-core"

**Reality**: The version is embedded in wcagchecker.js. Can't update independently.

---

## Updating the Stack

### To update WebDriverIO:

```bash
npm update @wdio/cli @wdio/local-runner
```

### To update wcagChecker:

- This is a custom library copied from another project
- Updates would require copying a new version of `wcagchecker.js`
- Or building from source if source is available

### To update axe-core (the bundled version):

- Would require updating wcagChecker itself
- Not possible to update independently

---

## Testing Tools Comparison

| Tool             | Purpose                              | How We Use It           |
| ---------------- | ------------------------------------ | ----------------------- |
| **wcagChecker**  | Automated testing in test suite      | ✅ Primary tool         |
| **axe-core**     | Core testing engine                  | ❌ Bundled, not direct  |
| **axe DevTools** | Browser extension for manual testing | 👍 Recommended for devs |
| **WAVE**         | Visual overlay for manual testing    | 👍 Recommended for devs |
| **Lighthouse**   | Chrome audit tool                    | 👍 Supplementary        |

---

## Summary

**What we actually use:**

1. WebDriverIO (test framework)
2. wcagChecker (accessibility wrapper)
   - Contains axe-core v4.10.2
3. Custom helper functions (wrapper around wcagChecker)

**What we don't use directly:**

- axe-core package from node_modules
- axe DevTools (that's for manual browser testing)

**Bottom line**: All automated accessibility testing goes through wcagChecker, which internally uses axe-core v4.10.2.

---

**Last Updated**: March 2026
