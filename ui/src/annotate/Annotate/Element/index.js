import React, { Component } from 'react'
import PropTypes from 'prop-types'
import camelCase from 'lodash/camelCase'
import findIndex from 'lodash/findIndex'
import update from 'immutability-helper'

export function parseId (el) {
  if (isTextNode(el)) {
    return parseId(el.parentElement.closest('[data-id]'))
  }
  return el.dataset && el.dataset.id
}

export function precedesNode (pointNode, testNode) {
  // eslint-disable-next-line no-bitwise
  return (pointNode.compareDocumentPosition(testNode) & Node.DOCUMENT_POSITION_PRECEDING) === 0
}

export function isTextNode (el) {
  return el.nodeType === Node.TEXT_NODE
}

function containsNode (toCheck, node) {
  if (toCheck.isEqualNode(node)) { return true }
  if (toCheck.childNodes.length > 0) {
    return Array.from(toCheck.childNodes).some((n) => containsNode(n, node))
  }
  return false
}

function getStyles (style) {
  const inlineStyles = {}
  for (let i = 0; i < style.length; i++) {
    const styleName = style.item(i)
    inlineStyles[camelCase(styleName)] = style.getPropertyValue(styleName)
  }
  return inlineStyles
}

function styleSelection (shouldStyle) {
  return shouldStyle ? { backgroundColor: 'blue' } : {}
}

function splitNode (node, highlightDef, index) {
  if (highlightDef.anchorOffset && highlightDef.focusOffset === undefined) {
    return [
      <span key={`${index}anchor_left`}>{node.textContent.substring(0, highlightDef.anchorOffset)}</span>,
      <span key={`${index}anchor_right`}style={styleSelection('true')} >
        {node.textContent.substring(highlightDef.anchorOffset, node.textContent.length)}
      </span>
    ]
  } else if (highlightDef.anchorOffset === undefined && highlightDef.focusOffset) {
    return [
      <span key={`${index}focus_left`} style={styleSelection(true)}>{node.textContent.substring(0, highlightDef.focusOffset)}</span>,
      <span key={`${index}focus_right`}>{node.textContent.substring(highlightDef.focusOffset, node.textContent.length)}</span>
    ]
  }
  return [
    <span key="left">{node.textContent.substring(0, highlightDef.anchorOffset)}</span>,
    <span key="right" style={styleSelection(true)}>{node.textContent.substring(highlightDef.anchorOffset, highlightDef.focusOffset)}</span>,
    <span key="remainder">{node.textContent.substring(highlightDef.focusOffset, node.textContent.length)}</span>
  ]
}

function splitNodes (nodes, anchorIndex, focusIndex, highlightDef) {
  if ((anchorIndex === focusIndex) || (anchorIndex > -1 && focusIndex === -1)) {
    return [[anchorIndex, 1, ...splitNode(nodes[anchorIndex], highlightDef, anchorIndex)]]
  } else if (anchorIndex > -1 && focusIndex > -1) {
    return [
      [anchorIndex, 1, ...splitNode(nodes[anchorIndex], { anchorOffset: highlightDef.anchorOffset }, anchorIndex)],
      [focusIndex + 1, 1, ...splitNode(nodes[focusIndex], { focusOffset: highlightDef.focusOffset }, focusIndex)]
    ]
  }
  return [[focusIndex, 1, ...splitNode(nodes[focusIndex], highlightDef, focusIndex)]]
}

export default class Element extends Component {
  static propTypes = {
    clearSelection: PropTypes.func.isRequired,
    element: PropTypes.shape({
      tagName: PropTypes.string.isRequired,
      childNodes: PropTypes.object.isRequired,
      dataset: PropTypes.object.isRequired,
      style: PropTypes.object.isRequired
    }).isRequired,
    getElementDefinition: PropTypes.func.isRequired,
    registerComponentToId: PropTypes.func.isRequired
  }

  state = {
    highlight: 'none'
  }

  componentWillMount () {
    if (!isTextNode(this.props.element)) {
      this.props.registerComponentToId(parseId(this.props.element), this)
    }
    this.childNodes = Array.from(this.props.element.childNodes)
  }

  highlightNode (highlightDef, anchorNode, focusNode) {
    if (['UL', 'OL', 'TABLE'].includes(this.props.element.tagName)) { return }
    if (highlightDef.anchorOffset || highlightDef.focusOffset) {
      const anchorIndex = findIndex(this.childNodes, (n) => n.isEqualNode(highlightDef.anchorNode))
      const focusIndex = findIndex(this.childNodes, (n) => n.isEqualNode(highlightDef.focusNode))
      this.childNodes = update(this.childNodes,
        {
          $splice: splitNodes(this.childNodes, anchorIndex, focusIndex, highlightDef)
        }
      )
      this.setState({ highlight: 'some' })
    } else if (anchorNode) {
      const index = findIndex(this.childNodes, (n) => containsNode(n, anchorNode))
      for (let i = index + 1; i < this.childNodes.length; i++) {
        const n = this.childNodes[i]
      }
    } else {
      this.setState({ highlight: 'all' })
    }
  }

  clearHighlight () {
    if (['UL', 'OL', 'TABLE'].includes(this.props.element.tagName)) { return }
    // Find the react components in the list (n.nodeType === undefined)
    const anchorIndex = findIndex(this.childNodes, (n) => n.nodeType === undefined)
    const toChange = this.childNodes.filter((n) => n.nodeType === undefined)
    if (anchorIndex >= 0) {
      if (toChange.length > 3) {
        const anchorTc = [toChange[0], toChange[1]].map((n) => n.props.children).join('')
        const focusTc = [toChange[2], toChange[3]].map((n) => n.props.children).join('')
        const focusIndex = findIndex(this.childNodes, (n) => toChange[2] === n)
        this.childNodes = update(this.childNodes, {
          $splice: [
            [anchorIndex, 2, document.createTextNode(anchorTc)],
            [focusIndex - 1, 2, document.createTextNode(focusTc)]
          ]
        })
      } else if (toChange.length === 2) {
        const tc = toChange.map((n) => n.props.children).join('')
        this.childNodes = update(this.childNodes, {
          $splice: [[anchorIndex, 2, document.createTextNode(tc)]]
        })
      } else {
        const tc = toChange.map((n) => n.props.children).join('')
        this.childNodes = update(this.childNodes, {
          $splice: [[anchorIndex, 3, document.createTextNode(tc)]]
        })
      }
    }
    this.setState({ highlight: 'none' })
  }

  renderNode (node) {
    const { clearSelection, getElementDefinition, registerComponentToId } = this.props
    if (isTextNode(node)) {
      return node.textContent
    } else if (node.tagName) {
      return (
        <Element
          key={parseId(node)}
          clearSelection={clearSelection}
          getElementDefinition={getElementDefinition}
          registerComponentToId={registerComponentToId}
          element={node}
        />
      )
    }
    return node
  }

  render () {
    const { element } = this.props
    const Node = element.tagName.toLowerCase()

    return (
      <Node
        data-id={parseId(this.props.element)}
        style={{ ...getStyles(element.style), ...styleSelection(this.state.highlight === 'all') }}
      >
        {this.childNodes.map((n) => this.renderNode(n))}
      </Node>
    )
  }
}
