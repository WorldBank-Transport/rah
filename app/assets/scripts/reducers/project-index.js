'use script'

import { REQUEST_PROJ_IDX, RECEIVE_PROJ_IDX, INVALIDATE_PROJ_IDX } from '../actions'

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
      state = {
        ...state,
        fetching: false,
        fetched: true
      }

      if (action.error) {
        state.error = action.error
      } else {
        state.data = action.data
      }
      break
  }
  return state
}
