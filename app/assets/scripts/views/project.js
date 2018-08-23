'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { connect } from 'react-redux'
import get from 'lodash.get'
import Markdown from 'react-markdown'
import Dropdown from '../components/dropdown'
import Clipboard from 'clipboard'

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
    const url = window.location.toString()

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
                <Dropdown
                  className='share-menu'
                  triggerClassName='share-button'
                  triggerActiveClassName='button--active'
                  triggerText='Share'
                  triggerTitle='Toggle share options'
                  direction='down'
                  alignment='right' >

                  <h6 className='drop__title'>Share</h6>
                  <ul className='drop__menu drop__menu--iconified'>
                    <li><a href={`https://www.facebook.com/sharer/sharer.php?u=${url}`} className='drop__menu-item share-facebook' title='Share on Facebook' target='_blank'><span>Facebook</span></a></li>
                    <li><a href={`https://twitter.com/intent/tweet?url=${url}`} className='drop__menu-item share-twitter' title='Share on Twitter' target='_blank'><span>Twitter</span></a></li>
                  </ul>
                  <div className='drop__inset'>
                    <CopyField value={url} />
                  </div>

                </Dropdown>
                <a href='#' className='ipa-download ipa-main' title='Download'><span>Download</span></a>
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

// This needs to be a separate class because of the mount and unmount methods.
// The dropdown unmounts when closed and the refs would be lost otherwise.
class CopyField extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      copiedMsg: false
    }
    this.triggerEl = null
    this.copiedMsgTimeout = null
  }

  componentDidMount () {
    this.clipboard = new Clipboard(this.triggerEl, {
      text: () => this.props.value
    })

    this.clipboard.on('success', e => {
      this.setState({copiedMsg: true})
      this.copiedMsgTimeout = setTimeout(() => {
        this.setState({copiedMsg: false})
      }, 2000)
    })
  }

  componentWillUnmount () {
    this.clipboard.destroy()
    if (this.copiedMsgTimeout) clearTimeout(this.copiedMsgTimeout)
  }

  render () {
    const val = this.state.copiedMsg ? 'Copied!' : this.props.value
    return (
      <form action='#' className='form'>
        <div className='form__input-group'>
          <input id='site-url' name='site-url' className='form__control' type='text' readOnly value={val} />
          <button type='button' className='share-copy' title='Copy to clipboard' ref={el => { this.triggerEl = el }}><span>Copy to clipboard</span></button>
        </div>
      </form>
    )
  }
}

if (environment !== 'production') {
  CopyField.propTypes = {
    value: T.string
  }
}

export default connect(mapStateToProps, dispatcher)(Project)
