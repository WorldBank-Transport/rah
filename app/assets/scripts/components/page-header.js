'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { Link } from 'react-router-dom'
import NavGlobalMenu from './nav-global-menu'

import { environment, appTitle, appSubtitle } from '../config'

export default class PageHeader extends React.PureComponent {
  render () {
    return (
      <header className='page__header'>
        <div className='inner'>
          <div className='page__headline'>
            <h1 className='page__title'><Link to='/' title='View homepage'><span>{appTitle}</span></Link></h1>
            <p className='page__subtitle'>{appSubtitle}</p>
          </div>
          <nav className='page__prime-nav nav' role='navigation'>
            <NavGlobalMenu />
          </nav>
        </div>
      </header>
    )
  }
}

if (environment !== 'production') {
  PageHeader.propTypes = {
    location: T.object
  }
}
