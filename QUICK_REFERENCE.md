# Accessibility Testing - Quick Reference

## Running Tests

### Local

```bash
# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Run tests
npm run test:local

# Run with debugging
npm run test:local:debug
```

### View Reports

```bash
open reports/index.html
```

---

## Current Status (March 6, 2026)

| Metric              | Value                            |
| ------------------- | -------------------------------- |
| Pages Tested        | 15                               |
| Critical Issues     | 21                               |
| Pages with 0 Errors | 9 (60%)                          |
| Main Issue          | `aria-expanded` on radio buttons |

---

## Critical Issue: Fix Required

### Problem

```html
<!-- ❌ WRONG -->
<input type="radio" aria-expanded="false" />
```

### Solution

```html
<!-- ✅ CORRECT -->
<input type="radio" />
```

**Action**: Remove `aria-expanded` from all radio inputs
**Effort**: 1-2 days
**Priority**: High

---

## Adding Accessibility Checks

```javascript
import {
  analyseAccessibility,
  generateAccessibilityReports,
  initialiseAccessibilityChecking
} from '../helper/accessibility-checking.js'

describe('My Test', () => {
  before(async () => {
    // Initialize wcagChecker
    await initialiseAccessibilityChecking()
  })

  it('should test accessibility', async () => {
    await browser.url('/page')
    // Scan page with wcagChecker
    await analyseAccessibility('Page Name')
  })

  after(async () => {
    // Generate HTML reports
    generateAccessibilityReports('my-test')
  })
})
```

---

## Severity Levels

🔴 **Critical**: Blocks access, fix immediately
🟡 **Medium**: Creates difficulty, fix soon
🟢 **Low**: Best practice, backlog

---

## WCAG Quick Rules

### Must Have (Level A)

- ✅ Alt text on images
- ✅ Labels on form inputs
- ✅ Keyboard accessible
- ✅ Valid HTML/ARIA

### Should Have (Level AA) ⭐ Target

- ✅ 4.5:1 color contrast
- ✅ Resize text to 200%
- ✅ Multiple ways to find content
- ✅ Consistent navigation

---

## Testing Tools

### Automated

- **axe DevTools**: Browser extension
- **WAVE**: Visual overlay
- **Lighthouse**: Chrome audit

### Manual

- **NVDA**: Free screen reader
- **Keyboard**: Unplug mouse!
- **Zoom**: Test at 200%

---

## Common Fixes

### Missing Alt Text

```html
<img src="logo.png" alt="Company Logo" />
```

### Missing Label

```html
<label for="name">Name</label> <input id="name" type="text" />
```

### Low Contrast

Use colors with 4.5:1 ratio minimum

### Semantic HTML

```html
<button>Click</button>
<!-- Not <div onclick> -->
<nav>...</nav>
<!-- Not <div class="nav"> -->
```

---

## Next Steps

### This Sprint

1. Fix `aria-expanded` on radio buttons
2. Re-run tests to verify
3. Add tests to CI/CD

### Next Sprint

4. Address low severity issues
5. Manual screen reader testing
6. Team training

---

## Documentation

- **Full Guide**: `ACCESSIBILITY_TESTING_GUIDE.md`
- **Demo Slides**: `ACCESSIBILITY_DEMO_SLIDES.md`
- **Executive Summary**: `EXECUTIVE_SUMMARY.md`
- **Demo Setup**: `DEMO_README.md`

---

## Resources

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)

---

## Support

Questions? Check the full guide or reach out to the team.

**Last Updated**: March 2026
