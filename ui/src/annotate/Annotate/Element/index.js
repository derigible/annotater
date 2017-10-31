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

function styleSelection () {
  return { backgroundColor: 'blue' }
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
    return findIndex(this.childNodes, (el) => parseId(el) === id)
  }

  setSelection (selection) {
    let anchorPosition = selection.anchorInnerPosition
    let focusPosition = selection.focusInnerPosition
    // only anchorPosition
    if (selection.focusInnerPosition === undefined) {
      const { ln, rn } = this.splitAnchorNode(selection)
      this.childNodes = update(
        this.childNodes,
        { $splice: [[selection.anchorInnerPosition, 1, ln, rn]] }
      )
    // only focusPosition
    } else if (selection.anchorInnerPosition === undefined) {
      const { ln, rn } = this.splitFocusNode(selection)
      this.childNodes = update(
        this.childNodes,
        { $splice: [[selection.focusInnerPosition, 1, ln, rn]] }
      )
    // same node, different inner positions
    } else if (selection.anchorInnerPosition !== selection.focusInnerPosition) {
      const l = this.splitAnchorNode(selection)
      const r = this.splitFocusNode(selection)
      debugger
      this.childNodes = update(
        this.childNodes,
        { $splice: [
          [selection.anchorInnerPosition, 1, l.ln, l.rn],
          [selection.focusInnerPosition + 1, 1, r.ln, r.rn]
        ] }
      )
      anchorPosition = selection.anchorInnerPosition
      focusPosition = selection.focusInnerPosition + 1
    // same node, same inner positions
    } else {
      const { rn, ln, remainderNode } = this.splitSameNode(selection)
      this.childNodes = update(
        this.childNodes,
        { $splice: [[selection.focusInnerPosition, 1, ln, rn, remainderNode]] }
      )
    }

    this.setState({
      selection: {
        ...selection,
        anchorPosition,
        focusPosition
      }
    })
  }

  splitAnchorNode (selection) {
    const node = this.props.element.element.childNodes[selection.anchorInnerPosition]
    const lRange = [0, selection.anchorOffset]
    const ln = (
      <span key={`${node.textContent.substring(...lRange)}_left`} >
        {node.textContent.substring(...lRange)}
      </span>
    )
    const rRange = [selection.anchorOffset, node.textContent.length]
    const rn = (
      <span key={`${node.textContent.substring(...rRange)}_right`} style={styleSelection()} >
        {node.textContent.substring(...rRange)}
      </span>
    )
    return { ln, rn }
  }

  splitFocusNode (selection) {
    const node = this.props.element.element.childNodes[selection.focusInnerPosition]
    const lRange = [0, selection.focusOffset]
    const ln = (
      <span key={`${node.textContent.substring(...lRange)}_left`} style={styleSelection()} >
        {node.textContent.substring(...lRange)}
      </span>
    )
    const rRange = [selection.focusOffset, node.textContent.length]
    const rn = (
      <span key={`${node.textContent.substring(...rRange)}_right`} >
        {node.textContent.substring(...rRange)}
      </span>
    )
    return { ln, rn }
  }

  splitSameNode (selection) {
    const node = this.props.element.element.childNodes[selection.focusInnerPosition]
    const lRange = [0, selection.anchorOffset]
    const ln = (
      <span key={`${node.textContent.substring(...lRange)}_left`} >
        {node.textContent.substring(...lRange)}
      </span>
    )
    const rRange = [selection.anchorOffset, selection.focusOffset]
    const rn = (
      <span key={`${node.textContent.substring(...rRange)}_right`} style={styleSelection()} >
        {node.textContent.substring(...rRange)}
      </span>
    )
    const remainder = [selection.focusOffset, node.textContent.length]
    const remainderNode = (
      <span key={`${node.textContent.substring(...remainder)}_remainder`}>
        {node.textContent.substring(...remainder)}
      </span>
    )
    return { ln, rn, remainderNode }
  }

  clearSelection () {
    // TODO fix clear selection across nodes
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
