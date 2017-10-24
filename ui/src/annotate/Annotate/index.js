import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as nodeTypes from '../nodeTypes'
import NodesService from '../services/NodesService'

import Annotate from './presenter'

class AnnotateDataWrapper extends Component {
  static propTypes = {
    documentId: PropTypes.string.isRequired,
    fetchNodes: PropTypes.func.isRequired,
    fetchText: PropTypes.func.isRequired,
    nodes: PropTypes.arrayOf(
      PropTypes.shape({
        text: PropTypes.string.isRequired,
        type: PropTypes.oneOf(Object.values(nodeTypes))
      })
    ).isRequired,
    nodesReceived: PropTypes.bool.isRequired,
    setDisplayLoadingSpinner: PropTypes.func.isRequired,
    text: PropTypes.string,
    unsetDisplayLoadingSpinner: PropTypes.func.isRequired
  }

  static defaultProps = {
    text: null
  }

  state = {
    computingNodes: false
  }

  componentDidMount () {
    if (this.props.text === null) {
      this.props.fetchText(this.props.documentId)
    }
    if (!this.props.nodesReceived) {
      this.props.fetchNodes(this.props.documentId)
    }
    if (this.isLoading) {
      this.props.setDisplayLoadingSpinner()
    }
  }

  componentDidUpdate (prevProps) {
    if (!this.isLoading) {
      this.props.unsetDisplayLoadingSpinner()
    }
    if (this.isLoading && prevProps.nodes.length !== this.nodes.length) {
      this.computeNodes()
    }
  }

  get isLoading () {
    return this.props.text === null ||
      !this.props.nodesReceived ||
      this.state.computingNodes
  }

  computeNodes () {
    this.setState({ computingNodes: true })
    setTimeout(() => {
      this.nodesService = new NodesService(this.props.text, this.props.nodes)
      this.nodesService.generate()
      this.setState({
        computingNodes: false
      })
    })
  }

  render () {
    if (this.isLoading) {
      return <div />
    }
    return (
      <Annotate
        addNode={this.nodesService.addNode}
        nodes={this.nodesService.nodes}
      />
    )
  }
}

const mapStateToProps = (store, props) => {
  const documentObj = store.annotate[props.documentId]
  return {
    nodes: documentObj.nodes,
    text: documentObj.text,
    nodesReceived: store.nodesReceived
  }
}

export default connect(mapStateToProps, null)(AnnotateDataWrapper)
