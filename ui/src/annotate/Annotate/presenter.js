import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SortedMap from 'collections/sorted-map'
import SortedSet from 'collections/sorted-set'
import findIndex from 'lodash/findIndex'
import update from 'immutability-helper'

import ScreenReaderContent from '@instructure/ui-core/lib/components/ScreenReaderContent'

import { nodeDefinition } from '../../react/customPropTypes'
import * as nodeTypes from '../nodeTypes'

import Node from './Node'

export default class Annotate extends Component {
  static propTypes = {
    createAnnotation: PropTypes.func.isRequired,
    nodes: PropTypes.arrayOf(nodeDefinition).isRequired,
    text: PropTypes.string.isRequired
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

  static getNormalizeOffset (selection) {
    const startOffset = parseInt(selection.baseNode.parentNode.attributes['data-id'].value, 10)
    const endNode = selection.focusNode.parentNode.attributes['data-id']
    return {
      normalizeStartOffset: startOffset,
      // if endNode is not defined, means drag ended on the end of the same node as start (may
      // not be true when there are multiple nodetypes within the selection, will need to
      // revisit)
      normalizeEndOffset: endNode ? parseInt(endNode.value, 10) : (selection.baseNode.length - 1 || 1)
    }
  }

  static createSelectionNode () {
    return {
      id: nodeTypes.SELECTION,
      range: [],
      type: nodeTypes.SELECTION
    }
  }

  constructor (props) {
    super(props)
    this.nodeMap = new SortedMap()
    this.state = { selection: {} }
  }

  componentWillMount () {
    this.computeNodes(this.props.nodes)
  }

  componentWillUpdate (nextProps, nextState) {
    const { selection } = this.state
    const newSelection = nextState.selection
    if (nextProps.nodes.length !== this.props.nodes.length) {
      this.nodeMap.clear()
      this.computeNodes(nextProps.nodes)
    } else if (selection.startOffset !== newSelection.startOffset || selection.endOffset !== newSelection.endOffset) { // will never have highlight when creating new node
      this.mergeNodes(selection)
      this.splitNodes(newSelection)
      window.getSelection().removeAllRanges()
      // TODO: filter out all nodes in nodemap caught in between
      // this range offset and only render the select node
      setTimeout(() => {
        const component = this[`node_${newSelection.startOffset}`]
        component && component.showTypeMenu()
      })
    }
  }

  getClosestStartOffset (startOffset) {
    const keys = Array.from(this.nodeMap.keys()) // we key on the start offset
    let prev = keys[0]
    // TODO: O(N) time. Can do better (possible performance issue)
    for (let i = 1; i < this.nodeMap.length; i++) {
      if (keys[i] >= startOffset) {
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

  setRef = (id) => (node) => {
    this[`node_${id}`] = node
  }

  computeNodes (peristedNodes) {
    const { nodes, ranges } = Annotate.getSortedNodesAndRanges(peristedNodes)
    console.log(nodes, ranges)
    for (let i = 1; i < ranges.length; i++) {
      const startOffset = ranges[i - 1]
      const endOffset = ranges[i]
      const range = [startOffset, endOffset]

      const definitionNodes = Annotate.getDefinitionNodes(range, nodes)
      this.nodeMap.set(range[0], this.createNode(range, definitionNodes))
    }
  }

  mergeNodes (selection, newStartOffset) {
    if (selection.startOffset === undefined) { return } // no selection has been made previously
    // remove old node selection by merging with node to the left
    const originalStart = this.getClosestStartOffset(selection.startOffset)
    const originalEnd = this.getClosestStartOffset(selection.endOffset)
    this.mergeNode(selection.endOffset, originalEnd)
    this.mergeNode(selection.startOffset, originalStart)
    this.nodeMap.delete(selection.endOffset)
    if (selection.startOffset !== 0) { this.nodeMap.delete(selection.startOffset) }
  }

  mergeNode (nodeKey, originalNodeKey) {
    const dyingNode = this.nodeMap.get(nodeKey)
    const survivingNode = this.nodeMap.get(originalNodeKey)
    this.nodeMap.set(
      originalNodeKey,
      this.createNode([originalNodeKey, dyingNode.range[1]], survivingNode.definitionNodes)
    )
  }

  splitNodes (newSelection) {
    if (newSelection.startOffset === undefined) { return } // selection was removed on this update
    // find closest start offset to split/merge the node
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
      this.splitNode(newSelection.startOffset, newSelection.endOffset, false, true)
    }
  }

  splitNode (nodeKey, splitOffset, selectionOnRight = true, removeSelection = false) {
    const toSplit = this.nodeMap.get(nodeKey)

    let leftNodeDefinitions = toSplit.definitionNodes
    // If removeSelection is true, means that the node on left already has selection
    if (!selectionOnRight && !removeSelection) {
      leftNodeDefinitions = leftNodeDefinitions.concat([Annotate.createSelectionNode()])
    }
    const leftNode = this.createNode([nodeKey, splitOffset], leftNodeDefinitions)

    let rightNodeDefinitions = toSplit.definitionNodes
    if (selectionOnRight) {
      rightNodeDefinitions = rightNodeDefinitions.concat([Annotate.createSelectionNode()])
    } else if (removeSelection) {
      const index = findIndex(rightNodeDefinitions, (n) => n.type === nodeTypes.SELECTION)
      rightNodeDefinitions = update(rightNodeDefinitions, { $splice: [[index, 1]] })
    }
    const rightNode = this.createNode([splitOffset, toSplit.range[1]], rightNodeDefinitions)

    this.nodeMap.set(nodeKey, leftNode)
    this.nodeMap.set(splitOffset, rightNode)
  }

  checkSelected = () => {
    const selection = window.getSelection()
    const { normalizeStartOffset, normalizeEndOffset } = Annotate.getNormalizeOffset(selection)
    const startOffset = selection.anchorOffset + normalizeStartOffset
    const endOffset = selection.focusOffset + normalizeEndOffset
    if (startOffset === endOffset) {
      // Click with no selection, remove selection
      this.setState({ selection: {} })
    } else if (startOffset > endOffset) {
      this.setState({ selection: { startOffset: endOffset, endOffset: startOffset } })
    } else {
      this.setState({ selection: { startOffset, endOffset } })
    }
  }

  createNode = (range, definitionNodes) => {
    const node = {
      id: range[0],
      range,
      text: this.props.text.substring(...range),
      definitionNodes
    }
    node.uiNode = this.renderNode(node)
    return node
  }

  cancelSelection = () => {
    this.setState({ selection: {} })
  }

  renderNodes () {
    return this.nodeMap.map((node) => node.uiNode)
  }

  renderNode (node) {
    return (
      <Node
        key={`node_${node.id}`}
        ref={this.setRef(node.id)}
        cancelSelection={this.cancelSelection}
        createAnnotation={this.props.createAnnotation}
        node={node}
      />
    )
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
