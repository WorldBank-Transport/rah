'use strict'
import React from 'react'
import { PropTypes as T } from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

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
                <h1 className='inpage__title'>Catalog</h1>
              </div>
            </div>
          </header>
          <div className='inpage__body'>
            <div className='inner'>
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
