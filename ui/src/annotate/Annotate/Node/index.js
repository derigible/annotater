import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import Text from '@instructure/ui-core/lib/components/Text'
import themeable from '@instructure/ui-themeable'

import * as nodeTypes from '../../nodeTypes'

import styles from './styles.css'
import theme from './theme'

@themeable(theme, styles)
export default class Node extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    types: PropTypes.arrayOf(PropTypes.oneOf(Object.values(nodeTypes))).isRequired
  }

  getClassNames () {
    console.log(this.props.types.includes(nodeTypes.SELECTION))
    return classnames({
      [styles.selection]: this.props.types.includes(nodeTypes.SELECTION)
    })
  }

  render () {
    return (
      <Text>
        <span className={this.getClassNames()}>
          {this.props.text}
        </span>
      </Text>
    )
  }
}
