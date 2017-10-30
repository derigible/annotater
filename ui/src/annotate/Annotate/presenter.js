import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SortedMap from 'collections/sorted-map'

import ScreenReaderContent from '@instructure/ui-core/lib/components/ScreenReaderContent'
import themeable from '@instructure/ui-themeable'
import * as nodeTypes from '../nodeTypes'

import Element, { parseId } from './Element'

import styles from './styles.css'
import theme from './theme'

function getInnerPosition (node) {
  if (!node.dataset) {
    if (!node.parentNode) { return null }
    return getInnerPosition(node.parentNode)
  }
  return (node.dataset.innerPosition && parseInt(node.dataset.innerPosition, 10)) || 0
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
    this.nodeMap = new SortedMap()
    this.topLevel = []
    this.state = { selection: [] }
  }

  componentWillMount () {
    this.textContainer.innerHTML = this.props.text
    this.mapElement(this.textContainer)
    this.textContainer.childNodes.forEach((n) => {
      this.topLevel.push(this.nodeMap.get(parseId(n)))
    })
  }

  getContainingParentNode (node) {
    const id = parseId(node.parentNode)
    if (id) {
      return this.nodeMap.get(id)
    } else if (node.parentNode.parentNode) {
      return this.getContainingParentNode(node.parentNode)
    }
    return null
  }

  getNodesBetween (left, right) {
    const nodes = []
    for (let i = left; i <= right; i++) {
      nodes.push(this.nodeMap.get(i))
    }
    return nodes // will always have at least one node in it
  }

  getElementDefinition = (id) => {
    return this.nodeMap.get(id)
  }

  checkSelected = () => {
    const sel = window.getSelection()
    // No selection was actually made or selection is being canceled
    if (sel.anchorNode === sel.focusNode && sel.anchorOffset === sel.focusOffset) {
      this.clearSelection()
      return
    }
    const an = this.getContainingParentNode(sel.anchorNode)
    const fn = this.getContainingParentNode(sel.focusNode)
    if (an === null || fn === null) { return }
    const inLine = an.id <= fn.id
    const ln = inLine ? an : fn
    const rn = inLine ? fn : an
    const anchorInnerPosition = getInnerPosition(inLine ? sel.anchorNode : sel.focusNode)
    const focusInnerPosition = getInnerPosition(inLine ? sel.focusNode : sel.anchorNode)

    const selection = this.getNodesBetween(ln.id, rn.id)
    selection.forEach((n) => {
      // eslint-disable-next-line no-param-reassign
      n.selection.selected = true
    })

    let anchorOffset
    let focusOffset
    if (an.id !== fn.id) {
      anchorOffset = inLine ? sel.anchorOffset : sel.focusOffset
      focusOffset = inLine ? sel.focusOffset : sel.anchorOffset
    } else {
      const norm = sel.anchorOffset < sel.focusOffset
      // eslint-disable-next-line prefer-destructuring
      anchorOffset = norm ? sel.anchorOffset : sel.focusOffset
      // eslint-disable-next-line prefer-destructuring
      focusOffset = norm ? sel.focusOffset : sel.anchorOffset
    }
    selection[0].selection.anchorOffset = anchorOffset
    selection[0].selection.anchorInnerPosition = anchorInnerPosition
    selection[selection.length - 1].selection.focusOffset = focusOffset
    selection[selection.length - 1].selection.focusInnerPosition = focusInnerPosition
    console.log(sel, selection)
    this.updateSelected(selection)
    this.setState({ selection })
    window.getSelection().removeAllRanges()
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

  updateSelected = (nodes) => {
    this.clearSelection()
    nodes.forEach((n) => {
      n.component.setSelection(n.selection)
    })
  }

  mapElement (element) {
    if (element.dataset) {
      const id = parseId(element)
      id && this.nodeMap.set(id, { id, element, selection: { selected: false } })
    }
    element.childNodes && element.childNodes.forEach((el) => {
      this.mapElement(el)
    })
  }

  renderNodes () {
    return this.topLevel.map((el) => {
      return (
        <Element
          key={el.id}
          clearSelection={this.clearSelection}
          element={el}
          getElementDefinition={this.getElementDefinition}
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
