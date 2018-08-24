'use script'

import { REQUEST_PAGE, RECEIVE_PAGE, INVALIDATE_PAGE } from '../actions'

const initialState = {
  // pageId: {
  //   fetching: false,
  //   fetched: false,
  //   data: {}
  // }
}

export default function reducer (state = initialState, action) {
  switch (action.type) {
    case INVALIDATE_PAGE:
      const {[action.id]: _, ...rest} = state
      return rest
    case REQUEST_PAGE:
      return {
        ...state,
        [action.id]: {
          fetching: true,
          fetched: false,
          data: {}
        }
      }
    case RECEIVE_PAGE:
      state = {
        ...state,
        [action.id]: {
          fetching: false,
          fetched: true,
          data: {}
        }
      }

      if (action.error) {
        state[action.id].error = action.error
      } else {
        state[action.id].data = action.data
      }
      break
  }
  return state
}
