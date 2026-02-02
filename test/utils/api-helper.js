import fs from 'fs/promises'
import Wreck from '@hapi/wreck'

export let generatedClientRef = ''

export async function createApplication(
  environment,
  grantName = 'frps-private-beta'
) {
  const payloadPath = `test/payloads/${grantName}.json`
  const gasUrl = `https://fg-gas-backend.${environment}.cdp-int.defra.cloud/grants/`
  const endpoint = `${grantName}/applications`

  const payloadData = await fs.readFile(payloadPath, 'utf-8')
  let payload = JSON.parse(payloadData)

  payload = requestPayload(payload)
  const url = `${gasUrl}${endpoint}`

  const wreck = Wreck.defaults({
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GAS_KEY}`
    }
  })

  try {
    const { res, payload: responsePayload } = await wreck.post(url, {
      payload: JSON.stringify(payload)
    })

    let responseBody = null

    const responseText = responsePayload?.toString?.().trim()
    if (responseText) {
      try {
        responseBody = JSON.parse(responseText)
      } catch (err) {
        console.warn('Response body is not valid JSON:', err)
      }
    }

    console.log(`Application created with reference: ${generatedClientRef}`)
    return {
      statusCode: res.statusCode,
      body: responseBody,
      clientRef: generatedClientRef
    }
  } catch (error) {
    console.error('API Request Failed:', error)
    throw error
  }
}

export function generateRandomClientRef() {
  generatedClientRef = 'client' + Math.random().toString(36).substring(2, 10)
  return generatedClientRef
}

function getCurrentDatetimeISO() {
  return new Date().toISOString()
}

function generateFRN() {
  return Math.floor(1_000_000_000 + Math.random() * 9_000_000_000).toString()
}

function requestPayload(payload) {
  const stringifies = JSON.stringify(payload)

  const replaced = stringifies
    .replace(/{{random_client_ref}}/g, generateRandomClientRef())
    .replace(/{{current_datetime}}/g, getCurrentDatetimeISO())
    .replace(/{{random_frn}}/g, generateFRN())

  return JSON.parse(replaced)
}
