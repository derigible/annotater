import React, { Component } from 'react'
import PropTypes from 'prop-types'
import themeable from '@instructure/ui-themeable'

import Heading from '@instructure/ui-core/lib/components/Heading'

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
      <div id="content" className={styles.container} role="main">
        <Heading as="h1" margin="small none none large">
          Annotate
          <img
            alt="all the things!"
            src="https://static4.fjcdn.com/comments/Gimme+all+the+things+_464338a07596440b218174c6b3afd9d0.png"
            width="32px"
            height="32px"
          />
        </Heading>
        {this.props.children}
      </div>
    )
  }
}
