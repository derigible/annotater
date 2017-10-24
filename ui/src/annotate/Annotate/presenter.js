import React, { Component } from 'react'
import PropTypes from 'prop-types'

import * as nodeTypes from '../nodeTypes'

import Text from './Text'
import Highlight from './Highlight'
import ErrorNode from './ErrorNode'

export default class Annotate extends Component {
  static propTypes = {
    addNode: PropTypes.func.isRequired,
    nodes: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        type: PropTypes.oneOf(Object.values(nodeTypes)),
        data: PropTypes.object // specific to the node type
      })
    ).isRequired
  }

  static renderNode (node) {
    switch (node.type) {
      case nodeTypes.TEXT:
        return <Text key={`text_node_${node.id}`} node={node} />
      case nodeTypes.HIGHLIGHT:
        return <Highlight key={`text_node_${node.id}`} node={node} />
      default:
        return <ErrorNode key={`highlight_node_${node.id}`} node={node} />
    }
  }

  render () {
    return (
      <div>
        {this.props.nodes.map((node) => Annotate.renderNode(node))}
      </div>
    )
  }
}
