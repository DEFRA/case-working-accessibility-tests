# Accessibility Testing Guide

## Overview

This guide provides comprehensive documentation for automated accessibility testing in the Case Working application using WebDriverIO and axe-core.

## Table of Contents

1. [What is Accessibility Testing?](#what-is-accessibility-testing)
2. [Technology Stack](#technology-stack)
3. [Setup and Installation](#setup-and-installation)
4. [Running Tests](#running-tests)
5. [Understanding Reports](#understanding-reports)
6. [Test Structure](#test-structure)
7. [Adding New Tests](#adding-new-tests)
8. [Common Issues and Fixes](#common-issues-and-fixes)
9. [Best Practices](#best-practices)

---

## What is Accessibility Testing?

Accessibility testing ensures that applications can be used by people with disabilities, including those who:

- Use screen readers (blind or visually impaired users)
- Navigate with keyboard only (motor impairments)
- Require high contrast or larger text (low vision)
- Use assistive technologies

### Why It Matters

- **Legal Compliance**: WCAG 2.1 Level A/AA compliance is required by law in many jurisdictions
- **Inclusive Design**: Ensures everyone can use your application
- **Better UX**: Accessible design benefits all users
- **SEO Benefits**: Semantic HTML improves search engine rankings

### WCAG Guidelines

We test against **WCAG 2.1 Level A and AA** standards:

- **Level A**: Basic accessibility features (must have)
- **Level AA**: Enhanced accessibility (should have)
- **Level AAA**: Specialized accessibility (optional)

---

## Technology Stack

### Core Technologies

- **WebDriverIO v9.4.3**: E2E testing framework
- **wcagChecker**: Custom accessibility testing wrapper (bundles axe-core v4.10.2)
- **Mocha**: Test framework
- **Allure Reporter**: Test reporting

### Why wcagChecker?

- Custom wrapper built specifically for WebDriverIO integration
- Internally uses axe-core v4.10.2 (industry-standard engine by Deque)
- Generates formatted HTML reports by category and WCAG guideline
- Covers 80+ WCAG rules
- Fast and accurate
- No false positives

---

## Setup and Installation

### Prerequisites

- Node.js >= 20.11.1
- Chrome browser
- Git

### Installation Steps

```bash
# Clone the repository
git clone <repository-url>
cd case-working-accessibility-tests

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your credentials
```

### Environment Variables

The `.env` file contains:

```bash
ENVIRONMENT=dev              # Environment: dev, test, perf-test
ENTRA_ID_WRITER_USER=        # CW user credentials
ENTRA_ID_USER_PASSWORD=      # CW user password
GAS_KEY=                     # API Gateway authentication token
X_API_KEY=                   # API key (refreshes daily)
```

**Important**: `X_API_KEY` refreshes daily. Update it before running tests locally.

---

## Running Tests

### Local Execution

```bash
# Run all accessibility tests
npm run test:local

# Run with debugging enabled
npm run test:local:debug
```

### CI/CD Execution

```bash
# GitHub Actions
npm run test:github

# CDP Pipeline (uses wdio.conf.js)
npm test
```

### What Happens During a Test Run

1. **Clean**: Removes old reports and results
2. **Application Creation**: Creates test application via API
3. **Browser Launch**: Opens Chrome browser
4. **User Login**: Authenticates with Entra ID
5. **E2E Journey**: Navigates through the complete case working flow
6. **Accessibility Checks**: Scans each page with axe-core at key checkpoints
7. **Report Generation**: Creates HTML reports with findings
8. **Report Opening**: Automatically opens `reports/index.html`

---

## Understanding Reports

### Report Structure

After test execution, reports are generated in the `reports/` directory:

```
reports/
├── index.html                                    # Main landing page
├── case-working-e2e-journey-accessibility-category.html   # Grouped by issue type
└── case-working-e2e-journey-accessibility-guideline.html  # Grouped by WCAG guideline
```

### Report Components

#### 1. **Index Page** (`reports/index.html`)

- Overview of all test runs
- Links to detailed reports
- Generation timestamp

#### 2. **Category Report**

Groups issues by type (e.g., aria-allowed-attr, image-alt, form-label)

#### 3. **Guideline Report**

Groups issues by WCAG success criterion (e.g., 1.1.1, 1.3.1, 4.1.2)

### Severity Levels

Reports classify issues by impact:

- **Critical (High Impact)**: Severe accessibility barriers that prevent users from accessing content

  - Example: Missing form labels, invalid ARIA attributes

- **Medium (Moderate Impact)**: Issues that create difficulties but don't completely block access

  - Example: Insufficient color contrast

- **Low (Minor Impact)**: Best practice violations that may affect some users
  - Example: Missing landmarks, non-descriptive link text

### Reading a Violation

Each violation includes:

1. **Rule Name**: e.g., "aria-allowed-attr"
2. **What It Means**: Plain English description
3. **Why It Matters**: Impact on users
4. **How to Fix It**: Remediation guidance
5. **Standards**: WCAG success criteria references
6. **XPath/HTML**: Exact location of the issue

---

## Test Structure

### Main Test File

**Location**: `test/specs/case_e2e_journey.js`

```javascript
describe('SFI Application E2E Tests', () => {
  before(async () => {
    // Initialize accessibility checking
    await initialiseAccessibilityChecking()
  })

  describe('Given farmer goes through the complete E2E journey', () => {
    after(async () => {
      // Generate reports at the end
      generateAccessibilityReports('case-working-e2e-journey')
    })

    it('Then the farmer is able to complete the SFI application', async () => {
      // 1. Create application via API
      const apiResponse = await createApplication(
        environment,
        'frps-private-beta'
      )

      // 2. Navigate to Case Working
      await browser.url(browser.options.cwUrl)

      // 3. Login
      await entraLogin(username, password)

      // 4. Perform accessibility checks at each major page
      await analyseAccessibility('CW All Cases Page')

      // ... continue with E2E flow
    })
  })
})
```

### Accessibility Helper Functions

**Location**: `test/helper/accessibility-checking.js`

#### `initialiseAccessibilityChecking()`

Initializes wcagChecker and prepares the testing environment.

#### `analyseAccessibility(pageName)`

Scans the current page for accessibility issues using wcagChecker.

```javascript
await analyseAccessibility('Page Description')
```

#### `generateAccessibilityReports(testSuiteName)`

Generates HTML reports from collected accessibility data.

```javascript
generateAccessibilityReports('test-suite-name')
```

#### `generateAccessibilityReportIndex()`

Creates the index page linking to all reports.

---

## Adding New Tests

### Adding Accessibility Checks to Existing Tests

1. **Import the helper functions**:

```javascript
import {
  analyseAccessibility,
  generateAccessibilityReports,
  initialiseAccessibilityChecking
} from '../helper/accessibility-checking.js'
```

2. **Initialize in `before` hook**:

```javascript
before(async () => {
  await initialiseAccessibilityChecking()
})
```

3. **Add checks at key points**:

```javascript
// After navigating to a page
await browser.url('/some-page')
await analyseAccessibility('Some Page Name')
```

4. **Generate reports in `after` hook**:

```javascript
after(async () => {
  generateAccessibilityReports('my-test-suite')
})
```

### Best Practices for Checkpoint Placement

Add accessibility checks:

- ✅ **After page navigation**
- ✅ **After form submission**
- ✅ **After dynamic content loads**
- ✅ **Before critical user actions**
- ❌ **Not during animations or transitions**
- ❌ **Not before page fully loads**

---

## Common Issues and Fixes

### Issue 1: aria-allowed-attr

**Problem**: Using unsupported ARIA attributes on elements.

```html
<!-- ❌ WRONG -->
<input type="radio" aria-expanded="false" />

<!-- ✅ CORRECT -->
<input type="radio" />
```

**Fix**: Remove `aria-expanded` from radio buttons. This attribute is only for expandable widgets.

---

### Issue 2: Missing Form Labels

**Problem**: Form inputs without associated labels.

```html
<!-- ❌ WRONG -->
<input type="text" name="firstName" />

<!-- ✅ CORRECT -->
<label for="firstName">First Name</label>
<input type="text" id="firstName" name="firstName" />
```

---

### Issue 3: Redundant Alternative Text

**Problem**: Image alt text duplicating nearby text.

```html
<!-- ❌ WRONG -->
<a href="/">
  <img src="logo.png" alt="Company Name" />
  Company Name
</a>

<!-- ✅ CORRECT -->
<a href="/">
  <img src="logo.png" alt="" />
  Company Name
</a>
```

---

### Issue 4: Insufficient Color Contrast

**Problem**: Text not meeting 4.5:1 contrast ratio.

**Fix**: Use higher contrast colors or increase text size.

- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum

---

### Issue 5: Missing Page Landmarks

**Problem**: No semantic HTML5 landmarks (header, nav, main, footer).

```html
<!-- ❌ WRONG -->
<div class="header">...</div>
<div class="content">...</div>

<!-- ✅ CORRECT -->
<header>...</header>
<main>...</main>
<footer>...</footer>
```

---

## Best Practices

### 1. Test Early and Often

- Run accessibility tests on every pull request
- Don't wait until the end of development
- Catch issues before they reach production

### 2. Understand the Issues

- Don't just fix violations mechanically
- Understand why each rule exists
- Consider the user impact

### 3. Manual Testing is Still Important

Automated testing catches ~30-40% of accessibility issues. Also perform:

- Keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Browser zoom testing (up to 200%)
- High contrast mode testing

### 4. Use Semantic HTML

Good HTML structure is the foundation of accessibility:

```html
<!-- Use proper semantic elements -->
<button>Click me</button>
<!-- Not <div onclick="..."> -->
<nav>...</nav>
<!-- Not <div class="nav"> -->
<h1>
  ,
  <h2>
    ,
    <h3><!-- Not <div class="heading"> --></h3>
  </h2>
</h1>
```

### 5. Progressive Enhancement

Build accessible by default:

1. Start with semantic HTML (works without CSS/JS)
2. Add CSS for visual design
3. Add JavaScript for enhanced functionality

### 6. Test with Real Users

Include users with disabilities in your testing process:

- Users of screen readers
- Users of keyboard-only navigation
- Users with motor impairments
- Users with cognitive disabilities

---

## Troubleshooting

### Browser Not Launching

**Problem**: Chrome doesn't start when running locally.

**Solution**: Ensure environment variables are loaded:

```bash
export $(cat .env | grep -v '^#' | xargs) && npm run test:local
```

### API 403 Forbidden Error

**Problem**: Application creation fails with 403 error.

**Solutions**:

1. **Update X_API_KEY**: This key refreshes daily
2. **Check GAS_KEY**: Verify it's current for your environment
3. **Verify Environment**: Ensure `ENVIRONMENT` variable is set

### Tests Pass But No Reports Generated

**Problem**: Tests complete but `reports/` directory is empty.

**Solution**: Ensure you're calling `generateAccessibilityReports()` in the `after` hook.

### Payload Version Error

**Problem**: API returns 400/403 due to incorrect payload format.

**Solution**: Ensure `version` fields in payloads are strings, not numbers:

```json
{
  "version": "1" // ✅ Correct (string)
}
```

Not:

```json
{
  "version": 1 // ❌ Wrong (number)
}
```

---

## CI/CD Integration

### GitHub Actions

The tests run automatically on:

- Pull requests
- Commits to main branch
- Scheduled nightly runs

### CDP Pipeline

Tests run as part of the deployment pipeline:

- Environment variables are injected automatically
- Reports are uploaded as artifacts
- Failures block deployment

---

## Resources

### WCAG Guidelines

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM WCAG Checklist](https://webaim.org/standards/wcag/checklist)

### Tools

- [axe DevTools Browser Extension](https://www.deque.com/axe/devtools/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)

### Learning

- [WebAIM Articles](https://webaim.org/articles/)
- [A11y Project](https://www.a11yproject.com/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

## Support

For questions or issues:

1. Check this documentation
2. Review existing test examples
3. Consult WCAG guidelines
4. Reach out to the team

---

**Last Updated**: March 2026
**Version**: 1.0
