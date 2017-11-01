import React, { Component } from 'react'
import PropTypes from 'prop-types'

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
    console.log(sel)
    // No selection was actually made or selection is being canceled
    if (sel.anchorNode === sel.focusNode && sel.anchorOffset === sel.focusOffset) {
      this.clearSelection()
      return
    }
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

  registerComponentToId (id, component) {
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
