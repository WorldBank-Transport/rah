'use script'
import { fetchJSON } from './utils'
import config from '../config'

// /////////////////////////////////////////////////////////////////////////////
// Actions
// /////////////////////////////////////////////////////////////////////////////

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

// /////////////////////////////////////////////////////////////////////////////
// Reducer
// /////////////////////////////////////////////////////////////////////////////

const initialState = {
  fetching: false,
  fetched: false,
  data: {}
}

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case INVALIDATE_PROJ_IDX:
      return initialState
    case REQUEST_PROJ_IDX:
      return {
        ...state,
        fetching: true,
        fetched: false
      }
    case RECEIVE_PROJ_IDX:
      let st = {
        fetching: false,
        fetched: true,
        receivedAt: action.receivedAt,
        data: {},
        error: null
      }

      if (action.error) {
        st.error = action.error
      } else {
        st.data = action.data
      }

      state = st
      break
  }
  return state
}
