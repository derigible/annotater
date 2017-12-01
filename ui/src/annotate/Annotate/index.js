import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as appActions from '../../app/actions'
import { nodeDefinition } from '../../react/customPropTypes'
import * as persistence from '../persistence'

import Annotate from './presenter'

class AnnotateDataWrapper extends Component {
  static propTypes = {
    documentId: PropTypes.string.isRequired,
    fetchNodes: PropTypes.func.isRequired,
    fetchDefinition: PropTypes.func.isRequired,
    nodes: PropTypes.arrayOf(nodeDefinition),
    nodesReceived: PropTypes.bool,
    setDisplayLoadingSpinner: PropTypes.func.isRequired,
    submitNode: PropTypes.func.isRequired,
    docDefinition: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      tag: PropTypes.string.isRequired,
      styles: PropTypes.object,
      children: PropTypes.array,
      content: PropTypes.string,
      parentTags: PropTypes.array
    })),
    unsetDisplayLoadingSpinner: PropTypes.func.isRequired
  }

  static defaultProps = {
    docDefinition: null,
    nodes: [],
    nodesReceived: false
  }

  componentDidMount () {
    this.props.setDisplayLoadingSpinner()
    if (this.props.docDefinition === null) {
      this.props.fetchDefinition(this.props.documentId)
    }
    if (!this.props.nodesReceived) {
      this.props.fetchNodes(this.props.documentId)
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (!this.isLoading) {
      this.props.unsetDisplayLoadingSpinner()
    }
  }

  get isLoading () {
    return this.props.docDefinition === null ||
      !this.props.nodesReceived
  }

  createAnnotation = (type, range, data) => {
    const { documentId } = this.props
    this.props.submitNode(
      documentId,
      type,
      range,
      data
    )
  }

  removeNode = (nodeId) => {}

  render () {
    if (this.isLoading) {
      return <div />
    }
    return (
      <Annotate
        annotations={{}}
        createAnnotation={this.createAnnotation}
        nodes={this.props.nodes}
        docDefinition={this.props.docDefinition}
        removeNode={this.removeNode}
      />
    )
  }
}

const mapStateToProps = (store, props) => {
  const documentObj = store.annotate[props.documentId]
  return {
    nodes: documentObj && documentObj.nodes,
    docDefinition: documentObj && documentObj.docDefinition,
    nodesReceived: documentObj !== undefined && documentObj.nodesReceived
  }
}

const mapDispatchToProps = {
  submitNode: persistence.submitNode,
  fetchNodes: persistence.fetchNodes,
  fetchDefinition: persistence.fetchDefinition,
  setDisplayLoadingSpinner: appActions.setDisplayLoadingSpinner,
  unsetDisplayLoadingSpinner: appActions.unsetDisplayLoadingSpinner
}

export default connect(mapStateToProps, mapDispatchToProps)(AnnotateDataWrapper)
