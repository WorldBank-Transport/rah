'use strict'
import React, { Fragment } from 'react'
import { PropTypes as T } from 'prop-types'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import formatDate from 'date-fns/format'
import compareDateAsc from 'date-fns/compare_asc'
import c from 'classnames'
import { parse, stringify } from 'qs'
import get from 'lodash.get'

import { environment } from '../config'
import { fetchProjectIndex } from '../redux/project-index'
import countries from '../utils/countries'

import App from './app'
import Dropdown from '../components/dropdown'

class Home extends React.Component {
  constructor (props) {
    super(props)
    this.pageSize = 9

    this.onFilterChange = this.onFilterChange.bind(this)
    this.onLoadMoreClick = this.onLoadMoreClick.bind(this)

    this.state = {
      page: this.getPage(),
      activeFilters: this.getActiveFilters()
    }
  }

  componentDidMount () {
    this.props.fetchProjectIndex()
  }

  componentDidUpdate (prev) {
    // Did the search query change? Sync history.
    if (this.props.location.search !== prev.location.search) {
      this.setState({
        ...this.state,
        page: this.getPage(),
        activeFilters: this.getActiveFilters()
      })
    }
  }

  getPage () {
    const query = parse(this.props.location.search.substring(1))
    const page = parseInt(get(query, 'page', 1))
    return isNaN(page) || page < 1 ? 1 : page
  }

  getActiveFilters () {
    const query = parse(this.props.location.search.substring(1))

    return {
      year: get(query, 'year', null),
      topic: get(query, 'topic', null),
      country: get(query, 'country', null)
    }
  }

  computeQueryString () {
    return stringify({
      // Aesthetics: do not show page if it's 1.
      page: this.state.page > 1 ? this.state.page : null,
      ...this.state.activeFilters
    }, { skipNulls: true })
  }

  onFilterChange (what, value) {
    this.setState({
      page: 1,
      activeFilters: {
        ...this.state.activeFilters,
        [what]: value
      }
    }, () => {
      this.props.history.push({
        search: this.computeQueryString()
      })
    })
  }

  onLoadMoreClick () {
    this.setState({
      page: this.state.page + 1
    }, () => {
      this.props.history.push({
        search: this.computeQueryString()
      })
    })
  }

