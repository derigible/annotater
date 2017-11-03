import React, { Component } from 'react'
import PropTypes from 'prop-types'

import ScreenReaderContent from '@instructure/ui-core/lib/components/ScreenReaderContent'
import themeable from '@instructure/ui-themeable'
import * as nodeTypes from '../nodeTypes'

import Element, { parseId, isTextNode } from './Element'

import styles from './styles.css'
import theme from './theme'

function precedesNode (pointNode, testNode) {
  // eslint-disable-next-line no-bitwise
  return (pointNode.compareDocumentPosition(testNode) & Node.DOCUMENT_POSITION_PRECEDING) === 0
}

// TODO: 1) clipboard copy remove data attributes

@themeable(theme, styles)
export default class Annotate extends Component {
  static propTypes = {
    createAnnotation: PropTypes.func.isRequired,
    annotations: PropTypes.objectOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.oneOf(Object.values(nodeTypes)),
          range: PropTypes.arrayOf(PropTypes.number)
        })
      )
    ).isRequired,
    text: PropTypes.string.isRequired
  }

  constructor (props) {
    super(props)
    this.textContainer = document.createElement('div')
    this.nodeMap = new Map()
    this.topLevel = []
    this.state = { selection: [] }
  }

  componentWillMount () {
    this.textContainer.innerHTML = this.props.text
    this.textContainer.childNodes.forEach((n) => {
      this.topLevel.push(n)
    })
  }

  getElementDefinition = (id) => {
    return this.nodeMap.get(id)
  }

  checkSelected = () => {
    const sel = window.getSelection()
    // No selection was actually made or selection is being canceled
    if (sel.isCollapsed) {
      this.clearSelection()
      return
    }
    const inOrder = precedesNode(sel.anchorNode, sel.focusNode)
    const startOffset = inOrder ? sel.anchorOffset : sel.focusOffset
    const endOffset = inOrder ? sel.focusOffset : sel.anchorOffset

    // Get common ancestor
    // Create TreeWalker from that ancestor that shows
    // only elements and filters them if not part of
    // selection.containsNode with partial containment
    // get id from each element and call Component method
    // to highlight
    const commonAncestor = sel.getRangeAt(0).commonAncestorContainer
    const tw = document.createTreeWalker(
      commonAncestor,
      // eslint-disable-next-line no-bitwise
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (sel.containsNode(node, true)) {
            return NodeFilter.FILTER_ACCEPT
          }
          return NodeFilter.FILTER_REJECT
        }
      },
      false
    )

    const highlightDefs = new Map()
    const startNode = inOrder ? sel.anchorNode : sel.focusNode
    const endNode = inOrder ? sel.focusNode : sel.anchorNode
    const nodes = []
    do { nodes.push(tw.currentNode) } while (tw.nextNode())
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (isTextNode(node)) {
        if (node.isEqualNode(startNode)) {
          if (!highlightDefs.has(parseId(node)) > 0) {
            highlightDefs.set(parseId(node), { id: parseId(node) })
          }
          highlightDefs.get(parseId(node)).anchorNode = node
          highlightDefs.get(parseId(node)).anchorOffset = startOffset
        }
        if (node.isEqualNode(endNode)) {
          if (!highlightDefs.has(parseId(node)) > 0) {
            highlightDefs.set(parseId(node), { id: parseId(node) })
          }
          highlightDefs.get(parseId(node)).focusNode = node
          highlightDefs.get(parseId(node)).focusOffset = endOffset
        }
      } else {
        highlightDefs.set(parseId(node), { id: parseId(node) })
      }
    }

    highlightDefs.forEach((n, k) => {
      const node = this.nodeMap.get(k)
      node.highlightNode(n)
    })
    this.setState({ selection: highlightDefs })

    window.getSelection().removeAllRanges()
  }

  createAnnotation = (type, range, data) => {
    this.props.createAnnotation(type, range, data)
  }

  clearSelection = () => {
    this.state.selection.forEach((n, k) => {
      const node = this.nodeMap.get(k)
      node.clearHighlight()
    })
    this.setState({ selection: [] })
  }

  registerComponentToId = (id, component) => {
    this.nodeMap.set(id, component)
  }

  renderNodes () {
    return this.topLevel.filter((el) => !isTextNode(el)).map((el) => {
      return (
        <Element
          key={parseId(el)}
          clearSelection={this.clearSelection}
          element={el}
          getElementDefinition={this.getElementDefinition}
          registerComponentToId={this.registerComponentToId}
        />
      )
    })
  }

  render () {
    return (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        onBlur={this.checkSelected}
        onMouseUp={this.checkSelected}
        onKeyUp={this.checkSelected}
        onTouchEnd={this.checkSelected}
        className={styles.container}
      >
        <ScreenReaderContent>Select some text to bring up annotation options</ScreenReaderContent>
        {this.renderNodes()}
      </div>
    )
  }
}
