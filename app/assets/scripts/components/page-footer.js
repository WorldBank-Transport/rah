'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import NavGlobalMenu from './nav-global-menu'

import { environment, appTitle } from '../config'

export default class PageFooter extends React.PureComponent {
  render () {
    return (
      <footer className='page__footer' role='contentinfo'>
        <div className='inner'>
          <nav className='page__footer-nav' role='navigation'>
            <NavGlobalMenu />
          </nav>
          <div className='footer-credits'>
            <p><strong>{appTitle}</strong> <small>2018 © <a href='http://www.worldbank.org/' title='Visit website'>The World Bank Group</a></small></p>
          </div>
        </div>
      </footer>
    )
  }
}

if (environment !== 'production') {
  PageFooter.propTypes = {
    location: T.object
  }
}
