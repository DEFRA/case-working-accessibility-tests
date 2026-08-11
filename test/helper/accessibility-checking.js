import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import logger from '@wdio/logger'

const log = logger('caseWorkingAccessibilityTests')
const reportDirectory = path.join('./reports')

const require = createRequire(import.meta.url)
const axeSource = fs.readFileSync(
  path.join(path.dirname(require.resolve('axe-core')), 'axe.min.js'),
  'utf8'
)

const pageResults = []

export async function initialiseAccessibilityChecking() {
  if (!fs.existsSync(reportDirectory)) {
    fs.mkdirSync(reportDirectory)
  }
  pageResults.length = 0
}

// Filters out aria-allowed-attr violations on input[type="radio"] elements.
// This is a known issue in the GOV.UK Design System (GDS) — radio inputs use
// aria-expanded for conditional reveals, which axe flags as unsupported.
// GDS acknowledges this: https://design-system.service.gov.uk/components/radios/#known-issues
function filterKnownGDSViolations(violations) {
  return violations
    .map((violation) => {
      if (violation.id !== 'aria-allowed-attr') return violation
      const filteredNodes = violation.nodes.filter(
        (node) =>
          !(
            node.html.includes('type="radio"') &&
            node.html.includes('aria-expanded')
          )
      )
      if (filteredNodes.length === 0) return null
      return { ...violation, nodes: filteredNodes }
    })
    .filter(Boolean)
}

function mapImpact(impact) {
  if (impact === 'critical' || impact === 'serious') return 'critical'
  if (impact === 'moderate') return 'medium'
  return 'low'
}

