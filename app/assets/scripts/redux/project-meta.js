
'use script'
import get from 'lodash.get'

import { fetchJSON } from './utils'
import config from '../config'

// /////////////////////////////////////////////////////////////////////////////
// Actions
// /////////////////////////////////////////////////////////////////////////////

export const REQUEST_PROJ_META = 'REQUEST_PROJ_META'
export const RECEIVE_PROJ_META = 'RECEIVE_PROJ_META'
export const INVALIDATE_PROJ_META = 'INVALIDATE_PROJ_META'

export function invalidateProjectMeta (id) {
  return { type: INVALIDATE_PROJ_META, id }
}

export function requestProjectMeta (id) {
  return { type: REQUEST_PROJ_META, id }
}

export function receiveProjectMeta (id, data, error = null) {
  return { type: RECEIVE_PROJ_META, id, data, error, receivedAt: Date.now() }
}

export function fetchProjectMeta (id) {
  return async function (dispatch, getState) {
    const pMeta = get(getState(), ['projectMeta', id], null)
    if (pMeta && pMeta.fetched && !pMeta.error) {
      return dispatch(receiveProjectMeta(id, pMeta.data))
    }

    dispatch(requestProjectMeta(id))

    try {
      const res = await fetchJSON(`${config.baseurl}/assets/content/projects/${id}/index.json`)
      return dispatch(receiveProjectMeta(id, res))
    } catch (error) {
      return dispatch(receiveProjectMeta(id, null, error))
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
    case INVALIDATE_PROJ_META:
      const {[action.id]: _, ...rest} = state
      return rest
    case REQUEST_PROJ_META:
      return {
        ...state,
        [action.id]: {
          fetching: true,
          fetched: false,
          data: {}
        }
      }
    case RECEIVE_PROJ_META:
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

      state = { ...state, [action.id]: st }
      break
  }
  return state
}
