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
import Share from '../components/share'

class StaticPage extends React.Component {
  componentDidMount () {
    this.props.fetchPage('page', this.props.match.params.page)
  }

  render () {
    const {error, data} = this.props.page
    if (error) {
      return <UhOh />
    }

    return (
      <App>
        <article className='inpage inpage--static'>
          <header className='inpage__header'>
            <div className='inner'>
              <div className='inpage__headline'>
                <h1 className='inpage__title'>{data.title}</h1>
              </div>
              <div className='inpage__actions'>
                <Share />
              </div>
            </div>
          </header>
          <div className='inpage__body'>
            <div className='inner'>
              <div className='prose'>
                <Markdown source={data.__content} />
              </div>
            </div>
          </div>
        </article>
      </App>
    )
  }
}

if (environment !== 'production') {
  StaticPage.propTypes = {
    fetchPage: T.func,
    match: T.object,
    page: T.object
  }
}

function mapStateToProps (state, props) {
  return {
    page: get(state.staticPages, `page-${props.match.params.page}`, {fetched: false, fetching: false, data: {}})
  }
}

function dispatcher (dispatch) {
  return {
    fetchPage: (...args) => dispatch(fetchPage(...args))
  }
}

export default connect(mapStateToProps, dispatcher)(StaticPage)
