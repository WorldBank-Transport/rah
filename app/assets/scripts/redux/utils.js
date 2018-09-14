'use script'

export async function fetchJSON (url, options) {
  try {
    const response = await fetch(url, options)
    const body = await response.text()

    try {
      return JSON.parse(body)
    } catch (error) {
      console.log('json parse error', error)
      error.responseBody = body
      throw error
    }
  } catch (error) {
    console.log('fetchJSON error', error)
    throw error
  }
}
