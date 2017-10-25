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
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    types: PropTypes.arrayOf(PropTypes.oneOf(Object.values(nodeTypes))).isRequired
  }

  getClassNames () {
    return classnames({
      [styles.selection]: this.props.types.includes(nodeTypes.SELECTION)
    })
  }

  // add data-id to get the internal node detail so we can normalize range offsets
  render () {
    return (
      <Text>
        <span data-id={this.props.id} className={this.getClassNames()}>
          {this.props.text}
        </span>
      </Text>
    )
  }
}
