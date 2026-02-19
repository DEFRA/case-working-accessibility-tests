import { browser } from '@wdio/globals'
import CWHomePage from '../page-objects/cw.home.page.js'
import { entraLogin } from '../utils/cw-login-helper.js'
import CwTasksPage from '../page-objects/cw.tasks.page.js'
import CwAllCasesPage from '../page-objects/cw.allcases.page.js'
// import CwTimelinePage from '../page-objects/cw.timeline.page.js'
import CWAgreementsPage from '../page-objects/cw.agreements.page.js'

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

describe('SFI Application E2E Tests', () => {
  before(async () => {
    await initialiseAccessibilityChecking()
  })

  describe('Given farmer goes through the complete E2E journey', () => {
    after(async () => {
      // Generate accessibility reports - runs even on test failure
      generateAccessibilityReports('case-working-e2e-journey')
    })

    it('Then the farmer is able to complete the SFI application', async () => {
      // Create application via API
      const environment = process.env.ENVIRONMENT || 'dev'
      const apiResponse = await createApplication(
        environment,
        'frps-private-beta'
      )
      await browser.pause(5000)
      expect(apiResponse.statusCode).toBe(204)
      const appRefNum = apiResponse.clientRef

      console.log(`Application created with reference: ${appRefNum}`)

      // CW Approval Process
      console.log(`Navigating to CW URL: ${browser.options.cwUrl}`)
      await browser.url(browser.options.cwUrl)

      // Wait for page to load
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
      await analyseAccessibility('CW All Cases Page')

      await CWHomePage.clickLinkByText(appRefNum)
      await browser.pause(5000)

      // Accessibility check - Case Details/Tasks page
      await analyseAccessibility('CW Case Details and Tasks Page')

      await CwTasksPage.clickButtonByText('Start')
      await CwTasksPage.completeTask('Check customer details')

      // Accessibility check - After completing first task
      await analyseAccessibility('CW After Customer Details Task')

      await CwTasksPage.completeTask('Review land parcel rule checks')

      // Accessibility check - After land parcel rule checks
      await analyseAccessibility('CW After Land Parcel Rule Checks Task')

      await CwTasksPage.completeTask(
        'Check if any land parcels are within an SSSI'
      )

      // Accessibility check - After SSSI check
      await analyseAccessibility('CW After SSSI Check Task')

      await CwTasksPage.completeTask('Check payment amount')

      // Accessibility check - After payment amount check
      await analyseAccessibility('CW After Payment Amount Task')

      await CwTasksPage.completeTask(
        'Review scheme budget as a finance officer'
      )

      // Accessibility check - After scheme budget review
      await analyseAccessibility('CW After Scheme Budget Review Task')

      // Accessibility check - After completing all tasks
      await analyseAccessibility('CW After All Tasks Completed')

      await CwTasksPage.approveCaseWithComments('APPROVE_APPLICATION')

      await browser.pause(5000)

      // Accessibility check - Approval confirmation page
      await analyseAccessibility('CW Approval Confirmation Page')

      await CwAllCasesPage.clickButtonByText('Confirm')
      await browser.pause(5000)

      // Accessibility check - After case approved
      await analyseAccessibility('CW After Case Approved')

      await browser.refresh()
      await CwTasksPage.waitForElement('Agreements')

      await CwTasksPage.confirmTask('Check draft funding agreement')

      // Accessibility check - After draft funding agreement confirmation
      await analyseAccessibility('CW After Draft Funding Agreement Task')

      await CwTasksPage.confirmTask('Notify customer that agreement is ready')

      // Accessibility check - After customer notification task
      await analyseAccessibility('CW After Customer Notification Task')

      await CwTasksPage.approveAgreement('AGREEMENT_SENT')
      await CwAllCasesPage.clickButtonByText('Confirm')

      // Accessibility check - After agreement approval confirmation
      await analyseAccessibility('CW After Agreement Approval Confirmation')

      const agreementsPageTitle = await CWAgreementsPage.headerH2()
      expect(agreementsPageTitle).toEqual('Customer Agreement Review')
      await analyseAccessibility('CW After Agreement Review')

      await CwTasksPage.clickLinkByText('Agreements')

      const agreementIdInitialJourney =
        await CWAgreementsPage.getFirstAgreementReferenceText()
      expect(await CWAgreementsPage.getFirstAgreementStatusText()).toBe(
        'Offered'
      )
      await analyseAccessibility('On agreements page')

      await browser.takeScreenshot()
      await browser.pause(5000)
      console.log(`agreementId :`, agreementIdInitialJourney)
    })
  })
})
