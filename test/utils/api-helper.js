import fs from 'fs/promises'
import Wreck from '@hapi/wreck'

export let generatedClientRef = ''

export async function createApplication(
  environment,
  grantName = 'frps-private-beta'
) {
  const payloadPath = `test/payloads/${grantName}.json`

  // Detect if running on local machine (Mac) vs CDP Portal
  // On local machine: use ephemeral-protected gateway and include x-api-key
  // In CDP Portal: use direct fg-gas-backend URL without x-api-key
  const isRunningLocally = !!process.env.X_API_KEY
  const gasUrl = isRunningLocally
    ? `https://ephemeral-protected.api.${environment}.cdp-int.defra.cloud/fg-gas-backend/grants/`
    : `https://fg-gas-backend.${environment}.cdp-int.defra.cloud/grants/`

  const endpoint = `${grantName}/applications`

  const payloadData = await fs.readFile(payloadPath, 'utf-8')
  let payload = JSON.parse(payloadData)

  payload = requestPayload(payload)
  const url = `${gasUrl}${endpoint}`

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.GAS_KEY}`
  }

  // Add x-api-key header when running on local machine (value refreshes daily)
  if (isRunningLocally) {
    headers['x-api-key'] = process.env.X_API_KEY
  }

  const wreck = Wreck.defaults({ headers })

  try {
    console.log('========== API REQUEST START ==========')
    console.log(`URL: ${url}`)
    console.log(`Environment: ${environment}`)
    console.log(`Running locally: ${isRunningLocally}`)
    console.log(`Client reference: ${generatedClientRef}`)
    console.log(
      `Headers:`,
      JSON.stringify(
        {
          ...headers,
          Authorization: headers.Authorization ? 'Bearer ***' : undefined,
          'x-api-key': headers['x-api-key'] ? '***' : undefined
        },
        null,
        2
      )
    )
    console.log(`Request payload:`, JSON.stringify(payload, null, 2))
    console.log('=======================================')

    const { res, payload: responsePayload } = await wreck.post(url, {
      payload: JSON.stringify(payload)
    })

    console.log('========== API RESPONSE START ==========')
    console.log(`Status Code: ${res.statusCode}`)
    console.log(`Status Message: ${res.statusMessage}`)
    console.log(`Response Headers:`, JSON.stringify(res.headers, null, 2))

    let responseBody = null
    const responseText = responsePayload?.toString?.().trim()
    console.log(`Response Body (raw):`, responseText || '(empty)')

    if (responseText) {
      try {
        responseBody = JSON.parse(responseText)
        console.log(
          `Response Body (parsed):`,
          JSON.stringify(responseBody, null, 2)
        )
      } catch (err) {
        console.warn('Response body is not valid JSON:', err.message)
      }
    }

    console.log('========================================')
    console.log(`Application created successfully`)
    console.log(`Application reference: ${generatedClientRef}`)

    return {
      statusCode: res.statusCode,
      body: responseBody,
      clientRef: generatedClientRef
    }
  } catch (error) {
    console.error('API Request Failed!')
    console.error(`URL: ${url}`)
    console.error(`Environment: ${environment}`)
    console.error(`Status Code: ${error.output?.statusCode || 'N/A'}`)
    console.error(`Error: ${error.message}`)

    // Try to get the actual error response body
    if (error.data) {
      const dataStr = Buffer.isBuffer(error.data)
        ? error.data.toString()
        : JSON.stringify(error.data)
      console.error(`Response Body:`, dataStr)
      try {
        const errorBody =
          typeof error.data === 'string' ? JSON.parse(error.data) : error.data
        console.error(
          `Parsed Error Details:`,
          JSON.stringify(errorBody, null, 2)
        )
      } catch (e) {
        // Response is not JSON
      }
    }
    if (error.output?.payload) {
      console.error(
        `Error Payload:`,
        JSON.stringify(error.output.payload, null, 2)
      )
    }
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
