import React, { Component } from 'react'
import PropTypes from 'prop-types'
// import findIndex from 'lodash/findIndex'
// import update from 'immutability-helper'

export default class Node extends Component {
  static propTypes = {
    node: PropTypes.shape({
      id: PropTypes.string.isRequired,
      tag: PropTypes.string.isRequired,
      styles: PropTypes.object,
      children: PropTypes.array,
      content: PropTypes.string,
      parentTags: PropTypes.array
    }).isRequired
  }

  static wrapInNode (nodeType, child) {
    const Wrapper = nodeType
    return <Wrapper key={child.key}>{child}</Wrapper>
  }

  static renderComplexNode (n) {
    const ComplexNode = n.parentTags[0] || 'SPAN'
    let out = (
      <ComplexNode key={n.id} style={n.styles}>
        {n.content}
      </ComplexNode>
    )
    if (n.parentTags.length > 1) {
      for (let i = 1; i < n.parentTags.length; i++) {
        const tag = n.parentTags[i]
        out = Node.wrapInNode(tag, out)
      }
    }
    return out
  }

  static renderContent (n) {
    return n.parentTags.length > 0 || Object.keys(n.styles).length > 0
      ? Node.renderComplexNode(n)
      : n.content
  }

  renderChildren () {
    const { node: { children } } = this.props
    return children.map((n) => {
      return n.tag === 'TEXT' ? Node.renderContent(n) : <Node key={n.id} node={n} />
    })
  }

  render () {
    const { node, node: { id, styles } } = this.props
    const Element = node.tag

    return (
      <Element
        data-id={id}
        style={styles}
      >
        {this.renderChildren()}
      </Element>
    )
  }
}
