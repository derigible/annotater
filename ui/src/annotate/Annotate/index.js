import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as appActions from '../../app/actions'
import * as nodeTypes from '../nodeTypes'
import * as persistence from '../persistence'
import NodesService from '../services/NodesService'

import Annotate from './presenter'

const PENDING = 'PENDING'
const COMPUTING = 'COMPUTING'
const COMPUTED = 'COMPUTED'

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
    ),
    nodesReceived: PropTypes.bool,
    setDisplayLoadingSpinner: PropTypes.func.isRequired,
    text: PropTypes.string,
    unsetDisplayLoadingSpinner: PropTypes.func.isRequired
  }

  static defaultProps = {
    text: null,
    nodes: [],
    nodesReceived: false
  }

  state = {
    computingNodes: PENDING
  }

  componentDidMount () {
    this.props.setDisplayLoadingSpinner()
    if (this.props.text === null) {
      this.props.fetchText(this.props.documentId)
    }
    if (!this.props.nodesReceived) {
      this.props.fetchNodes(this.props.documentId)
    }
    if (!this.isLoading) {
      this.computeNodes()
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.computingNodes === COMPUTED && prevState.computingNodes === COMPUTING) {
      this.props.unsetDisplayLoadingSpinner()
    }
    if (!this.isLoading && this.state.computingNodes === PENDING) {
      this.computeNodes()
    }
  }

  get isLoading () {
    return this.props.text === null ||
      !this.props.nodesReceived
  }

  get nodesGenerated () {
    return this.state.computingNodes === COMPUTED
  }

  computeNodes () {
    this.setState({ computingNodes: COMPUTING })
    setTimeout(() => {
      this.nodesService = new NodesService(this.props.text, this.props.nodes)
      this.nodesService.generate()
      this.setState({
        computingNodes: COMPUTED
      })
    })
  }

  render () {
    if (this.isLoading || !this.nodesGenerated) {
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
    nodes: documentObj && documentObj.nodes,
    text: documentObj && documentObj.text,
    nodesReceived: documentObj !== undefined && documentObj.nodesReceived
  }
}

const mapDispatchToProps = {
  fetchNodes: persistence.fetchNodes,
  fetchText: persistence.fetchText,
  setDisplayLoadingSpinner: appActions.setDisplayLoadingSpinner,
  unsetDisplayLoadingSpinner: appActions.unsetDisplayLoadingSpinner
}

export default connect(mapStateToProps, mapDispatchToProps)(AnnotateDataWrapper)
