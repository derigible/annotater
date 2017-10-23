import React, { Component } from 'react'
import PropTypes from 'prop-types'

import * as nodeTypes from '../nodeTypes'

import Text from './Text'
import Highlight from './Highlight'
import ErrorNode from './ErrorNode'

export default class Annotate extends Component {
  static propTypes = {
    nodes: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        type: PropTypes.oneOf(Object.values(nodeTypes))
      })
    ).isRequired
  }

  static renderNode (node) {
    switch (node.type) {
      case nodeTypes.TEXT:
        return <Text key={node.id} node={node} />
      case nodeTypes.HIGHLIGHT:
        return <Highlight key={node.id} node={node} />
      default:
        return <ErrorNode key={node.id} node={node} />
    }
  }

  render () {
    return (
      <div>
        {this.props.nodes.forEach((node) => this.renderNode(node))}
      </div>
    )
  }
}
