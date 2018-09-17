
'use script'
import get from 'lodash.get'

import { fetchJSON } from './utils'
import config from '../config'

// /////////////////////////////////////////////////////////////////////////////
// Actions
// /////////////////////////////////////////////////////////////////////////////

export const REQUEST_PROJ_RESULTS = 'REQUEST_PROJ_RESULTS'
export const RECEIVE_PROJ_RESULTS = 'RECEIVE_PROJ_RESULTS'
export const INVALIDATE_PROJ_RESULTS = 'INVALIDATE_PROJ_RESULTS'

export function invalidateProjectResults (key) {
  return { type: INVALIDATE_PROJ_RESULTS, key }
}

export function requestProjectResults (key) {
  return { type: REQUEST_PROJ_RESULTS, key }
}

export function receiveProjectResults (key, data, error = null) {
  return { type: RECEIVE_PROJ_RESULTS, key, data, error, receivedAt: Date.now() }
}

export function fetchProjectResults (projId, scId) {
  return async function (dispatch, getState) {
    const stateKey = `${projId}-${scId}`
    const pRes = get(getState(), ['projectResults', stateKey], null)
    if (pRes && pRes.fetched && !pRes.error) {
      return dispatch(receiveProjectResults(stateKey, pRes.data))
    }

    dispatch(requestProjectResults(stateKey))

    try {
      const res = await fetchJSON(`${config.baseurl}/assets/content/projects/${projId}/results-sc-${scId}.json`)
      return dispatch(receiveProjectResults(stateKey, res))
    } catch (error) {
      return dispatch(receiveProjectResults(stateKey, null, error))
    }
  }
}

// /////////////////////////////////////////////////////////////////////////////
// Reducer
// /////////////////////////////////////////////////////////////////////////////

const initialState = {
  // projectId: {
  //   fetching: false,
  //   fetched: false,
  //   data: {}
  // }
}

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case INVALIDATE_PROJ_RESULTS:
      const {[action.key]: _, ...rest} = state
      return rest
    case REQUEST_PROJ_RESULTS:
      return {
        ...state,
        [action.key]: {
          fetching: true,
          fetched: false,
          data: {}
        }
      }
    case RECEIVE_PROJ_RESULTS:
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

      state = { ...state, [action.key]: st }
      break
  }
  return state
}
