import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SortedMap from 'collections/sorted-map'
import SortedSet from 'collections/sorted-set'

import ScreenReaderContent from '@instructure/ui-core/lib/components/ScreenReaderContent'

import { nodeDefinition } from '../../react/customPropTypes'

import Node from './Node'

export default class Annotate extends Component {
  static propTypes = {
    addNode: PropTypes.func.isRequired,
    removeNode: PropTypes.func.isRequired,
    nodes: PropTypes.arrayOf(nodeDefinition).isRequired,
    text: PropTypes.string.isRequired
  }

  static renderNode (node) {
    return <Node key={`node_${node.id}`} text={node.text} types={Annotate.getTypes(node.defintionNodes)} />
  }

  static nodesEqual (nodeA, nodeB) {
    return nodeA.range[0] === nodeB.range[0] && nodeA.range[1] === nodeB.range[1]
  }

  static compareNodes (nodeA, nodeB) {
    return nodeA.range[0] - nodeB.range[0]
  }

  static getDefinitionNodes (range, nodes) {
    const defintionNodes = []
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (node.range[0] <= range[0] && node.range[1] >= range[1]) {
        defintionNodes.push(node)
      } else if (node.range[0] > range[0]) {
        return defintionNodes // short cicruit - none of the nodes after this are in range
      }
    }
    return defintionNodes
  }

  static getTypes (nodes) {
    return nodes.map((n) => n.type)
  }

  static getSortedNodesAndRanges (unsortedNodes) {
    const nodes = unsortedNodes.sort((nA, nB) => nA.range[0] - nB.range[0])
    let ranges = nodes.reduce((memo, n) => (memo.concat(n.range)), [])
    ranges = new SortedSet(ranges).toArray()
    return { nodes, ranges }
  }

  constructor (props) {
    super(props)
    this.nodeMap = new SortedMap([], Annotate.nodesEqual, Annotate.compareNodes)
  }

  componentWillMount () {
    const { nodes, ranges } = Annotate.getSortedNodesAndRanges(this.props.nodes)
    for (let i = 0; i < ranges.length; i++) {
      const range = [ranges[i], ranges[++i]]
      this.nodeMap.add(range[0], this.createNode(range, nodes))
    }
  }

  createNode = (range, nodes) => {
    const defintionNodes = Annotate.getDefinitionNodes(range, nodes)
    const node = {
      id: range[0],
      range,
      text: this.props.text.substring(...range),
      defintionNodes
    }
    node.uiNode = Annotate.renderNode(node)
    return node
  }

  checkSelected = () => {
    const selection = window.getSelection()
    console.log(selection)
  }

  renderNodes () {
    return this.nodeMap.map((_key, node) => node.uiNode)
  }

  render () {
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        onBlur={this.checkSelected}
        onMouseUp={this.checkSelected}
        onKeyUp={this.checkSelected}
        onTouchEnd={this.checkSelected}
      >
        <ScreenReaderContent>Select some text to bring up annotation options</ScreenReaderContent>
        {this.renderNodes()}
      </div>
    )
  }
}
