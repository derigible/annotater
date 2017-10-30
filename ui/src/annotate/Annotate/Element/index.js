import React, { Component } from 'react'
import PropTypes from 'prop-types'
import camelCase from 'lodash/camelCase'
import update from 'immutability-helper'

export function parseId (el) {
  return el.dataset && el.dataset.positionId && parseInt(el.dataset.positionId, 10)
}

function isTextNode (el) {
  return el.tagName === undefined
}

function getStyles (style) {
  const inlineStyles = {}
  for (let i = 0; i < style.length; i++) {
    const styleName = style.item(i)
    inlineStyles[camelCase(styleName)] = style.getPropertyValue(styleName)
  }
  return inlineStyles
}

function getRightNodeRange (selection, textLength) {
  if (selection.anchorOffset && selection.focusOffset) {
    return [selection.anchorOffset, selection.focusOffset]
  } else if (!selection.anchorOffset && selection.focusOffset) {
    return [selection.focusOffset, textLength]
  }
  return [selection.anchorOffset, textLength]
}

function styleSelection (selection, isRightNode = false) {
  if (isRightNode) {
    if (selection.anchorOffset) {
      return { backgroundColor: 'blue' }
    }
    return {}
  }
  if (!selection.anchorOffset && selection.focusOffset) {
    return { backgroundColor: 'blue' }
  }
  return {}
}

export default class Element extends Component {
  static propTypes = {
    clearSelection: PropTypes.func.isRequired,
    element: PropTypes.shape({
      id: PropTypes.number.isRequired,
      element: PropTypes.shape({
        tagName: PropTypes.string.isRequired,
        childNodes: PropTypes.object.isRequired,
        dataset: PropTypes.object.isRequired,
        style: PropTypes.object.isRequired
      }).isRequired
    }).isRequired,
    getElementDefinition: PropTypes.func.isRequired
  }

  state = {
    selection: { selected: false }
  }

  // Attach self to element definition so that we can make calls on this component to
  // update itself when selections and other annotations are created
  // This is an anti-pattern, but i think it is a justified exception - DO NOT DO THIS NORMALLY
  componentWillMount () {
    const definition = this.props.getElementDefinition(this.props.element.id)
    definition.component = this
    this.childNodes = []
    this.props.element.element.childNodes.forEach((el, index) => {
      if (isTextNode(el)) {
        this.childNodes.push(
          <span key={el.textContent.substring(0, 5)} data-inner-position={index}>
            {el.textContent}
          </span>
        )
        return
      }
      const element = this.props.getElementDefinition(parseId(el))
      this.childNodes.push(
        <Element
          key={element.id}
          clearSelection={this.props.clearSelection}
          element={element}
          getElementDefinition={this.props.getElementDefinition}
        />
      )
    })
  }

  setSelection (selection) {
    const childNode = this.props.element.element.childNodes[selection.innerPosition]
    if (this.childNodeInSelection(childNode) && !isTextNode(childNode)) { return } // childNode will take care of selection
    const lnRange = [0, selection.anchorOffset ? selection.anchorOffset : selection.focusOffset]
    const ln = (
      <span key={`${childNode.textContent.substring(...lnRange)}_left`} style={styleSelection(selection)} >
        {childNode.textContent.substring(...lnRange)}
      </span>
    )
    const rnRange = getRightNodeRange(selection, childNode.textContent.length)
    const rn = (
      <span key={`${childNode.textContent.substring(...rnRange)}_right`} style={styleSelection(selection, true)} >
        {childNode.textContent.substring(...rnRange)}
      </span>
    )

    if (selection.anchorOffset && selection.focusOffset) {
      const remainder = [selection.focusOffset, childNode.textContent.length]
      const remainderNode = (
        <span key={`${childNode.textContent.substring(...remainder)}_remainder`}>
          {childNode.textContent.substring(...remainder)}
        </span>
      )
      this.childNodes = update(
        this.childNodes,
        { $splice: [[selection.innerPosition, 1, ln, rn, remainderNode]] }
      )
    } else {
      this.childNodes = update(
        this.childNodes,
        { $splice: [[selection.innerPosition, 1, ln, rn]] }
      )
    }

    this.setState({ selection: { ...selection, innerIndexOf: selection.innerPosition } })
  }

  clearSelection () {
    const { selection } = this.state
    const { innerIndexOf } = selection
    if (innerIndexOf !== undefined) {
      const spliceNumber = selection.focusOffset ? 3 : 2
      const childNode = this.props.element.element.childNodes[innerIndexOf]
      const survivingNode = (
        <span key={childNode.textContent.substring(0, 5)} data-inner-position={innerIndexOf}>
          {childNode.textContent}
        </span>
      )
      this.childNodes = update(
        this.childNodes,
        { $splice: [[selection.innerIndexOf, spliceNumber, survivingNode]] }
      )
    }

    this.setState({ selection: { selected: false } })
  }

  childNodeInSelection (childNode) {
    return !!this.props.getElementDefinition(parseId(childNode))
  }

  renderChildNodes () {
    return this.childNodes
  }

  render () {
    const { id, element } = this.props.element
    const Node = element.tagName.toLowerCase()

    return (
      <Node
        data-position-id={id}
        style={{ ...getStyles(element.style), ...getSelection() }}
      >
        {this.renderChildNodes()}
      </Node>
    )
  }
}