  render () {
    const {fetching, fetched, data, error} = this.props.projects
    const projectsToShow = this.pageSize * this.state.page

    if (!fetched || fetching) return null

    if (error) {
      return (
        <App>
          <section className='inpage inpage--uhoh'>
            <header className='inpage__header'>
              <div className='inner'>
                <div className='inpage__headline'>
                  <h1 className='inpage__title'>An error occurred</h1>
                </div>
              </div>
            </header>
            <div className='inpage__body'>
              <div className='inner'>
                <div className='prose'>
                  <p>An error occurred trying to reach the server. Please try again later.</p>
                  <p>In the mean time visit the <Link to='/about' title='Visit about page'>about page</Link> for more information or if the error persists <a href='mailto:email@domain.com' title='Get in touch'>contact us</a> about the problem.</p>
                </div>  
              </div>
            </div>
          </section>
        </App>
      )
    }

    const { year, country, topic } = this.state.activeFilters
    const projectsFiltered = data.index
      .filter(proj => {
        const projYear = formatDate(proj.date, 'YYYY')
        if (year && projYear !== year) return false
        if (country && proj.country !== country.toUpperCase()) return false
        if (topic && ((proj.topics && proj.topics.indexOf(topic) === -1) || !proj.topics)) return false
        return true
      })

    const projsRenderable = projectsFiltered
      .sort((a, b) => compareDateAsc(a.date, b.date))
      .slice(0, projectsToShow)

    const loadDisabled = projsRenderable.length >= projectsFiltered.length

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
                    <FilterMenu
                      years={this.props.projects.data.filters.years}
                      countries={this.props.projects.data.filters.countries}
                      topics={this.props.projects.data.filters.topics}
                      active={this.state.activeFilters}
                      onFilterChange={this.onFilterChange}
                    />
                    <p className='filter-summary'>Showing {Math.min(projectsToShow, projectsFiltered.length)} of {projectsFiltered.length} results</p>
                  </nav>
                </header>

                <div className='projects-sec__body'>
                  {projsRenderable.length ? (
                    <ol className='projects-card-list'>
                      {projsRenderable.map(project => (
                        <li key={project.id}>
                          <ProjectCard
                            id={project.id}
                            title={project.title}
                            excerpt={project.excerpt}
                            date={project.date}
                            country={project.country}
                            topics={project.topics}
                          />
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className='projects-sec__no-results'>
                      <p>No projects match your criteria. Please refine your filters.</p>
                    </div>
                  )}
                </div>

                <footer className='projects-sec__footer'>
                  <button type='button' title='Load more projects' onClick={this.onLoadMoreClick} className={c('button button--large button--semi-fluid button--primary-raised-dark', {'disabled': loadDisabled})} disabled={loadDisabled}>Load more</button>
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
    location: T.object,
    history: T.object,
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

//
//

const dropKlass = (active, check) => c('drop__menu-item', {'drop__menu-item--active': active === check})
class FilterMenu extends React.PureComponent {
  onFilterChange (what, value, e) {
    e.preventDefault()

    this.props.onFilterChange(what, value)
  }

  renderYearDropdown () {
    const years = this.props.years.sort()
    const active = this.props.active.year || 'Any'

    return (
      <Fragment>
        <dt>Year</dt>
        <dd>
          <Dropdown
            className='filter-options'
            triggerClassName='button button--achromic drop__toggle drop__toggle--caret'
            triggerActiveClassName='button--active'
            triggerText={active}
            triggerTitle='Select a year'
            direction='down'
            alignment='left'>
            <ul className='drop__menu drop__menu--select'>
              <li><a href='#' className={dropKlass(active, 'Any')} onClick={this.onFilterChange.bind(this, 'year', null)} data-hook='dropdown:close'>Any</a></li>
              {years.map(year => <li key={year}><a href='#' className={dropKlass(active, year.toString())} onClick={this.onFilterChange.bind(this, 'year', year.toString())} data-hook='dropdown:close'>{year}</a></li>)}
            </ul>
          </Dropdown>
        </dd>
      </Fragment>
    )
  }

  renderCountryDropdown () {
    const ctrs = this.props.countries
      .map(c => countries.find(country => country.code === c.toUpperCase()))
      .sort((a, b) => a > b ? 1 : -1)

    const active = this.props.active.country || 'Any'

    return (
      <Fragment>
        <dt>Country</dt>
        <dd>
          <Dropdown
            className='filter-options'
            triggerClassName='button button--achromic drop__toggle drop__toggle--caret'
            triggerActiveClassName='button--active'
            triggerText={active}
            triggerTitle='Select a country'
            direction='down'
            alignment='left'>
            <ul className='drop__menu drop__menu--select'>
              <li><a href='#' className={dropKlass(active, 'Any')} onClick={this.onFilterChange.bind(this, 'country', null)} data-hook='dropdown:close'>Any</a></li>
              {ctrs.map(ctr => <li key={ctr.code}><a href='#' className={dropKlass(active, ctr.code)} onClick={this.onFilterChange.bind(this, 'country', ctr.code)} data-hook='dropdown:close'>{ctr.name}</a></li>)}
            </ul>
          </Dropdown>
        </dd>
      </Fragment>
    )
  }

  renderTopicDropdown () {
    const topics = this.props.topics
      .sort((a, b) => a > b ? 1 : -1)

    const active = this.props.active.topic || 'Any'

    return (
      <Fragment>
        <dt>Topic</dt>
        <dd>
          <Dropdown
            className='filter-options'
            triggerClassName='button button--achromic drop__toggle drop__toggle--caret'
            triggerActiveClassName='button--active'
            triggerText={active}
            triggerTitle='Select a topic'
            direction='down'
            alignment='left'>
            <ul className='drop__menu drop__menu--select'>
              <li><a href='#' className={dropKlass(active, 'Any')} onClick={this.onFilterChange.bind(this, 'topic', null)} data-hook='dropdown:close'>Any</a></li>
              {topics.map(topic => <li key={topic}><a href='#' className={dropKlass(active, topic)} onClick={this.onFilterChange.bind(this, 'topic', topic)} data-hook='dropdown:close'>{topic}</a></li>)}
            </ul>
          </Dropdown>
        </dd>
      </Fragment>
    )
  }

  render () {
    return (
      <dl className='filter-menu'>
        {this.props.years.length && this.renderYearDropdown()}
        {this.props.countries.length && this.renderCountryDropdown()}
        {this.props.topics.length && this.renderTopicDropdown()}
      </dl>
    )
  }
}

if (environment !== 'production') {
  FilterMenu.propTypes = {
    onFilterChange: T.func,
    years: T.array,
    countries: T.array,
    topics: T.array,
    active: T.object
  }
}

//
//
class ProjectCard extends React.PureComponent {
  render () {
    const {date, country, topics, id, title, excerpt} = this.props
    let subtitle = []

    if (date) {
      const formatted = formatDate(date, 'MMM Do YYYY')
      subtitle.push(formatted)
    }

    if (country) {
      const found = countries.find(c => c.code === country.toUpperCase())
      if (found) subtitle.push(found.name)
    }

    if (topics && topics.length) {
      if (topics.length > 1) {
        subtitle.push(`${topics[0]} (+${topics.length - 1})`)
      } else {
        subtitle.push(topics[0])
      }
    }

    return (
      <article className='project project--card card' id='project-1'>
        <div className='card__contents'>
          <header className='card__header'>
            <div className='card__headline'>
              <Link to={`/projects/${id}`} title='View project' className='link-wrapper'>
                <h1 className='card__title'>{title}</h1>
              </Link>
              <p className='card__subtitle'>{subtitle.join(', ')}</p>
            </div>
          </header>
          <div className='card__body'>
            <div className='card__summary'>
              <p>{excerpt || 'No description'}</p>
            </div>
          </div>
        </div>
      </article>
    )
  }
}

if (environment !== 'production') {
  ProjectCard.propTypes = {
    date: T.string,
    country: T.string,
    topics: T.array,
    id: T.string,
    title: T.string,
    excerpt: T.string
  }
}
