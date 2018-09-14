'use strict'
import React, { Fragment } from 'react'
import { PropTypes as T } from 'prop-types'
import { connect } from 'react-redux'
import get from 'lodash.get'
import Markdown from 'react-markdown'
import formatDate from 'date-fns/format'
import c from 'classnames'

import { environment, baseurl } from '../config'
import { showGlobalLoading, hideGlobalLoading } from '../components/global-loading'
import { fetchPage } from '../redux/static-page'
import { fetchProjectMeta } from '../redux/project-meta'
import { fetchProjectPoi } from '../redux/project-poi'
import { fetchProjectResults } from '../redux/project-results'
import countries from '../utils/countries'

import App from './app'
import UhOh from './uhoh'
import Share from '../components/share'
import Dropdown from '../components/dropdown'

class Project extends React.Component {
  constructor (props) {
    super(props)

    this.onFilterChange = this.onFilterChange.bind(this)

    this.state = {
      activePoiType: null,
      activePopInd: null,
      activeScenario: null
    }
  }

  async componentWillMount () {
    const projId = this.props.match.params.id
    const {fetchPage, fetchProjectMeta, fetchProjectPoi, fetchProjectResults} = this.props
    // Fetch the page data.
    await fetchPage('project', projId)
    // Projects can be exported without mapped results.
    const hasResults = get(this.props.project, 'data.include_results', false)
    if (hasResults) {
      // The project has results. Fetch the meta data.
      await fetchProjectMeta(projId)
      const {error, data: {poiTypes, popIndicators, scenarios}} = this.props.projectMeta
      if (!error) {
        this.setState({
          activePoiType: poiTypes[0].key,
          activePopInd: popIndicators[0].key,
          activeScenario: scenarios[0].id
        })
        // No errors occurred, fetch the actual data.
        await Promise.all([
          fetchProjectPoi(projId, poiTypes[0].key),
          fetchProjectResults(projId, scenarios[0].id)
        ])
        hideGlobalLoading()
      } else {
        hideGlobalLoading()
      }
    } else {
      hideGlobalLoading()
    }
  }

  componentDidMount () {
    // We can't show the loading on the componentWillMount method, because the
    // DOM is not mounted and there is no loading component yet.
    showGlobalLoading()
  }

