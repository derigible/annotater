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
  return node.dataset && node.dataset.innerPosition && node.dataset.innerPosition
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
    this.state = { selection: {} }
  }

  componentWillMount () {
    this.textContainer.innerHTML = this.props.text
    this.mapElement(this.textContainer)
    this.textContainer.childNodes.forEach((n) => {
      this.topLevel.push(n)
    })
  }

  checkSelected = () => {
    const selection = window.getSelection()
    console.log(selection)
    const nodesBetween = this.getNodesBetween(
      this.getContainingParentId(selection.anchorNode),
      this.getContainingParentId(selection.focusNode),
      getInnerPosition(selection.anchorNode),
      getInnerPosition(selection.focusNode)
    )
    console.log(nodesBetween)
  }

  getContainingParentId (node) {
    const id = parseId(node.parentNode)
    if (id) {
      return this.nodeMap.get(id)
    } else if (node.parentNode.parentNode) {
      return this.getContainingParentId(node.parentNode)
    }
    return null
  }

  getNodesBetween (left, right, leftInner, rightInner) {
    const ln = this.nodeMap.get(left)
    const rn = this.nodeMap.get(right)
    const nodes = []
    for (let i = ln; i <= rn; i++) {
      nodes.push(this.nodeMap.get(i))
    }
    if (nodes.length) {
      return nodes
    }
    return left // either left or right since same node
  }

  mapElement (element) {
    if (element.dataset) {
      const id = parseId(element)
      id && this.nodeMap.set(id, { id, element })
    }
    element.childNodes && element.childNodes.forEach((el) => {
      this.mapElement(el)
    })
  }

  createAnnotation = (type, range, data) => {
    this.props.createAnnotation(type, range, data)
  }

  renderNodes () {
    return this.topLevel.map((el) => {
      return <Element key={parseId(el)} element={el} />
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
