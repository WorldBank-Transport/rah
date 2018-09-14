
'use script'
import get from 'lodash.get'

import { fetchJSON } from './utils'
import config from '../config'

// /////////////////////////////////////////////////////////////////////////////
// Actions
// /////////////////////////////////////////////////////////////////////////////

export const REQUEST_PROJ_POI = 'REQUEST_PROJ_POI'
export const RECEIVE_PROJ_POI = 'RECEIVE_PROJ_POI'
export const INVALIDATE_PROJ_POI = 'INVALIDATE_PROJ_POI'

export function invalidateProjectPoi (key) {
  return { type: INVALIDATE_PROJ_POI, key }
}

export function requestProjectPoi (key) {
  return { type: REQUEST_PROJ_POI, key }
}

export function receiveProjectPoi (key, data, error = null) {
  return { type: RECEIVE_PROJ_POI, key, data, error, receivedAt: Date.now() }
}

export function fetchProjectPoi (projId, poiKey) {
  return async function (dispatch, getState) {
    const stateKey = `${projId}-${poiKey}`
    const pRes = get(getState(), ['projectPoi', stateKey], null)
    if (pRes && pRes.fetched && !pRes.error) {
      return dispatch(receiveProjectPoi(stateKey, pRes.data))
    }

    dispatch(requestProjectPoi(stateKey))

    try {
      const res = await fetchJSON(`${config.baseurl}/assets/content/projects/${projId}/poi-${poiKey}.json`)
      return dispatch(receiveProjectPoi(stateKey, res))
    } catch (error) {
      return dispatch(receiveProjectPoi(stateKey, null, error))
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
    case INVALIDATE_PROJ_POI:
      const {[action.id]: _, ...rest} = state
      return rest
    case REQUEST_PROJ_POI:
      return {
        ...state,
        [action.id]: {
          fetching: true,
          fetched: false,
          data: {}
        }
      }
    case RECEIVE_PROJ_POI:
      let st = {
        fetching: false,
        fetched: true,
        data: {},
        error: null
      }

      if (action.error) {
        st.error = action.error
      } else {
        st.data = action.data
      }

      state = { ...state, [action.id]: st }
      break
  }
  return state
}
