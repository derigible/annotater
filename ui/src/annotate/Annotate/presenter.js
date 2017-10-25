import React, { Component } from 'react'
import PropTypes from 'prop-types'

import * as nodeTypes from '../nodeTypes'

import Selection from './Selection'
import Text from './Text'
import Highlight from './Highlight'
import ErrorNode from './ErrorNode'

export default class Annotate extends Component {
  static propTypes = {
    addNode: PropTypes.func.isRequired,
    makeSelection: PropTypes.func.isRequired,
    removeSelection: PropTypes.func.isRequired,
    nodes: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        range: PropTypes.arrayOf(PropTypes.number).isRequired,
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
      case nodeTypes.SELECTION:
        return <Selection key={`selection_node_${node.id}`} node={node} />
      case nodeTypes.HIGHLIGHT:
        return <Highlight key={`text_node_${node.id}`} node={node} />
      default:
        return <ErrorNode key={`highlight_node_${node.id}`} node={node} />
    }
  }

  checkSelected = () => {
    const selection = window.getSelection()
    this.props.makeSelection(selection.anchorOffset, selection.focusOffset)
  }

  render () {
    return (
      <div
        onBlur={this.checkSelected}
        onMouseUp={this.checkSelected}
        onKeyUp={this.checkSelected}
        onTouchEnd={this.checkSelected}
      >
        {this.props.nodes.map((node) => Annotate.renderNode(node))}
      </div>
    )
  }
}
