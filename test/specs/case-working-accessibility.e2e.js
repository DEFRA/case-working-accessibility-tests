import { browser } from '@wdio/globals'
import {
  analyseAccessibility,
  generateAccessibilityReports,
  initialiseAccessibilityChecking
} from '../helper/accessibility-checking.js'
import { entraLogin } from '../utils/cw-login-helper.js'

describe('Case Working Accessibility Tests', () => {
  before(async () => {
    await initialiseAccessibilityChecking()

    // Login to Case Working
    await browser.url(browser.options.cwUrl)
    const cwUsername = process.env.ENTRA_ID_ADMIN_USER
    const cwPassword = process.env.ENTRA_ID_USER_PASSWORD
    await entraLogin(cwUsername, cwPassword)
  })

  it('should analyse case working pages accessibility', async () => {
    // Analyse the home page (All Cases)
    await analyseAccessibility('Case Working Home Page')

    // Wait for page to be fully loaded
    await browser.pause(2000)

    // Generate reports after all analyses
    generateAccessibilityReports('case-working-accessibility')
  })
})
