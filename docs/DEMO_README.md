# Accessibility Testing Demo - Setup Guide

This directory contains all materials needed for the accessibility testing demo.

## Demo Materials

### 1. **ACCESSIBILITY_TESTING_GUIDE.md**

Comprehensive documentation covering:

- What is accessibility testing
- Setup and installation
- Running tests
- Understanding reports
- Common issues and fixes
- Best practices

**Use for**: Reference material, onboarding, troubleshooting

---

### 2. **ACCESSIBILITY_DEMO_SLIDES.md**

Presentation slides covering:

- Why accessibility matters
- Testing approach
- Live demo walkthrough
- Key findings
- Next steps

**Use for**: Stakeholder presentations, team demos

---

## Preparing for the Demo

### Before the Demo (30 mins before)

1. **Verify environment setup**

   ```bash
   # Check Node.js version
   node --version  # Should be >= 20.11.1

   # Verify dependencies installed
   npm list --depth=0
   ```

2. **Update API keys**

   ```bash
   # Edit .env file with fresh keys
   nano .env
   # Update X_API_KEY (refreshes daily)
   # Verify GAS_KEY is current
   ```

3. **Test run (dry run)**

   ```bash
   # Do a quick test run
   export $(cat .env | grep -v '^#' | xargs)
   npm run test:local
   ```

4. **Clean up old reports**

   ```bash
   npm run clean
   ```

5. **Open presentation**

   ```bash
   # If using Marp
   npx @marp-team/marp-cli ACCESSIBILITY_DEMO_SLIDES.md --preview

   # Or convert to HTML
   npx @marp-team/marp-cli ACCESSIBILITY_DEMO_SLIDES.md -o demo-slides.html

   # Or present directly in VS Code with Marp extension
   ```

---

## Demo Flow (30-45 minutes)

### Part 1: Introduction (10 mins)

**Slides**: 1-15

- What is accessibility?
- Why it matters (legal, business, moral)
- WCAG guidelines overview
- Testing approach

**Key Points:**

- 15% of population affected
- Legal requirement (WCAG 2.1 AA)
- Automated + manual testing needed

---

### Part 2: Technical Overview (5 mins)

**Slides**: 16-22

- Technology stack
- Test architecture
- How it works

**Key Points:**

- WebDriverIO + axe-core
- Scans 15 pages
- Generates HTML reports

---

### Part 3: Live Demo (10 mins)

**Slides**: 23-28

```bash
# Show terminal
export $(cat .env | grep -v '^#' | xargs)
npm run test:local
```

**Narrate while running:**

1. "Cleaning old reports..."
2. "Creating test application via API..."
3. "Launching Chrome browser..."
4. "Logging in with Entra ID..."
5. "Navigating through E2E journey..."
6. "Scanning each page for accessibility issues..."
7. "Generating reports..."

**Show in browser:**

- E2E journey execution (if visible)
- Report opens automatically
- Navigate through the report

---

### Part 4: Results Analysis (10 mins)

**Slides**: 29-40

**Open**: `reports/index.html`

1. **Show main index**

   - 2 report types available

2. **Open category report**

   - Navigate to a page with violations
   - Expand a critical violation
   - Show details: What, Why, How to Fix

3. **Explain the finding**

   - aria-allowed-attr violation
   - Show the wrong code
   - Show the fix

4. **Highlight the win**
   - Redundant alt text is fixed!

**Key Points:**

- 21 critical violations found
- All in radio buttons (aria-expanded)
- Easy fix, big impact
- 60% of pages have 0 critical errors

---

### Part 5: Next Steps & Q&A (5 mins)

**Slides**: 41-55

- Immediate actions
- Short-term improvements
- Long-term strategy
- Questions

**Key Points:**

- Fix critical violations this sprint
- Add tests to CI/CD pipeline
- Plan manual testing sessions
- Team training needed

---

## Demo Tips

### Do's ✅

- ✅ Test everything before the demo
- ✅ Have reports pre-generated as backup
- ✅ Know your audience (technical vs. non-technical)
- ✅ Focus on "why" before "how"
- ✅ Show real impact on users
- ✅ Keep it interactive
- ✅ Leave time for questions

### Don'ts ❌

- ❌ Assume tests will run perfectly (have backup)
- ❌ Get too technical too quickly
- ❌ Skip the "why accessibility matters" section
- ❌ Ignore questions until the end
- ❌ Rush through the report analysis
- ❌ Forget to show the positive findings

---

## Backup Plan (If Live Demo Fails)

1. **Pre-record the demo**

   - Record screen before demo day
   - Have video ready as backup

2. **Use existing reports**

   - Show pre-generated reports
   - Walk through them instead

3. **Show screenshots**

   - Take screenshots of key moments
   - Include in slides as backup

4. **Explain what would happen**
   - Describe the process
   - Show code examples
   - Focus on results

---

## Audience Adaptation

### For Executives / Non-Technical

**Focus on:**

- Business value (slides 3-9)
- Legal requirements
- User impact
- ROI and metrics (slide 47)
- High-level results
- Skip technical details

