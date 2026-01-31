import { request } from 'undici'
import { randomUUID } from 'crypto'
import { browser } from '@wdio/globals'

export async function setupAgreement({ sbi, frn, agreementName, clientRef }) {
  const requestBody = {
    id: randomUUID(),
    source: 'fg-gas-backend',
    specversion: '1.0',
    datacontenttype: 'application/json',
    time: '2025-11-25T15:58:27.496Z',
    traceparent: 'c335f29d2d4455947fd4047bd3353f67',
    type: 'cloud.defra.dev.fg-gas-backend.agreement.create',
    data: {
      clientRef,
      code: 'frps-private-beta',
      identifiers: {
        sbi,
        frn,
        crn: '1102838829  ',
        defraId: 'defraId'
      },
      answers: {
        rulesCalculations: {
          id: 2979,
          message: 'Application validated successfully',
          valid: true,
          date: '2025-11-21T10:10:43.673Z'
        },
        scheme: 'SFI',
        applicant: {
          business: {
            reference: '1101091126',
            email: {
              address: 'texelshirecontractingg@gnitcartnocerihslexeto.com.test'
            },
            phone: '01234816251',
            name: 'Texels Hire & Contracting',
            address: {
              line1: 'Benbrigge House',
              line2: 'ALBRIGHTON',
              line3: null,
              line4: null,
              line5: null,
              street: 'BRIDGE ROAD',
              city: 'GRIMSBY',
              postalCode: 'DY13 0UY'
            }
          },
          customer: {
            name: {
              title: 'Mr',
              first: 'Graham',
              middle: 'Lisa',
              last: 'Gilfoyle'
            }
          }
        },
        totalAnnualPaymentPence: 70284,
        application: {
          parcel: [
            {
              sheetId: 'SK0971',
              parcelId: '7555',
              area: {
                unit: 'ha',
                quantity: 5.2182
              },
              actions: [
                {
                  code: 'CMOR1',
                  version: 1,
                  durationYears: 1,
                  appliedFor: {
                    unit: 'ha',
                    quantity: 4.7575
                  }
                },
                {
                  code: 'UPL3',
                  version: 1,
                  durationYears: 1,
                  appliedFor: {
                    unit: 'ha',
                    quantity: 4.7575
                  }
                }
              ]
            },
            {
              sheetId: 'SK0971',
              parcelId: '9194',
              area: {
                unit: 'ha',
                quantity: 2.1703
              },
              actions: [
                {
                  code: 'CMOR1',
                  version: 1,
                  durationYears: 1,
                  appliedFor: {
                    unit: 'ha',
                    quantity: 2.1705
                  }
                },
                {
                  code: 'UPL1',
                  version: 1,
                  durationYears: 1,
                  appliedFor: {
                    unit: 'ha',
                    quantity: 2.1705
                  }
                }
              ]
            }
          ],
          agreement: []
        },
        payments: {
          parcel: [
            {
              sheetId: 'SK0971',
              parcelId: '7555',
              area: {
                unit: 'ha',
                quantity: 5.2182
              },
              actions: [
                {
                  code: 'CMOR1',
                  description: 'Assess moorland and produce a written record',
                  durationYears: 1,
                  paymentRates: 1060,
                  annualPaymentPence: 5042,
                  eligible: {
                    unit: 'ha',
                    quantity: 4.7575
                  },
                  appliedFor: {
                    unit: 'ha',
                    quantity: 4.7575
                  }
                },
                {
                  code: 'UPL3',
                  description: 'Limited livestock grazing on moorland',
                  durationYears: 1,
                  paymentRates: 6600,
                  annualPaymentPence: 31399,
                  eligible: {
                    unit: 'ha',
                    quantity: 4.7575
                  },
                  appliedFor: {
                    unit: 'ha',
                    quantity: 4.7575
                  }
                }
              ]
            },
            {
              sheetId: 'SK0971',
              parcelId: '9194',
              area: {
                unit: 'ha',
                quantity: 2.1703
              },
              actions: [
                {
                  code: 'CMOR1',
                  description: 'Assess moorland and produce a written record',
                  durationYears: 1,
                  paymentRates: 1060,
                  annualPaymentPence: 2300,
                  eligible: {
                    unit: 'ha',
                    quantity: 2.1705
                  },
                  appliedFor: {
                    unit: 'ha',
                    quantity: 2.1705
                  }
                },
                {
                  code: 'UPL1',
                  description: 'Moderate livestock grazing on moorland',
                  durationYears: 1,
                  paymentRates: 2000,
                  annualPaymentPence: 4341,
                  eligible: {
                    unit: 'ha',
                    quantity: 2.1705
                  },
                  appliedFor: {
                    unit: 'ha',
                    quantity: 2.1705
                  }
                }
              ]
            }
          ],
          agreement: [
            {
              code: 'CMOR1',
              description: 'Assess moorland and produce a written record',
              durationYears: 1,
              paymentRates: 27200,
              annualPaymentPence: 27200
            }
          ]
        }
      }
    }
  }
  const url = `${browser.options.testAPIEndPointUrl}/api/test/queue-message`
  console.debug('Create agreement request URL:', url)
  console.debug(
    'Create agreement request body:',
    JSON.stringify(requestBody, null, 2)
  )
  const headers = {
    Accept: 'application/json',
    'Accept-Encoding': '*'
  }
  if (process.env.USER_TOKEN) {
    headers['x-api-key'] = process.env.USER_TOKEN
  }
  try {
    const response = await request(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })
    const raw = await response.body.text()
    console.debug('Raw response:', raw)

    let responseBody
    try {
      responseBody = JSON.parse(raw)
    } catch {
      console.error('Response was not JSON, raw body:', raw)
      throw new Error(`Expected JSON but got: ${raw.slice(0, 200)}`)
    }
    if (response.statusCode !== 200) {
      console.error('Create agreement failed with non-200 status')
      throw new Error(
        `Failed to create test agreement. Status: ${response.statusCode}, Response: ${JSON.stringify(responseBody)}`
      )
    }
    return responseBody.agreementData?.agreementNumber
  } catch (error) {
    console.error('Create agreement encountered an error:', error)
    throw error
  }
}