export async function analyseAccessibility(suffix) {
  try {
    const url = await browser.getUrl()
    const pageTitle = await browser.getTitle()

    await browser.execute(axeSource)
    const results = await browser.executeAsync(function (done) {
      window.axe
        .run()
        .then(done)
        .catch(function (err) {
          done({ violations: [], error: err.message })
        })
    })

    const violations = filterKnownGDSViolations(results.violations || [])

    let critical = 0
    let medium = 0
    let low = 0
    let totalElements = 0

    violations.forEach((v) => {
      const severity = mapImpact(v.impact)
      const nodeCount = v.nodes.length
      totalElements += nodeCount
      if (severity === 'critical') critical += nodeCount
      else if (severity === 'medium') medium += nodeCount
      else low += nodeCount
    })

    pageResults.push({
      suffix,
      url: url + suffix,
      pageTitle,
      violations,
      critical,
      medium,
      low,
      allItemsCount: totalElements,
      totalElements: String(totalElements)
    })
  } catch (error) {
    log.error(`Accessibility analysis failed for ${suffix}: ${error.message}`)
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getWcagCategory(tags) {
  const tag = tags.find((t) => /^wcag\d/.test(t))
  if (!tag) return 'Other'
  const match = tag.match(/^wcag(\d)/)
  if (!match) return 'Other'
  const map = {
    1: 'Perceivable',
    2: 'Operable',
    3: 'Understandable',
    4: 'Robust'
  }
  return map[match[1]] || 'Other'
}

function getWcagGuideline(tags) {
  const tag = tags.find((t) => /^wcag\d{3,}/.test(t))
  if (!tag) return 'Other'
  const match = tag.match(/^wcag(\d)(\d{2})/)
  if (!match) return 'Other'
  return `${match[1]}.${parseInt(match[2])}`
}

function buildHtmlReport(title, groupFn) {
  const groups = {}

  pageResults.forEach((page) => {
    page.violations.forEach((violation) => {
      const groupKey = groupFn(violation.tags)
      if (!groups[groupKey]) groups[groupKey] = {}
      if (!groups[groupKey][violation.id]) {
        groups[groupKey][violation.id] = {
          id: violation.id,
          help: violation.help,
          description: violation.description,
          helpUrl: violation.helpUrl,
          impact: violation.impact,
          tags: violation.tags,
          pages: []
        }
      }
      groups[groupKey][violation.id].pages.push({
        suffix: page.suffix,
        url: page.url,
        nodes: violation.nodes
      })
    })
  })

  const totalViolations = pageResults.reduce(
    (sum, p) => sum + p.violations.length,
    0
  )
  const hasViolations = Object.keys(groups).length > 0

  const groupsHtml = hasViolations
    ? Object.keys(groups)
        .sort()
        .map((groupKey) => {
          const violationsHtml = Object.values(groups[groupKey])
            .map((v) => {
              const pagesHtml = v.pages
                .map(
                  (p) => `
                <details>
                  <summary class="page-url">${escapeHtml(p.suffix)} — ${escapeHtml(p.url)}</summary>
                  ${p.nodes
                    .map(
                      (n) => `
                    <div class="element">${escapeHtml(n.html)}<br>
                    <em>${escapeHtml(n.failureSummary || '')}</em></div>`
                    )
                    .join('')}
                </details>`
                )
                .join('')
              const tagsHtml = v.tags
                .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
                .join(' ')
              return `
              <div class="violation impact-${v.impact}">
                <h3>[${escapeHtml(v.impact)}] ${escapeHtml(v.help)}</h3>
                <p>${escapeHtml(v.description)}</p>
                <p>${tagsHtml}</p>
                <p><a href="${escapeHtml(v.helpUrl)}" target="_blank">Learn more ↗</a></p>
                ${pagesHtml}
              </div>`
            })
            .join('')
          return `<h2>${escapeHtml(groupKey)}</h2>${violationsHtml}`
        })
        .join('')
    : '<div class="no-issues">✓ No accessibility violations found.</div>'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: 'GDS Transport', arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f8f8f8; }
    h1 { color: #1d70b8; }
    h2 { border-bottom: 2px solid #1d70b8; padding-bottom: 8px; margin-top: 30px; }
    .summary-bar { background: white; padding: 15px 20px; border-left: 4px solid #1d70b8; margin-bottom: 20px; border-radius: 0 4px 4px 0; }
    .violation { background: white; margin: 10px 0; padding: 15px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,.1); border-left: 4px solid #b1b4b6; }
    .violation.impact-critical { border-left-color: #d4351c; }
    .violation.impact-serious { border-left-color: #f47738; }
    .violation.impact-moderate { border-left-color: #ffdd00; }
    .violation.impact-minor { border-left-color: #b1b4b6; }
    .tag { display: inline-block; background: #e8f0fe; color: #1d70b8; padding: 2px 6px; border-radius: 3px; font-size: .8em; margin: 2px; }
    .page-url { font-size: .85em; color: #505a5f; cursor: pointer; padding: 4px 0; }
    .element { background: #f0f4f5; padding: 8px; margin: 5px 0; font-family: monospace; font-size: .8em; border-radius: 3px; word-break: break-all; }
    .no-issues { background: #cce2d8; color: #005a30; padding: 20px; border-radius: 4px; font-size: 1.1em; }
    details { margin: 5px 0; }
    a { color: #1d70b8; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <div class="summary-bar">
    <strong>Pages tested:</strong> ${pageResults.length} &nbsp;|&nbsp;
    <strong>Rule violations:</strong> ${totalViolations} &nbsp;|&nbsp;
    <strong>Generated:</strong> ${new Date().toLocaleString()}
  </div>
  ${groupsHtml}
</body>
</html>`
}

export function generateAccessibilityReports(filePrefix) {
  const totalPages = pageResults.length
  const totalCritical = pageResults.reduce((sum, p) => sum + p.critical, 0)
  const totalMedium = pageResults.reduce((sum, p) => sum + p.medium, 0)
  const totalLow = pageResults.reduce((sum, p) => sum + p.low, 0)

  const jsonReport = {
    overview: [
      {
        totalPages,
        critical: totalCritical,
        medium: totalMedium,
        low: totalLow
      }
    ],
    summary: pageResults.map((p) => ({
      allItemsCount: p.allItemsCount,
      totalElements: p.totalElements,
      pageTitle: p.pageTitle,
      critical: p.critical,
      medium: p.medium,
      low: p.low,
      url: p.url
    })),
    details: pageResults.flatMap((p) =>
      p.violations.map((v) => ({
        page: p.suffix,
        url: p.url,
        ruleId: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => ({
          html: n.html,
          failureSummary: n.failureSummary
        }))
      }))
    )
  }

  fs.writeFileSync(
    path.join(reportDirectory, `${filePrefix}-accessibility-full.json`),
    JSON.stringify(jsonReport, null, 2)
  )

  fs.writeFileSync(
    path.join(reportDirectory, `${filePrefix}-accessibility-category.html`),
    buildHtmlReport(
      `${filePrefix} — Accessibility Report (By Category)`,
      (tags) => getWcagCategory(tags)
    )
  )

  fs.writeFileSync(
    path.join(reportDirectory, `${filePrefix}-accessibility-guideline.html`),
    buildHtmlReport(
      `${filePrefix} — Accessibility Report (By Guideline)`,
      (tags) => getWcagGuideline(tags)
    )
  )

  const totalViolations = totalCritical + totalMedium + totalLow
  if (totalViolations > 0) {
    const violationSummary = pageResults
      .filter((p) => p.violations.length > 0)
      .map((p) => {
        const rules = p.violations
          .map((v) => `${v.id} (${v.impact})`)
          .join(', ')
        return `  - ${p.suffix}: ${rules}`
      })
      .join('\n')
    throw new Error(
      `Accessibility violations found across ${totalPages} pages — see reports for full details.\n${violationSummary}`
    )
  }
}

export function generateAccessibilityReportIndex() {
  if (!fs.existsSync(reportDirectory)) {
    fs.mkdirSync(reportDirectory, { recursive: true })
    return
  }

  const filenames = fs
    .readdirSync(reportDirectory)
    .filter((f) => f.endsWith('.html') && f !== 'index.html')

  const html = `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>APHA SDO Accessibility Testing Reports</title>
                <style>
                    body {
                        font-family: 'GDS Transport', arial, sans-serif;
                        max-width: 1200px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f8f8f8;
                    }
                    .header {
                        background: #1d70b8;
                        color: white;
                        padding: 20px;
                        border-radius: 8px;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 2rem;
                    }
                    .header p {
                        margin: 10px 0 0 0;
                        opacity: 0.9;
                    }
                    .reports-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                        gap: 20px;
                        margin-bottom: 30px;
                    }
                    .report-card {
                        background: white;
                        border: 1px solid #dee2e6;
                        border-radius: 8px;
                        padding: 20px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        transition: transform 0.2s;
                    }
                    .report-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                    }
                    .report-title {
                        font-size: 1.2rem;
                        font-weight: bold;
                        color: #1d70b8;
                        margin-bottom: 10px;
                        text-decoration: none;
                    }
                    .report-title:hover {
                        text-decoration: underline;
                    }
                    .report-type {
                        background: #f0f9ff;
                        color: #1d70b8;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 0.8rem;
                        font-weight: bold;
                        display: inline-block;
                        margin-bottom: 10px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 40px;
                        padding: 20px;
                        color: #666;
                        border-top: 1px solid #dee2e6;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>♿ Accessibility Testing Reports</h1>
                    <p>Generated on ${new Date().toLocaleString()}</p>
                    <p>Total Reports: ${filenames.length}</p>
                </div>

                ${
                  filenames.length === 0
                    ? '<div class="report-card"><p>No accessibility reports found. Run tests with the accessibility config to generate reports.</p></div>'
                    : `<div class="reports-grid">
                        ${filenames
                          .map((filename) => {
                            const isCategory = filename.includes('-category')
                            const isGuideline = filename.includes('-guideline')
                            const reportType = isCategory
                              ? 'By Category'
                              : isGuideline
                                ? 'By Guideline'
                                : 'General'
                            const displayName = filename
                              .replace('-accessibility-category.html', '')
                              .replace('-accessibility-guideline.html', '')
                              .replace('.html', '')
                              .replace(/-/g, ' ')
                              .replace(/\b\w/g, (l) => l.toUpperCase())

                            return `
                                <div class="report-card">
                                    <div class="report-type">${reportType}</div>
                                    <a href="${filename}" class="report-title">${displayName}</a>
                                    <p>Click to view detailed accessibility analysis</p>
                                </div>
                            `
                          })
                          .join('')}
                    </div>`
                }

                <div class="footer">
                    <p>Generated by WebDriverIO Accessibility Testing Suite</p>
                    <p>Reports are organized by test suite and analysis type</p>
                </div>
            </body>
        </html>
        `
  fs.writeFileSync(path.join(reportDirectory, 'index.html'), html, (err) => {
    if (err) throw err
  })

  // Reports will be copied to Allure directory after Allure report generation
}
