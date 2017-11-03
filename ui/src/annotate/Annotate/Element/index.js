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

export function isTextNode (el) {
  return el.nodeType === Node.TEXT_NODE
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
  debugger
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
  debugger
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

  highlightNode (highlightDef) {
    if (['UL', 'OL', 'TABLE'].includes(this.props.element.tagName)) { return }
    if (highlightDef.anchorOffset || highlightDef.focusOffset) {
      const anchorIndex = findIndex(this.childNodes, (n) => n.isEqualNode(highlightDef.anchorNode))
      const focusIndex = findIndex(this.childNodes, (n) => n.isEqualNode(highlightDef.focusNode))
      debugger
      this.childNodes = update(this.childNodes,
        {
          $splice: splitNodes(this.childNodes, anchorIndex, focusIndex, highlightDef)
        }
      )
      this.setState({ highlight: 'some' })
    } else {
      this.setState({ highlight: 'all' })
    }
  }

  clearHighlight () {
    if (['UL', 'OL', 'TABLE'].includes(this.props.element.tagName)) { return }
    const index = findIndex(this.childNodes, (n) => n.nodeType === undefined)
    const toChange = this.childNodes.filter((n) => n.nodeType === undefined)
    if (index >= 0) {
      const tc = toChange.map((n) => n.props.children).join('')
      this.childNodes = update(this.childNodes, {
        $splice: [[index, toChange.length, document.createTextNode(tc)]]
      })
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
