'use strict'
import { combineReducers } from 'redux'

import staticPages from './static-page'
import projectIndex from './project-index'
import projectMeta from './project-meta'
import projectPoi from './project-poi'
import projectResults from './project-results'

export const reducers = {
  projectIndex,
  staticPages,
  projectMeta,
  projectPoi,
  projectResults
}

export default combineReducers(reducers)
