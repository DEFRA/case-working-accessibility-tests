import { browser } from '@wdio/globals'
// import HomePage from '../page-objects/home.page.js'
// import LoginPage from '../page-objects/login.page.js'
// import { SERVICE_NAME } from '../utils/config.js'
// import { runFundingApiJourney } from '../utils/journey-api.js'
import CWHomePage from '../page-objects/cw.home.page.js'
import { entraLogin } from '../utils/cw-login-helper.js'
import CwTasksPage from '../page-objects/cw.tasks.page.js'
import CwAllCasesPage from '../page-objects/cw.allcases.page.js'
// import CwTimelinePage from '../page-objects/cw.timeline.page.js'
// import CWAgreementsPage from '../page-objects/cw.agreements.page.js'
// import AgreementReviewOfferPage from '../page-objects/agreements.review.offer.page.js'
// import AgreementsAcceptYourOfferPage from '../page-objects/agreements.accept.your.offer.page.js'
// import AgreementOfferAcceptedPage from '../page-objects/agreements.offer.accepted.page.js'
// import { clearState } from '../utils/clear-sbi-state.js'
import {
  analyseAccessibility,
  generateAccessibilityReports,
  initialiseAccessibilityChecking
} from '../helper/accessibility-checking.js'

afterEach(async () => {
  // Clear all cookies after each test
  await browser.deleteCookies()
})

describe('SFI Application E2E Tests', () => {
  before(async () => {
    await initialiseAccessibilityChecking()
  })

  after(async () => {
    // Generate accessibility reports even if tests fail
    generateAccessibilityReports('case-working-e2e-journey')
  })

  describe('Given farmer goes through the complete E2E journey', () => {
    it('Then the farmer is able to complete the SFI application', async () => {
      // // CW Approval Process
      const appRefNum = 'case-ref-1768228757318-4517'
      await browser.url(browser.options.cwUrl)
      const cwUsername = process.env.ENTRA_ID_READER_USER
      const cwPassword = process.env.ENTRA_ID_USER_PASSWORD
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
      await CwTasksPage.completeTask(
        'Check if any land parcels are within an SSSI'
      )
      await CwTasksPage.completeTask('Check payment amount')
      await CwTasksPage.completeTask(
        'Review scheme budget as a finance officer'
      )

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

      // await browser.refresh()
      // await CwTasksPage.waitForElement('Agreements')

      // await CwTasksPage.confirmTask('Check draft funding agreement')
      // await CwTasksPage.confirmTask('Notify customer that agreement is ready')

      // await CwTasksPage.approveAgreement('AGREEMENT_SENT')
      // await CwAllCasesPage.clickButtonByText('Confirm')

      // const agreementsPageTitle = await CWAgreementsPage.headerH2()
      // expect(agreementsPageTitle).toEqual('Customer Agreement Review')

      // await CwTasksPage.clickLinkByText('Agreements')

      // const agreementIdInitialJourney =
      //   await CWAgreementsPage.getFirstAgreementReferenceText()
      // expect(await CWAgreementsPage.getFirstAgreementStatusText()).toBe(
      //   'Offered'
      // )
      // await browser.takeScreenshot()
      // await browser.pause(5000)
      // console.log(`agreementId :`, agreementIdInitialJourney)
    })
  })
})
