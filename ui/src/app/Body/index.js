import React, { Component } from 'react'
import PropTypes from 'prop-types'
import themeable from '@instructure/ui-themeable'

import styles from './styles.css'
import theme from './theme'

@themeable(theme, styles)
export default class App extends Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ])
  }

  static defaultProps = {
    children: null
  }
  render () {
    return (
      <div id="content" role="main">
        {this.props.children}
      </div>
    )
  }
}
