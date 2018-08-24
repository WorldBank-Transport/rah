'use strict'
import React from 'react'

import App from './app'
import Share from '../components/share'

export default class About extends React.Component {
  render () {
    return (
      <App className='page--about'>
        <article className='inpage inpage--about'>
          <header className='inpage__header'>
            <div className='inner'>
              <div className='inpage__headline'>
                <h1 className='inpage__title'>About</h1>
              </div>
              <div className='inpage__actions'>
                <Share />
              </div>
            </div>
          </header>
          <div className='inpage__body'>
            <div className='inner'>
              <div className='prose prose--responsive'>
                <p>The rural accessibility hub is...</p>
              </div>
            </div>
          </div>
        </article>
      </App>
    )
  }
}
