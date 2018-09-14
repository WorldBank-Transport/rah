'use strict'
import { combineReducers } from 'redux'

import staticPages from './static-page'
import projectIndex from './project-index'

export const reducers = {
  projectIndex,
  staticPages
}

export default combineReducers(reducers)
