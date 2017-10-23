import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { TEXT } from '../../nodeTypes'

export default class Text extends Component {
  static propTypes = {
    node: PropTypes.shape({
      text: PropTypes.string.isRequired,
      type: PropTypes.oneOf([TEXT])
    }).isRequired
  }

  render () {
    // eslint-disable-next-line react/no-danger
    return <span dangerouslySetInnerHTML={{ __html: this.props.node.text }} />
  }
}