  onFilterChange (field, value, event) {
    event.preventDefault()

    // Avoid setting state when nothing changed.
    if (this.state[field] === value) return

    this.setState({[field]: value}, async () => {
      const projId = this.props.match.params.id
      showGlobalLoading()
      if (field === 'activePoiType') {
        await this.props.fetchProjectPoi(projId, value)
      } else if (field === 'activeScenario') {
        await this.props.fetchProjectResults(projId, value)
      }
      hideGlobalLoading()
    })
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

  renderNoResults () {
    return (
      <p>No results were exported for this project. Contact... </p>
    )
  }

  renderResultsBrowser () {
    const {fetched, fetching, error, data: {poiTypes, popIndicators, scenarios, bbox}} = this.props.projectMeta

    if (!fetched || fetching) return null

    if (fetched && error) return <p>An error occurred fetching the results. Try again</p>

    return (
      <Fragment>
        <FiltersBar
          onFilterChange={this.onFilterChange}
          activePopInd={this.state.activePopInd}
          activePoiType={this.state.activePoiType}
          activeScenario={this.state.activeScenario}
          popInd={popIndicators}
          poiTypes={poiTypes}
          scenarios={scenarios}
        />
      </Fragment>
    )
  }

  render () {
    const {fetched, fetching, error, data} = this.props.project

    if (!fetched || fetching) {
      return <App />
    }

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

              {data.include_results ? this.renderResultsBrowser() : this.renderNoResults()}

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
    fetchProjectMeta: T.func,
    fetchProjectPoi: T.func,
    fetchProjectResults: T.func,
    match: T.object,
    project: T.object,
    projectMeta: T.object
  }
}

function mapStateToProps (state, props) {
  return {
    project: get(state.staticPages, `project-${props.match.params.id}`, {fetched: false, fetching: false, data: {}}),
    projectMeta: get(state.projectMeta, props.match.params.id, {fetched: false, fetching: false, data: {}})
  }
}

function dispatcher (dispatch) {
  return {
    fetchPage: (...args) => dispatch(fetchPage(...args)),
    fetchProjectMeta: (...args) => dispatch(fetchProjectMeta(...args)),
    fetchProjectPoi: (...args) => dispatch(fetchProjectPoi(...args)),
    fetchProjectResults: (...args) => dispatch(fetchProjectResults(...args))
  }
}

export default connect(mapStateToProps, dispatcher)(Project)

class FiltersBar extends React.PureComponent {
  render () {
    const {
      onFilterChange,
      popInd,
      activePopInd,
      poiTypes,
      activePoiType,
      scenarios,
      activeScenario
    } = this.props

    let activePopIndLabel = popInd.find(o => o.key === activePopInd)
    activePopIndLabel = activePopIndLabel ? activePopIndLabel.label : 'N/A'

    let activePoiTypeLabel = poiTypes.find(o => o.key === activePoiType)
    activePoiTypeLabel = activePoiTypeLabel ? activePoiTypeLabel.label : 'N/A'

    let activeScenarioName = scenarios.find(o => o.id === activeScenario)
    activeScenarioName = activeScenarioName ? activeScenarioName.name : 'N/A'

    return (
      <nav className='inpage__sec-nav'>
        <dl className='filter-menu'>
          <FiltersBarItem
            onFilterChange={onFilterChange.bind(this, 'activePopInd')}
            title={'Population'}
            triggerText={activePopIndLabel}
            triggerTitle={'Change population'}
            items={popInd.map(o => ({...o, title: 'Select Population'}))}
            activeItem={activePopInd}
          />
          <FiltersBarItem
            onFilterChange={onFilterChange.bind(this, 'activePoiType')}
            title={'Point of interest'}
            triggerText={activePoiTypeLabel}
            triggerTitle={'Change point of interest'}
            items={poiTypes.map(o => ({...o, title: 'Select point of interest'}))}
            activeItem={activePoiType}
          />
        </dl>
        <dl className='filter-menu'>
          <FiltersBarItem
            onFilterChange={onFilterChange.bind(this, 'activeScenario')}
            title={'Scenario'}
            triggerText={activeScenarioName}
            triggerTitle={'Change scenario'}
            items={scenarios.map(o => ({key: o.id, label: o.name, title: 'Select scenario'}))}
            activeItem={activeScenario}
          />
        </dl>
      </nav>
    )
  }
}

if (environment !== 'production') {
  FiltersBar.propTypes = {
    onFilterChange: T.func,
    popInd: T.array,
    activePopInd: T.string,
    poiTypes: T.array,
    activePoiType: T.string,
    scenarios: T.array,
    activeScenario: T.number
  }
}

const FiltersBarItem = (props) => {
  const {
    onFilterChange,
    title,
    triggerText,
    triggerTitle,
    items,
    activeItem
  } = props

  return (
    <Fragment>
      <dt>{title}</dt>
      <dd>
        <Dropdown
          className='filter-options'
          triggerClassName='button button--achromic drop__toggle--caret'
          triggerActiveClassName='button--active'
          triggerText={triggerText}
          triggerTitle={triggerTitle}
          direction='down'
          alignment='left' >
          <ul className='drop__menu drop__menu--select' role='menu'>
            {items.map(o => (
              <li key={o.key}>
                <a
                  href='#'
                  title={o.title}
                  className={c('drop__menu-item', {'drop__menu-item--active': o.key === activeItem})}
                  data-hook='dropdown:close'
                  onClick={e => onFilterChange(o.key, e)} >
                  <span>{o.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </Dropdown>
      </dd>
    </Fragment>
  )
}

if (environment !== 'production') {
  FiltersBarItem.propTypes = {
    onFilterChange: T.func,
    title: T.string,
    triggerText: T.string,
    triggerTitle: T.string,
    items: T.array,
    activeItem: T.oneOfType([T.string, T.number])
  }
}
