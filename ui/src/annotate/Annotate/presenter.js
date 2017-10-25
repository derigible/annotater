import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SortedMap from 'collections/sorted-map'
import SortedSet from 'collections/sorted-set'

import ScreenReaderContent from '@instructure/ui-core/lib/components/ScreenReaderContent'

import { nodeDefinition } from '../../react/customPropTypes'
import * as nodeTypes from '../nodeTypes'

import Node from './Node'

export default class Annotate extends Component {
  static propTypes = {
    // addNode: PropTypes.func.isRequired,
    // removeNode: PropTypes.func.isRequired,
    nodes: PropTypes.arrayOf(nodeDefinition).isRequired,
    text: PropTypes.string.isRequired
  }

  static renderNode (node) {
    return <Node key={`node_${node.id}`} text={node.text} types={Annotate.getTypes(node.definitionNodes)} />
  }

  static getDefinitionNodes (range, nodes) {
    const definitionNodes = []
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (node.range[0] <= range[0] && node.range[1] >= range[1]) {
        definitionNodes.push(node)
      } else if (node.range[0] > range[0]) {
        return definitionNodes // short cicruit - none of the nodes after this are in range
      }
    }
    return definitionNodes
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
    this.nodeMap = new SortedMap()
    this.state = { selection: {} }
  }

  componentWillMount () {
    const { nodes, ranges } = Annotate.getSortedNodesAndRanges(this.props.nodes)
    for (let i = 0; i < ranges.length; i++) {
      const range = [ranges[i], ranges[++i]]

      const definitionNodes = Annotate.getDefinitionNodes(range, nodes)
      this.nodeMap.set(range[0], this.createNode(range, definitionNodes))
    }
  }

  componentWillUpdate (nextProps, nextState) {
    const { selection } = this.state
    const newSelection = nextState.selection
    if (nextProps.nodes.length !== this.props.nodes.length) {
      // Need to do something here
    } else if (selection.startOffset !== newSelection.startOffset || selection.endOffset !== newSelection.endOffset) { // will never have highlight when creating new node
      // remove old node selection

      // find closest start offset to split the node
      const startNodeKey = this.getClosestStartOffset(newSelection)
      // find closest end offset to possibly split the node
      const endNodeKey = this.getClosestEndOffsetNodeKey(newSelection)
      if (startNodeKey !== endNodeKey) {
        this.splitNode(startNodeKey, newSelection.startOffset)
        this.splitNode(endNodeKey, newSelection.endOffset)
      } else {
        this.splitNode(startNodeKey, newSelection.startOffset)
        // the new startOffset has now been created as a node, we will
        // need to split that node to account for the unhighlighted portion
        this.splitNode(newSelection.startOffset, newSelection.endOffset)
      }
    }
  }

  getClosestStartOffset (startOffset) {
    const keys = Array.from(this.nodeMap.keys()) // we key on the start offset
    let prev = keys[0]
    // TODO: O(N) time. Can do better (possible performance issue)
    for (let i = 1; i < this.nodeMap.length; i++) {
      if (keys[i] > startOffset) {
        return prev
      }
      prev = keys[i]
    }
    return prev
  }

  getClosestEndOffsetNodeKey (endOffset) {
    const values = Array.from(this.nodeMap.values())
    let prev = values[0]
    // TODO: O(N) time. Can do better (possible performance issue)
    for (let i = 1; i < this.nodeMap.length; i++) {
      // if endOffset is less than the nodes endoffset but greater than the id
      // (startoffset of the node) then return node id
      if (values[i].range[1] > endOffset && endOffset > values[i].id) {
        return values[i].id
      }
      prev = values[i]
    }
    return prev.id
  }

  splitNode (nodeKey, splitOffset, changeOnRight = false) {
    const toSplit = this.nodeMap.get(nodeKey)

    let leftNodeDefinitions = toSplit.definitionNodes
    if (!changeOnRight) {
      leftNodeDefinitions = leftNodeDefinitions.concat([{ type: nodeTypes.SELECTION }])
    }
    const leftNode = this.createNode([nodeKey, splitOffset], leftNodeDefinitions)

    let rightNodeDefinitions = toSplit.definitionNodes
    if (changeOnRight) {
      rightNodeDefinitions = rightNodeDefinitions.concat([{ type: nodeTypes.SELECTION }])
    }
    const rightNode = this.createNode([splitOffset, toSplit.range[1]], rightNodeDefinitions)

    this.nodeMap.set(nodeKey, leftNode)
    this.nodeMap.set(splitOffset, rightNode)
  }

  checkSelected = () => {
    const selection = window.getSelection()
    this.setState({ selection: { startOffset: selection.anchorOffset, endOffset: selection.focusOffset } })
  }

  createNode = (range, definitionNodes) => {
    const node = {
      id: range[0],
      range,
      text: this.props.text.substring(...range),
      definitionNodes
    }
    node.uiNode = Annotate.renderNode(node)
    return node
  }

  renderNodes () {
    return this.nodeMap.map((node) => node.uiNode)
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
