'use script'

export async function fetchJSON (url, options) {
  try {
    const response = await fetch(url, options)
    console.log('url', url);
    const json = await response.json()
    console.log('json', json);
    return json
  } catch (error) {
    console.log('fetchJSON error', error)
    throw error
  }
}
