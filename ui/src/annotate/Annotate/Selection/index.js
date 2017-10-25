import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { SELECTION } from '../../nodeTypes'

export default class Selection extends Component {
  static propTypes = {
    node: PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      type: PropTypes.oneOf([SELECTION])
    }).isRequired
  }

  render () {
    return (
      <span style={{ backgroundColor: 'red' }}>
        {this.props.node.text}
      </span>
    )
  }
}
