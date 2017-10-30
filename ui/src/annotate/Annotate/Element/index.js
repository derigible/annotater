import React, { Component } from 'react'
import PropTypes from 'prop-types'

export function parseId (el) {
  return el.dataset && parseInt(el.dataset.positionId, 10)
}

export default class Element extends Component {
  static propTypes = {
    element: PropTypes.shape({
      tagName: PropTypes.string.isRequired,
      childNodes: PropTypes.object.isRequired,
      dataset: PropTypes.object.isRequired
    }).isRequired
  }

  renderChildNodes () {
    const nodes = []
    this.props.element.childNodes.forEach((el) => {
      if (el.tagName === undefined) {
        nodes.push(el.textContent)
        return
      }
      const id = parseId(el)
      nodes.push(<Element key={id} element={el} />)
    })
    return nodes
  }

  render () {
    const Node = this.props.element.tagName.toLowerCase()
    return (
      <Node
        data-position-id={parseId(this.props.element)}
      >
        {this.renderChildNodes()}
      </Node>
    )
  }
}
