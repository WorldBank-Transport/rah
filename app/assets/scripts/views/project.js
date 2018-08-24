'use strict'
import React, { Fragment } from 'react'
import { PropTypes as T } from 'prop-types'
import { connect } from 'react-redux'
import get from 'lodash.get'
import Markdown from 'react-markdown'
import formatDate from 'date-fns/format'

import { environment, baseurl } from '../config'
import { fetchPage } from '../actions'
import countries from '../utils/countries'

import App from './app'
import UhOh from './uhoh'
import Share from '../components/share'

class Project extends React.Component {
  componentDidMount () {
    this.props.fetchPage('project', this.props.match.params.id)
  }

  renderDetails () {
    const date = this.props.project.data.date
    const country = get(this.props.project.data, 'country', '')
    const topics = get(this.props.project.data, 'topics', [])
    const authors = get(this.props.project.data, 'authors', [])

    const ctr = get(countries.find(c => c.code === country.toUpperCase()), 'name', 'N/A')
    const tpc = topics.length ? topics.join(', ') : 'N/A'
    const aut = authors.length ? authors.join(', ') : 'N/A'

    return (
      <Fragment>
        <h1 className='inlay__title'>Details</h1>
        <dl className='inlay__details'>
          <dt>Date</dt>
          <dd>{formatDate(date, 'MMM Do YYYY')}</dd>
          <dt>Country</dt>
          <dd>{ctr}</dd>
          <dt>Topics</dt>
          <dd>{tpc}</dd>
          <dt>Authors</dt>
          <dd>{aut}</dd>
        </dl>
      </Fragment>
    )
  }

  render () {
    const {fetched, fetching, error, data} = this.props.project

    if (!fetched || fetching) return null

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
              <div className='inpage__actions'>
                <Share />
                <a href={`${baseurl}/assets/content/projects/${this.props.match.params.id}/results.zip`} className='ipa-download ipa-main' title='Download'><span>Download</span></a>
              </div>
            </div>
          </header>
          <div className='inpage__body'>
            <div className='inner inlay'>
              <figure className='inlay__media'>
                <figcaption>
                  Map will appear here.
                </figcaption>
              </figure>

              <aside className='inlay__aside'>
                {this.renderDetails()}
              </aside>

              <div className='inlay__main'>
                <h1 className='inlay__title'>Description</h1>
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
