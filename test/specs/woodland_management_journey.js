import { browser } from '@wdio/globals'
import CWHomePage from '../page-objects/cw.home.page.js'
import CWApplicationPage from '../page-objects/cw.application.page.js'
import CwTasksPage from '../page-objects/cw.tasks.page.js'
import CWAgreementsPage from '../page-objects/cw.agreements.page.js'
import AgreementReviewOfferPage from '../page-objects/agreements.review.offer.page.js'
import AgreementsAcceptYourOfferPage from '../page-objects/agreements.accept.your.offer.page.js'
import AgreementsOfferAcceptedPage from '../page-objects/agreements.offer.accepted.page.js'
import LoginPage from '../page-objects/login.page.js'
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

      // CW Workflow: Start reviewing the application
      await CwTasksPage.clickButtonByText('Start')
      await browser.pause(2000)
      await analyseAccessibility('WMP Start Reviewing Application Page')
      await CwTasksPage.enterText(
        '#ACTION_APPROVE_APPLICATION-comment',
        'started reviewing the application'
      )
      await CwTasksPage.clickButtonByText('Continue')
      await browser.pause(2000)
      await analyseAccessibility('WMP Agreement Generating Confirmation Page')

      // Click Refresh page to return to the case
      await CwTasksPage.clickLinkByText('Refresh page')
      await browser.pause(2000)

      // Wait for status: Agreement ready for applicant
      await $('p*=Agreement ready for applicant').waitForDisplayed({
        timeout: 15000
      })
      await analyseAccessibility('WMP Agreement Ready for Applicant Status')

      // Notify customer that draft agreement is ready
      await CwTasksPage.clickLinkByText(
        'Notify customer that draft agreement is ready'
      )
      await browser.pause(2000)
      await CwTasksPage.selectRadioByValue('STATUS_AGREEMENT_SENT_TO_APPLICANT')
      await CwTasksPage.enterText(
        '#STATUS_AGREEMENT_SENT_TO_APPLICANT-comment',
        'The agreement has been sent to the applicant'
      )
      await analyseAccessibility('WMP Agreement Sent to Applicant Task Page')
      await CwTasksPage.clickButtonByText('Confirm')
      await browser.pause(2000)
      await analyseAccessibility('WMP Confirm Agreement Sent Audit Page')
      await CwTasksPage.enterText(
        '#ACTION_CONFIRM_AGREEMENT_SENT-comment',
        'Confirming agreement has been sent to the applicant'
      )
      await CwTasksPage.clickButtonByText('Confirm agreement sent')
      await browser.pause(2000)
      await analyseAccessibility('WMP Agreement Sent Status Page')

      // Send agreement to applicant
      // const sendAgreementLink = await $(
      //   'a[href*="TASK_AGREEMENT_SENT_TO_APPLICANT"]'
      // )
      // await sendAgreementLink.waitForClickable({ timeout: 10000 })
      // await sendAgreementLink.scrollIntoView()
      // await sendAgreementLink.click()
      // await browser.pause(2000)
      // await CwTasksPage.selectRadioByValue('STATUS_AGREEMENT_SENT_TO_APPLICANT')
      // await CwTasksPage.enterText(
      //   '#STATUS_AGREEMENT_SENT_TO_APPLICANT-comment',
      //   'The agreement has been sent to the applicant'
      // )
      // await analyseAccessibility('WMP Agreement Sent to Applicant Task Page')
      // await CwTasksPage.clickButtonByText('Confirm')
      // await browser.pause(2000)

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

      // Agreements tab - capture agreement ID and verify status is Offered
      await CWApplicationPage.clickLinkByText('Agreements')
      await browser.pause(2000)
      await analyseAccessibility('WMP Agreements Tab')

      const agreementIdInitialJourney =
        await CWAgreementsPage.getFirstAgreementReferenceText()
      expect(await CWAgreementsPage.getFirstAgreementStatusText()).toBe(
        'Offered'
      )

      // Agreements - Farmer logs in and accepts offer
      await browser.url(browser.options.agreementsUrl)
      await browser.pause(3000)
      await LoginPage.login('1102838829', process.env.DEFRA_ID_USER_PASSWORD)
      await browser.pause(3000)
      await browser.url(
        browser.options.agreementsUrl + agreementIdInitialJourney
      )
      await browser.pause(3000)
      await analyseAccessibility('WMP Agreement Review Offer Page')
      await AgreementReviewOfferPage.selectContinue()
      await browser.pause(2000)
      await analyseAccessibility('WMP Agreement Accept Your Offer Page')
      await AgreementsAcceptYourOfferPage.clickConfirmCheckbox()
      await AgreementsAcceptYourOfferPage.selectAcceptOffer()
      await browser.pause(2000)
      const confirmationText =
        await AgreementsOfferAcceptedPage.getConfirmationText()
      expect(confirmationText).toBe('Agreement offer accepted')
      await analyseAccessibility('WMP Agreement Offer Accepted Page')

      // Back to CW - wait for Ready to forward to Forestry Commission
      await browser.pause(5000)
      await browser.url(browser.options.cwUrl)
      await CWHomePage.clickLinkByText(appRefNum)
      await browser.pause(3000)
      // await $('p*=Ready to forward to Forestry Commission').waitForDisplayed({
      //   timeout: 15000
      // })
      await analyseAccessibility('Agreement accepted')
      await browser.pause(2000)

      // Create CRM record task
      await CwTasksPage.clickLinkByText('Create CRM record')
      await browser.pause(2000)
      await CwTasksPage.selectRadioByValue('STATUS_CRM_RECORD_CREATED')
      await CwTasksPage.enterText(
        '#STATUS_CRM_RECORD_CREATED-comment',
        'Create a CRM record for this application'
      )
      await analyseAccessibility('WMP Create CRM Record Task Page')
      await CwTasksPage.clickButtonByText('Confirm')
      await browser.pause(2000)
      await analyseAccessibility('WMP Forward to FC Page')

      // Forward to FC
      await CwTasksPage.enterText(
        '#ACTION_FORWARD_TO_FC-comment',
        'Forward to Forestry Commission'
      )
      await CwTasksPage.clickButtonByText(
        'Forestry Commission has been notified'
      )
      await browser.pause(2000)
      await analyseAccessibility('WMP Forestry Commission Review Page')

      // FC Review task
      await CwTasksPage.clickLinkByText('Record Forestry Commission outcome')
      await browser.pause(2000)
      await CwTasksPage.selectRadioByValue('STATUS_FC_REVIEW_SUCCESSFUL')
      await CwTasksPage.enterText(
        '#STATUS_FC_REVIEW_SUCCESSFUL-comment',
        'The Forestry Commission has completed their review of the application'
      )
      await analyseAccessibility('WMP FC Review Task Page')
      await CwTasksPage.clickButtonByText('Confirm')
      await browser.pause(2000)

      // FC Approve
      await analyseAccessibility('WMP FC Approve Page')
      await CwTasksPage.enterText(
        '#ACTION_APPROVE_FC_REVIEW-comment',
        "Forestry Commission's decision approved"
      )
      await CwTasksPage.clickButtonByText('Approve Forestry Commission review')
      await browser.pause(2000)

      // Revisit all tabs after FC approval
      await CWApplicationPage.clickLinkByText('Application')
      await browser.pause(2000)
      await analyseAccessibility('WMP Application Tab After FC Approval')

      await CWApplicationPage.clickLinkByText('Timeline')
      await browser.pause(2000)
      await analyseAccessibility('WMP Timeline Tab After FC Approval')

      await CWApplicationPage.clickLinkByText('Notes')
      await browser.pause(2000)
      await analyseAccessibility('WMP Notes Tab After FC Approval')

      await CWApplicationPage.clickLinkByText('Agreements')
      await browser.pause(2000)
      await analyseAccessibility('WMP Agreements Tab After FC Approval')

      await browser.takeScreenshot()
    })
  })
})
