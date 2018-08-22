'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { connect } from 'react-redux'
import get from 'lodash.get'
import Markdown from 'react-markdown'

import { environment } from '../config'
import { fetchPage } from '../actions'

import App from './app'
import UhOh from './uhoh'

class Project extends React.Component {
  componentDidMount () {
    this.props.fetchPage('project', this.props.match.params.id)
  }

  render () {
    const {error, data} = this.props.project
    if (error) {
      return <UhOh />
    }

    return (
      <App>
        <article className='inpage inpage--project'>
          <header className='inpage__header'>
            <div className='inner'>
              <div className='inpage__headline'>
                <h1 className='inpage__title'>{data.title}</h1>
              </div>
            </div>
          </header>
          <div className='inpage__body'>
            <div className='inner inlay'>
              <aside className='inlay__aside'>
                <h1 className='inlay__title'>Details</h1>
                <dl className='inlay__details'>
                  <dt>Key 1</dt>
                  <dd>Value 1</dd>
                  <dt>Key 2</dt>
                  <dd>Value 2</dd>
                  <dt>Key 3</dt>
                  <dd>Value 3</dd>
                </dl>
              </aside>
              <div className='inlay__main'>
                <h1 className='inlay__title'>Details</h1>
                <div className='prose'>
                  <Markdown source={data.__content} />
                </div>
              </div>
            </div>
          </div>
        </article>
      </App>
    )
  }
}

if (environment !== 'production') {
  Project.propTypes = {
    fetchPage: T.func,
    match: T.object,
    project: T.object
  }
}

function mapStateToProps (state, props) {
  return {
    project: get(state.staticPages, `project-${props.match.params.id}`, {fetched: false, fetching: false, data: {}})
  }
}

function dispatcher (dispatch) {
  return {
    fetchPage: (...args) => dispatch(fetchPage(...args))
  }
}

export default connect(mapStateToProps, dispatcher)(Project)
