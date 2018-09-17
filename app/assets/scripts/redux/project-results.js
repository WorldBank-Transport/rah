
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

      // To correctly convert the faux feature to an actual feature collection
      // we need the data from the project meta. Throw an error if it is
      // not available.
      const projMetaData = get(getState(), ['projectMeta', projId, 'data'], null)
      if (!projMetaData) throw new Error('Project meta data is not available in the state')

      // Create key matrix to map poi and population faux keys to actual ones.
      const keyMatrix = {
        ...projMetaData.poiTypes.reduce((acc, o) => ({...acc, [o.prop]: o.key}), {}),
        ...projMetaData.popIndicators.reduce((acc, o) => ({...acc, [o.prop]: o.key}), {})
      }

      const feat = {
        'type': 'FeatureCollection',
        'features': res.map(f => {
          const {i, n, c, ...data} = f
          const props = Object.keys(data).reduce((acc, k) => ({
            ...acc, [keyMatrix[k]]: data[k]
          }), {})

          return {
            'type': 'Feature',
            'properties': { id: i, name: n, ...props },
            'geometry': {
              'type': 'Point',
              'coordinates': c
            }
          }
        })
      }
      return dispatch(receiveProjectResults(stateKey, feat))
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
