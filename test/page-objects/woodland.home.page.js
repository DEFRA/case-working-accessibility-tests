import { $ } from '@wdio/globals'
import { Page } from '../page-objects/page.js'

class WoodlandHomePage extends Page {
  open() {
    return super.open('/woodland/check-details')
  }

  async completeCheckDetails() {
    const label = await $('label[for="businessDetailsUpToDate"]')
    await label.waitForClickable({ timeout: 50000 })
    await label.click()
    const btn = await $('button=Continue')
    await btn.waitForClickable({ timeout: 50000 })
    await btn.click()
  }

  async completeEligibility() {
    const startLink = await $('a[href="/woodland/eligibility-land-registered"]')
    await startLink.waitForClickable({ timeout: 50000 })
    await startLink.click()

    const eligibilityRadios = [
      'landRegisteredWithRpa',
      'landManagementControl',
      'publicBodyTenant-2',
      'landHasGrazingRights-2',
      'appLandHasExistingWmp-2',
      'intendToApplyHigherTier'
    ]

    for (const id of eligibilityRadios) {
      const label = await $(`label[for="${id}"]`)
      await label.waitForClickable({ timeout: 50000 })
      await label.click()
      const btn = await $('button=Save and continue')
      await btn.waitForClickable({ timeout: 50000 })
      await btn.click()
    }
  }

  async completeWoodlandDetails({
    landParcelId,
    hectaresTenOrOverYearsOld,
    centreGridReference,
    woodlandName,
    fcTeamCodeId
  }) {
    const parcelsLink = await $('a[href="/woodland/land-parcels"]')
    await parcelsLink.waitForClickable({ timeout: 50000 })
    await parcelsLink.click()

    const safeValue = String(landParcelId).replace(/"/g, '\\"')
    const checkbox = await $(`input[type="checkbox"][value="${safeValue}"]`)
    await checkbox.waitForExist({ timeout: 50000 })
    if (!(await checkbox.isSelected())) {
      const checkboxId = await checkbox.getAttribute('id')
      const label = await $(`label[for="${checkboxId}"]`)
      await label.click()
    }
    await (await $('button=Save and continue')).click()

    await (
      await $(`#hectaresTenOrOverYearsOld`)
    ).waitForDisplayed({ timeout: 50000 })
    await (
      await $(`#hectaresTenOrOverYearsOld`)
    ).setValue(String(hectaresTenOrOverYearsOld))
    await (await $('button=Save and continue')).click()

    await (await $(`#centreGridReference`)).waitForDisplayed({ timeout: 50000 })
    await (await $(`#centreGridReference`)).setValue(centreGridReference)
    await (await $('button=Save and continue')).click()

    await (await $(`#woodlandName`)).waitForDisplayed({ timeout: 50000 })
    await (await $(`#woodlandName`)).setValue(woodlandName)
    await (await $('button=Save and continue')).click()

    const fcLabel = await $(`label[for="${fcTeamCodeId}"]`)
    await fcLabel.waitForClickable({ timeout: 50000 })
    await fcLabel.click()
    await (await $('button=Save and continue')).click()
  }

  async submitApplication() {
    const summaryLink = await $('a[href="/woodland/summary"]')
    await summaryLink.waitForClickable({ timeout: 50000 })
    await summaryLink.click()

    for (const btnText of ['Continue', 'Continue', 'Confirm and submit']) {
      const btn = await $(`button=${btnText}`)
      await btn.waitForClickable({ timeout: 50000 })
      await btn.click()
    }
  }

  async getApplicationReference() {
    const ref = await $('.govuk-panel__body strong')
    await ref.waitForDisplayed({ timeout: 30000 })
    return (await ref.getText()).toLowerCase()
  }
}

export default new WoodlandHomePage()
