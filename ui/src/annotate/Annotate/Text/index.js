import React, { Component } from 'react'
import PropTypes from 'prop-types'

import TextFormat from '@instructure/ui-core/lib/components/Text'

import { TEXT } from '../../nodeTypes'

export default class Text extends Component {
  static propTypes = {
    node: PropTypes.shape({
      text: PropTypes.string.isRequired,
      type: PropTypes.oneOf([TEXT])
    }).isRequired
  }

  render () {
    return (
      <TextFormat>
        {this.props.node.text}
      </TextFormat>
    )
  }
}
