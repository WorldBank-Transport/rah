'use strict'
import React from 'react'
import { NavLink } from 'react-router-dom'

class NavGlobalMenu extends React.Component {
  render () {
    return (
      <div className='nav__block nav__block--global'>
        <ul className='nav-global-menu'>
          <li><NavLink to='/' title='View all projects' className='nav-global-menu__link' activeClassName='nav-global-menu__link--active'><span>Projects</span></NavLink></li>
          <li><NavLink to='/about' title='View about page' className='nav-global-menu__link' activeClassName='nav-global-menu__link--active'><span>About</span></NavLink></li>
        </ul>
      </div>
    )
  }
}

export default NavGlobalMenu
