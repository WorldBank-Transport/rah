'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { NavLink } from 'react-router-dom'

import { environment } from '../config'

export default class PageHeader extends React.PureComponent {
  render () {
    return (
      <header className='page__header'>
        <div className='inner'>
          <div className='page__headline'>
            <h1 className='page__title'><NavLink to='/' title='View homepage'><span>Rural Accessibility Hub</span></NavLink></h1>
            <p className='page__subtitle'>Powered by Rural Accessibility Map</p>
          </div>
          <nav className='page__prime-nav nav' role='navigation'>
            <div className='nav__block nav__block--global'>
              <ul className='nav-global-menu'>
                <li><a title='Visit page' href='#' className='nav-global-menu__link nav-global-menu__link--active'><span>Catalog</span></a></li>
                <li><a title='Visit page' href='#' className='nav-global-menu__link'><span>About</span></a></li>
              </ul>
            </div>
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
