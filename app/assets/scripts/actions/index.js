import fetch from 'isomorphic-fetch'
import { safeLoadFront } from 'yaml-front-matter'

import config from '../config'

export const REQUEST_PAGE = 'REQUEST_PAGE'
export const RECEIVE_PAGE = 'RECEIVE_PAGE'
export const INVALIDATE_PAGE = 'INVALIDATE_PAGE'

// Pages (includes projects as well since the're static)
export function invalidatePage (id) {
  return { type: INVALIDATE_PAGE, id }
}

export function requestPage (id) {
  return { type: REQUEST_PAGE, id }
}

export function receivePage (id, data, error = null) {
  return { type: RECEIVE_PAGE, id, data, error, receivedAt: Date.now() }
}

export function fetchPage (what, id) {
  const key = `${what}-${id}`
  return async function (dispatch, getState) {
    const pageState = getState().staticPages[key]
    if (pageState && pageState.fetched && !pageState.error) {
      return dispatch(receivePage(key, pageState.data))
    }

    dispatch(requestPage(key))

    try {
      const url = what === 'project'
        ? `${config.baseurl}/assets/content/projects/${id}/index.md`
        : `${config.baseurl}/assets/content/pages/${id}.md`
      const response = await fetch(url)
      if (response.status >= 400) throw new Error(response.statusText)

      const content = await response.text()
      const yaml = safeLoadFront(content)

      return dispatch(receivePage(key, yaml))
    } catch (error) {
      console.log('error', error)
      return dispatch(receivePage(key, null, error))
    }
  }
}

//
// Projects Index

export const REQUEST_PROJ_IDX = 'REQUEST_PROJ_IDX'
export const RECEIVE_PROJ_IDX = 'RECEIVE_PROJ_IDX'
export const INVALIDATE_PROJ_IDX = 'INVALIDATE_PROJ_IDX'

export function invalidateProjectIndex () {
  return { type: INVALIDATE_PROJ_IDX }
}

export function requestProjectIndex () {
  return { type: REQUEST_PROJ_IDX }
}

export function receiveProjectIndex (data, error = null) {
  return { type: RECEIVE_PROJ_IDX, data, error, receivedAt: Date.now() }
}

export function fetchProjectIndex () {
  return async function (dispatch, getState) {
    const pageState = getState().projectIndex
    if (pageState && pageState.fetched && !pageState.error) {
      return dispatch(receiveProjectIndex(pageState.data))
    }

    dispatch(requestProjectIndex())

    try {
      const res = await fetchJSON(`${config.baseurl}/assets/content/projects.json`)
      return dispatch(receiveProjectIndex(res))
    } catch (error) {
      return dispatch(receiveProjectIndex(null, error))
    }
  }
}

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
