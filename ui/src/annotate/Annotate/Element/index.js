import React, { Component } from 'react'
import PropTypes from 'prop-types'
import camelCase from 'lodash/camelCase'
import findIndex from 'lodash/findIndex'
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
  if (selection.anchorOffset !== undefined && selection.focusOffset) {
    return [selection.anchorOffset, selection.focusOffset]
  } else if (selection.anchorOffset === undefined && selection.focusOffset) {
    return [selection.focusOffset, textLength]
  }
  return [selection.anchorOffset, textLength]
}

function styleSelection (selection, isRightNode = false) {
  if (isRightNode) {
    if (selection.anchorOffset !== undefined) {
      return { backgroundColor: 'blue' }
    }
    return {}
  }
  if (selection.anchorOffset === undefined && selection.focusOffset) {
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
    getElementDefinition: PropTypes.func.isRequired,
    innerPosition: PropTypes.number
  }

  static defaultProps = {
    innerPosition: null
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
          innerPosition={index}
        />
      )
    })
  }

  getInnerPositionOfElementById (id) {
    return findIndex(this.childNodes, (el) => parseId(el) === id )
  }

  setSelection (selection) {
    const anchorPosition = selection.anchorInnerPosition !== undefined
      ? selection.anchorInnerPosition : selection.focusInnerPosition
    const anchorChildNode = this.props.element.element.childNodes[anchorPosition]

    const lnRange = [0, selection.anchorOffset !== undefined ? selection.anchorOffset : selection.focusOffset]
    const ln = (
      <span key={`${anchorChildNode.textContent.substring(...lnRange)}_left`} style={styleSelection(selection)} >
        {anchorChildNode.textContent.substring(...lnRange)}
      </span>
    )

    const focusPosition = selection.anchorInnerPosition !== undefined
      ? selection.anchorInnerPosition : selection.focusInnerPosition
    const focusChildNode = this.props.element.element.childNodes[focusPosition]
    const rnRange = getRightNodeRange(selection, focusChildNode.textContent.length)
    const rn = (
      <span key={`${focusChildNode.textContent.substring(...rnRange)}_right`} style={styleSelection(selection, true)} >
        {focusChildNode.textContent.substring(...rnRange)}
      </span>
    )

    if (selection.anchorOffset !== undefined && selection.focusOffset) {
      const remainder = [selection.focusOffset, focusChildNode.textContent.length]
      const remainderNode = (
        <span key={`${focusChildNode.textContent.substring(...remainder)}_remainder`}>
          {focusChildNode.textContent.substring(...remainder)}
        </span>
      )
      this.childNodes = update(
        this.childNodes,
        { $splice: [[selection.anchorInnerPosition, 1, ln, rn, remainderNode]] }
      )
    } else {
      this.childNodes = update(
        this.childNodes,
        { $splice: [[focusPosition, 1, ln, rn]] }
      )
    }

    this.setState({
      selection: {
        ...selection,
        anchorPosition: anchorPosition,
        focusPosition: focusPosition
      }
    })
  }

  clearSelection () {
    const { selection } = this.state
    const { anchorPosition, focusPosition } = selection
    const position = anchorPosition !== undefined ? anchorPosition : focusPosition
    const spliceNumber = selection.focusOffset ? 3 : 2
    const childNode = this.props.element.element.childNodes[position]
    const survivingNode = (
      <span key={childNode.textContent.substring(0, 5)} data-inner-position={position}>
        {childNode.textContent}
      </span>
    )
    this.childNodes = update(
      this.childNodes,
      { $splice: [[position, spliceNumber, survivingNode]] }
    )

    this.setState({ selection: { selected: false } })
  }

  childNodeInSelection (childNode) {
    return !!this.props.getElementDefinition(parseId(childNode))
  }

  renderChildNodes () {
    return this.childNodes
  }

  render () {
    const { innerPosition } = this.props
    const { id, element } = this.props.element
    const Node = element.tagName.toLowerCase()

    return (
      <Node
        data-position-id={id}
        style={{ ...getStyles(element.style), ...getSelection() }}
        data-inner-position={innerPosition !== null ? innerPosition : undefined}
      >
        {this.renderChildNodes()}
      </Node>
    )
  }
}
