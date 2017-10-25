import React, { Component } from 'react'
import PropTypes from 'prop-types'

import TextFormat from '@instructure/ui-core/lib/components/Text'

import * as nodeTypes from '../../nodeTypes'

export default class Node extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    types: PropTypes.arrayOf(PropTypes.oneOf(Object.values(nodeTypes))).isRequired
  }

  render () {
    console.log(this.props.types)
    return (
      <TextFormat>
        {this.props.text}
      </TextFormat>
    )
  }
}
