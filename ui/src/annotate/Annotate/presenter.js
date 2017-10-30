import React, { Component } from 'react'
import PropTypes from 'prop-types'
import SortedMap from 'collections/sorted-map'

import ScreenReaderContent from '@instructure/ui-core/lib/components/ScreenReaderContent'
import themeable from '@instructure/ui-themeable'
import * as nodeTypes from '../nodeTypes'

import Element, { parseId } from './Element'

import styles from './styles.css'
import theme from './theme'

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

  mapElement (element) {
    if (element.dataset) {
      const id = parseId(element)
      id && this.nodeMap.set(id, { id, element })
    }
    element.childNodes && element.childNodes.forEach((el) => {
      this.mapElement(el)
    })
  }

  checkSelected = () => {
    const selection = window.getSelection()
    console.log(selection)
    // get Nodes to split, add selection annotation an split
    //  left node -> split and all nodes to right of offset recursively get
    //  selection annotation
    //  right node -> split and all node to the left offset recursively get
    //  selection annotation
    //  in between -> all Node components receive annotation of Selection
    const leftNode = this.getParentNodeRecursively(selection.anchorNode)
    const rightNode = this.getParentNodeRecursively(selection.focusNode)
    const nodesBetween = this.getNodesBetween(leftNode, rightNode)
    // {
    //  id: 'span.2.span.sup.span',
    //  offset: 5
    //  type: 'end'
    // } =>
    // <span>
    //  <span></span>
    //  <span>
    //    <sup>
    //      <span>
    //        abcdef|this is the described place|g
    //      </span>
    //      alad
    //    </sup>
    //    adfag
    //  </span>
    //  ddfaga
    //  <span>asd</span>
    // <span>
    // In english: split at offset five of the first span of the first sup of
    // the second span of the root span
    //
    // In node Component, index all childNodes with the
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
