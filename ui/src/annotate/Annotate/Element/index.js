import React, { Component } from 'react'
import PropTypes from 'prop-types'
import camelCase from 'lodash/camelCase'

export function parseId (el) {
  return el.dataset && el.dataset.positionId && parseInt(el.dataset.positionId, 10)
}

function getStyles (style) {
  const inlineStyles = {}
  for (let i = 0; i < style.length; i++) {
    const styleName = style.item(i)
    inlineStyles[camelCase(styleName)] = style.getPropertyValue(styleName)
  }
  return inlineStyles
}

export default class Element extends Component {
  static propTypes = {
    element: PropTypes.shape({
      tagName: PropTypes.string.isRequired,
      childNodes: PropTypes.object.isRequired,
      dataset: PropTypes.object.isRequired,
      style: PropTypes.object.isRequired
    }).isRequired,
    getElementDefinition: PropTypes.func.isRequired
  }

  renderChildNodes () {
    const nodes = []
    this.props.element.childNodes.forEach((el, index) => {
      if (el.tagName === undefined) {
        nodes.push(<span key={el.textContent.substring(0, 5)} data-inner-position={index + 1}>{el.textContent}</span>)
        return
      }
      const id = parseId(el)
      nodes.push(<Element key={id} element={el} getElementDefinition={this.props.getElementDefinition} />)
    })
    return nodes
  }

  render () {
    const id = parseId(this.props.element)
    const Node = this.props.element.tagName.toLowerCase()
    const definition = this.props.getElementDefinition(id)

    const getSelection = () => {
      if (definition.selection.selected) {
        return { backgroundColor: 'blue' }
      }
      return {}
    }

    return (
      <Node
        data-position-id={id}
        style={{ ...getStyles(this.props.element.style), ...getSelection() }}
      >
        {this.renderChildNodes()}
      </Node>
    )
  }
}
