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
    const highlightDefs = []
    let anchorSet = false
    const selectionSameNode = sel.anchorNode.isSameNode(sel.focusNode)
    while (tw.nextNode()) {
      if (isTextNode(tw.currentNode)) {
        if (tw.previousNode().contains(tw.nextNode()) && !anchorSet) {
          highlightDefs[0].textNode = tw.currentNode
          highlightDefs[0].anchorOffset = startOffset
          anchorSet = true
        } else if (tw.nextNode() === null) {
          let hld
          if (highlightDefs.length > 0 && selectionSameNode) {
            hld = highlightDefs[highlightDefs.length - 1]
          } else {
            hld = { id: parseId(tw.currentNode) }
            highlightDefs.push(hld)
          }
          hld.textNode = tw.previousNode()
          hld.focusOffset = endOffset
          tw.nextNode()
        } else {
          tw.previousNode()
        }
      } else {
        highlightDefs.push({
          id: parseId(tw.currentNode)
        })
      }
    }
    console.log(highlightDefs)
    // Get common ancestor
    // Create TreeWalker from that ancestor that shows
    // only elements and filters them if not part of
    // selection.containsNode with partial containment
    // get id from each element and call Component method
    // to highlight

    // window.getSelection().removeAllRanges()
  }

  createAnnotation = (type, range, data) => {
    this.props.createAnnotation(type, range, data)
  }

  clearSelection = () => {
    this.state.selection.forEach((s) => {
      // eslint-disable-next-line no-param-reassign
      s.selection = { selected: false }
      s.component.clearSelection()
    })
    this.setState({ selection: [] })
  }

  registerComponentToId = (id, component) => {
    this.nodeMap.set(id, component)
  }

  renderNodes () {
    return this.topLevel.map((el) => {
      return (
        <Element
          key={el.id}
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
