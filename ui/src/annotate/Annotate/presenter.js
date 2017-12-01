import React, { Component } from 'react'
import PropTypes from 'prop-types'

import ScreenReaderContent from '@instructure/ui-core/lib/components/ScreenReaderContent'
import themeable from '@instructure/ui-themeable'

import Node from './Node'

import styles from './styles.css'
import theme from './theme'

export function precedesNode (pointNode, testNode) {
  // eslint-disable-next-line no-bitwise
  return (pointNode.compareDocumentPosition(testNode) & Node.DOCUMENT_POSITION_PRECEDING) === 0
}

@themeable(theme, styles)
export default class Annotate extends Component {
  static propTypes = {
    createAnnotation: PropTypes.func.isRequired,
    docDefinition: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      tag: PropTypes.string.isRequired,
      styles: PropTypes.object,
      children: PropTypes.array,
      content: PropTypes.string,
      parentTags: PropTypes.array
    })).isRequired // ,
    // annotations: PropTypes.objectOf(
    //   PropTypes.arrayOf(
    //     PropTypes.shape({
    //       type: PropTypes.oneOf(Object.values(nodeTypes)),
    //       range: PropTypes.arrayOf(PropTypes.number)
    //     })
    //   )
    // ).isRequired,
    // nodes: PropTypes.array.isRequired
  }

  getElementDefinition = (id) => {
    return this.nodeMap.get(id)
  }

  checkSelected = () => {
    const sel = window.getSelection()
    // No selection was actually made or selection is being canceled
    if (sel.isCollapsed) {
      this.clearSelection()
      // return
    }
    // const inOrder = sel.anchorNode.isEqualNode(sel.focusNode)
    //   ? sel.anchorOffset < sel.focusOffset
    //   : precedesNode(sel.anchorNode, sel.focusNode)
    // const startOffset = inOrder ? sel.anchorOffset : sel.focusOffset
    // const endOffset = inOrder ? sel.focusOffset : sel.anchorOffset
    // window.getSelection().removeAllRanges()
  }

  createAnnotation = (type, range, data) => {
    this.props.createAnnotation(type, range, data)
  }

  clearSelection = () => {
    this.state.selection.forEach((n, k) => {
      const node = this.nodeMap.get(k)
      node.clearHighlight()
    })
    this.setState({ selection: [] })
  }

  registerComponentToId = (id, component) => {
    this.nodeMap.set(id, component)
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
        {
          this.props.docDefinition.map((node) => {
            return (
              <Node
                key={node.id}
                node={node}
              />
            )
          })
        }
      </div>
    )
  }
}
