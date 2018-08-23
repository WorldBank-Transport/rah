'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Dropdown from '../components/dropdown'

import { environment } from '../config'
import { fetchProjectIndex } from '../actions'

import App from './app'

class Home extends React.Component {
  componentDidMount () {
    this.props.fetchProjectIndex()
  }

  render () {
    const {fetching, fetched, data} = this.props.projects

    if (!fetched || fetching) return null

    return (
      <App>
        <section className='inpage inpage--hub'>
          <header className='inpage__header'>
            <div className='inner'>
              <div className='inpage__headline'>
                <h1 className='inpage__title'>Welcome</h1>
              </div>
            </div>
          </header>
          <div className='inpage__body'>
            <div className='inner'>

              <section className='projects-sec'>
                <header className='projects-sec__header'>
                  <h2 className='projects-sec__title'>Projects</h2>
                  <nav className='inpage__sec-nav'>
                    <dl className='filter-menu'>
                      <dt>Year</dt>
                      <dd>
                        <Dropdown
                          className='filter-options'
                          triggerClassName='button button--achromic drop__toggle drop__toggle--caret'
                          triggerActiveClassName='button--active'
                          triggerText='Select'
                          triggerTitle='Select a year'
                          direction='down'
                          alignment='left'>
                          <ul className='drop__menu drop__menu--select'>
                            <li><Link to='#' className='drop__menu-item' activeClassName='drop__menu-item--active'>Any</Link></li>
                            <li><Link to='#' className='drop__menu-item' activeClassName='drop__menu-item--active'>2018</Link></li>
                            <li><Link to='#' className='drop__menu-item' activeClassName='drop__menu-item--active'>2018</Link></li>
                          </ul>
                        </Dropdown>
                      </dd>
                      <dt>Country</dt>
                      <dd>
                        <Dropdown
                          className='filter-options'
                          triggerClassName='button button--achromic drop__toggle drop__toggle--caret'
                          triggerActiveClassName='button--active'
                          triggerText='Select'
                          triggerTitle='Select a country'
                          direction='down'
                          alignment='left'>
                          <ul className='drop__menu drop__menu--select'>
                            <li><Link to='#' className='drop__menu-item' activeClassName='drop__menu-item--active'>Any</Link></li>
                            <li><Link to='#' className='drop__menu-item' activeClassName='drop__menu-item--active'>China</Link></li>
                            <li><Link to='#' className='drop__menu-item' activeClassName='drop__menu-item--active'>India</Link></li>
                          </ul>
                        </Dropdown>
                      </dd>
                      <dt>Topic</dt>
                      <dd>
                        <Dropdown
                          className='filter-options'
                          triggerClassName='button button--achromic drop__toggle drop__toggle--caret'
                          triggerActiveClassName='button--active'
                          triggerText='Select'
                          triggerTitle='Select a topic'
                          direction='down'
                          alignment='left'>
                          <ul className='drop__menu drop__menu--select'>
                            <li><Link to='#' className='drop__menu-item' activeClassName='drop__menu-item--active'>Any</Link></li>
                            <li><Link to='#' className='drop__menu-item' activeClassName='drop__menu-item--active'>Education</Link></li>
                            <li><Link to='#' className='drop__menu-item' activeClassName='drop__menu-item--active'>Health</Link></li>
                          </ul>
                        </Dropdown>
                      </dd>
                    </dl>
                    <p className='filter-summary'>Showing 9 of 39 results</p>
                  </nav>
                </header>

                <div className='projects-sec__body'>
                  <ol className='projects-card-list'>
                    {data.index.map(project => (
                      <li key={project.id}>
                        <article className='project project--card card' id='project-1'>
                          <div className='card__contents'>
                            <header className='card__header'>
                              <div className='card__headline'>
                                <Link to={`/projects/${project.id}`} title='View project' className='link-wrapper'>
                                  <h1 className='card__title'>{project.title}</h1>
                                </Link>
                                <p className='card__subtitle'>Date, Countries, Topics</p>
                              </div>
                            </header>
                            <div className='card__body'>
                              <div className='card__summary'>
                                <p>{project.description || 'No description'}</p>
                              </div>
                            </div>
                          </div>
                        </article>
                      </li>
                    ))}
                  </ol>
                </div>

                <footer className='projects-sec__footer'>
                  <button type='button' title='Load more projects' className='button button--large button--semi-fluid button--primary-raised-dark'>Load more</button>
                </footer>
              </section>
            </div>
          </div>
        </section>
      </App>
    )
  }
}

if (environment !== 'production') {
  Home.propTypes = {
    fetchProjectIndex: T.func,
    projects: T.object
  }
}

function mapStateToProps (state) {
  return {
    projects: state.projectIndex
  }
}

function dispatcher (dispatch) {
  return {
    fetchProjectIndex: (...args) => dispatch(fetchProjectIndex(...args))
  }
}

export default connect(mapStateToProps, dispatcher)(Home)
