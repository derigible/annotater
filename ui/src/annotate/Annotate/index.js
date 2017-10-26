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
    fetchText: PropTypes.func.isRequired,
    nodes: PropTypes.arrayOf(nodeDefinition),
    nodesReceived: PropTypes.bool,
    setDisplayLoadingSpinner: PropTypes.func.isRequired,
    submitNode: PropTypes.func.isRequired,
    text: PropTypes.string,
    unsetDisplayLoadingSpinner: PropTypes.func.isRequired
  }

  static defaultProps = {
    text: null,
    nodes: [],
    nodesReceived: false
  }

  componentDidMount () {
    this.props.setDisplayLoadingSpinner()
    if (this.props.text === null) {
      this.props.fetchText(this.props.documentId)
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
    return this.props.text === null ||
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
        createAnnotation={this.createAnnotation}
        nodes={this.props.nodes}
        text={this.props.text}
        removeNode={this.removeNode}
      />
    )
  }
}

const mapStateToProps = (store, props) => {
  const documentObj = store.annotate[props.documentId]
  return {
    nodes: documentObj && documentObj.nodes,
    text: documentObj && documentObj.text,
    nodesReceived: documentObj !== undefined && documentObj.nodesReceived
  }
}

const mapDispatchToProps = {
  submitNode: persistence.submitNode,
  fetchNodes: persistence.fetchNodes,
  fetchText: persistence.fetchText,
  setDisplayLoadingSpinner: appActions.setDisplayLoadingSpinner,
  unsetDisplayLoadingSpinner: appActions.unsetDisplayLoadingSpinner
}

export default connect(mapStateToProps, mapDispatchToProps)(AnnotateDataWrapper)
