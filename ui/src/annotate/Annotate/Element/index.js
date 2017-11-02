import React, { Component } from 'react'
import PropTypes from 'prop-types'
import camelCase from 'lodash/camelCase'

export function parseId (el) {
  if (isTextNode(el)) {
    return parseId(el.parentElement.closest('[data-id]'))
  }
  return el.dataset && el.dataset.id
}

export function isTextNode (el) {
  return el.nodeType === Node.TEXT_NODE
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
    clearSelection: PropTypes.func.isRequired,
    element: PropTypes.shape({
      tagName: PropTypes.string.isRequired,
      childNodes: PropTypes.object.isRequired,
      dataset: PropTypes.object.isRequired,
      style: PropTypes.object.isRequired
    }).isRequired,
    getElementDefinition: PropTypes.func.isRequired,
    registerComponentToId: PropTypes.func.isRequired,
    id: PropTypes.string
  }

  static defaultProps = {
    id: null
  }

  componentWillMount () {
    this.props.registerComponentToId(this.props.id, this)
  }

  render () {
    const { element, clearSelection, getElementDefinition, registerComponentToId } = this.props
    const id = this.props.id === null ? parseId(element) : this.props.id
    const Node = element.tagName.toLowerCase()

    return (
      <Node
        data-id={id}
        style={{ ...getStyles(element.style) }}
      >
        {Array.from(element.childNodes).map((n) => {
          return isTextNode(n)
            ? n.textContent
            : (
              <Element
                key={id}
                clearSelection={clearSelection}
                getElementDefinition={getElementDefinition}
                registerComponentToId={registerComponentToId}
                element={n}
              />
            )
        })}
      </Node>
    )
  }
}
