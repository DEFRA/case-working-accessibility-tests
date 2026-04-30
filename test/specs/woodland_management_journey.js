import { browser } from '@wdio/globals'
import CWHomePage from '../page-objects/cw.home.page.js'
import CWApplicationPage from '../page-objects/cw.application.page.js'
import { entraLogin } from '../utils/cw-login-helper.js'

import {
  analyseAccessibility,
  generateAccessibilityReports,
  initialiseAccessibilityChecking
} from '../helper/accessibility-checking.js'
import { createApplication } from '../utils/api-helper.js'

afterEach(async () => {
  // Clear all cookies after each test
  await browser.deleteCookies()
})

describe('Woodland Management Plan Accessibility Tests', () => {
  before(async () => {
    await initialiseAccessibilityChecking()
  })

  describe('Given a case worker reviews a Woodland Management Plan application', () => {
    after(async () => {
      // Generate accessibility reports - runs even on test failure
      generateAccessibilityReports('woodland-management-journey')
    })

    it('Then the case worker is able to review the WMP application', async () => {
      // Create WMP application via API
      const environment = process.env.ENVIRONMENT || 'dev'
      const apiResponse = await createApplication(environment, 'woodland')
      await browser.pause(5000)
      expect(apiResponse.statusCode).toBe(204)
      const appRefNum = apiResponse.clientRef

      console.log(`WMP application created with reference: ${appRefNum}`)

      // Navigate to Case Working
      console.log(`Navigating to CW URL: ${browser.options.cwUrl}`)
      await browser.url(browser.options.cwUrl)

      await browser.pause(3000)
      const currentUrl = await browser.getUrl()
      console.log(`Current URL after navigation: ${currentUrl}`)

      const cwUsername = process.env.ENTRA_ID_WRITER_USER
      const cwPassword = process.env.ENTRA_ID_USER_PASSWORD
      console.log(`Attempting login with username: ${cwUsername}`)
      await entraLogin(cwUsername, cwPassword)

      const isReferenceInTable = await CWHomePage.waitUntilVisible(appRefNum)
      await expect(isReferenceInTable).toBe(true)
      await browser.pause(2000)

      // Accessibility check - All Cases page
      await analyseAccessibility('WMP All Cases Page')

      await CWHomePage.clickLinkByText(appRefNum)
      await browser.pause(3000)

      // Accessibility check - Tasks tab (default landing page)
      await analyseAccessibility('WMP Tasks Tab')

      // Application tab
      await CWApplicationPage.clickLinkByText('Application')
      await browser.pause(2000)
      await analyseAccessibility('WMP Application Tab')

      // Timeline tab
      await CWApplicationPage.clickLinkByText('Timeline')
      await browser.pause(2000)
      await analyseAccessibility('WMP Timeline Tab')

      // Notes tab
      await CWApplicationPage.clickLinkByText('Notes')
      await browser.pause(2000)
      await analyseAccessibility('WMP Notes Tab')

      await browser.takeScreenshot()
    })
  })
})