**Time**: 20-25 mins

---

### For Developers / Technical Team

**Focus on:**

- Technology stack (slides 16-22)
- Code examples
- Test architecture
- How to add tests
- Detailed violation analysis
- Remediation techniques

**Time**: 40-45 mins

---

### For QA Team

**Focus on:**

- Testing approach (manual + automated)
- Report analysis
- Severity levels
- How to identify issues
- Testing best practices
- Manual testing needs

**Time**: 35-40 mins

---

### For Product Owners

**Focus on:**

- User impact
- Business value
- Compliance requirements
- Prioritization guidance
- Backlog planning
- Success metrics

**Time**: 25-30 mins

---

## Converting Slides to Different Formats

### HTML Presentation

```bash
npx @marp-team/marp-cli ACCESSIBILITY_DEMO_SLIDES.md -o demo-slides.html
open demo-slides.html
```

### PDF

```bash
npx @marp-team/marp-cli ACCESSIBILITY_DEMO_SLIDES.md -o demo-slides.pdf --allow-local-files
```

### PowerPoint

```bash
npx @marp-team/marp-cli ACCESSIBILITY_DEMO_SLIDES.md -o demo-slides.pptx
```

### VS Code (Live Editing)

1. Install "Marp for VS Code" extension
2. Open `ACCESSIBILITY_DEMO_SLIDES.md`
3. Click preview icon (or `Cmd+K V`)
4. Present with `F5` or export

---

## Demo Checklist

### Day Before

- [ ] Update `.env` with fresh API keys
- [ ] Run test successfully
- [ ] Review generated reports
- [ ] Test slides (preview/export)
- [ ] Charge laptop
- [ ] Test screen sharing/projector

### 1 Hour Before

- [ ] Run tests again
- [ ] Verify reports generated
- [ ] Open slides in presentation mode
- [ ] Open browser with report ready
- [ ] Have terminal ready with command
- [ ] Close unnecessary applications
- [ ] Disable notifications

### 30 Minutes Before

- [ ] Test AV setup
- [ ] Connect to projector/screen share
- [ ] Adjust screen resolution if needed
- [ ] Have water ready
- [ ] Review key talking points
- [ ] Take a breath!

---

## Q&A Preparation

### Expected Questions

**Q: How long does it take to run?**
A: 2-3 minutes for the complete E2E journey with 15 page scans.

**Q: Can we run this on every PR?**
A: Yes! It's designed for CI/CD. Takes ~3 mins per run.

**Q: What percentage of issues does this catch?**
A: Automated testing catches 30-40%. Manual testing needed for the rest.

**Q: How do we fix the violations?**
A: Reports include exact guidance. Most fixes are simple code changes.

**Q: Will this break our existing tests?**
A: No, it runs alongside existing tests. No conflicts.

**Q: How much does this cost?**
A: Free! All open-source tools (axe-core, WebDriverIO).

**Q: Do we need accessibility experts?**
A: Helpful but not required. Reports provide clear guidance.

**Q: What about false positives?**
A: axe-core has zero false positives by design.

---

## After the Demo

### Immediate Actions

1. Share presentation materials
2. Send link to reports
3. Create tickets for critical violations
4. Schedule follow-up meeting

### Follow-up Materials to Send

- This README
- `ACCESSIBILITY_TESTING_GUIDE.md`
- Link to generated reports
- Summary of findings (slide 30-31)
- Action items (slides 44-45)

### Gather Feedback

- What questions came up?
- What needs more explanation?
- What's the team's confidence level?
- Any concerns or blockers?

---

## Resources for Further Learning

### For Team Members

- [WebAIM Quick Reference](https://webaim.org/resources/quickref/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Checklist](https://www.w3.org/WAI/WCAG21/quickref/)

### For Hands-on Practice

- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [WebAIM Training](https://webaim.org/training/)
- [Deque University](https://dequeuniversity.com/)

---

## Troubleshooting

### Browser doesn't launch

```bash
# Ensure ChromeDriver is installed
npm list chromedriver

# Reinstall if needed
npm install
```

### API returns 403

```bash
# Update X_API_KEY in .env (refreshes daily)
# Verify GAS_KEY is correct for environment
```

### No reports generated

```bash
# Check if tests completed successfully
# Verify allure-results/ directory exists
# Re-run: npm run test:local
```

### Slides won't render

```bash
# Install Marp CLI
npm install -g @marp-team/marp-cli

# Or use VS Code extension
# Search for "Marp for VS Code" in extensions
```

---

## Success Indicators

The demo was successful if:

✅ Audience understands why accessibility matters
✅ Team sees value in automated testing
✅ Clear action items identified
✅ Owner assigned for fixing violations
✅ Timeline agreed for remediation
✅ Plan for ongoing accessibility testing

---

## Contact

For questions about the demo materials or testing setup:

- Review `ACCESSIBILITY_TESTING_GUIDE.md`
- Check the project README
- Reach out to the team

---

**Good luck with your demo! 🎉**
