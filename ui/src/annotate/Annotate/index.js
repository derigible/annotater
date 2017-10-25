import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import * as appActions from '../../app/actions'
import * as nodeTypes from '../nodeTypes'
import * as persistence from '../persistence'
import NodesService from '../services/NodesService'
import createNode from '../services/NodeCreatorService'

import Annotate from './presenter'

class AnnotateDataWrapper extends Component {
  static propTypes = {
    documentId: PropTypes.string.isRequired,
    fetchNodes: PropTypes.func.isRequired,
    fetchText: PropTypes.func.isRequired,
    nodes: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        range: PropTypes.arrayOf(PropTypes.number).isRequired,
        type: PropTypes.oneOf(Object.values(nodeTypes)),
        data: PropTypes.object
      })
    ),
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

  state = { selection: null }

  componentDidMount () {
    this.nodesService = new NodesService()
    this.props.setDisplayLoadingSpinner()
    if (this.props.text === null) {
      this.props.fetchText(this.props.documentId)
    } else {
      this.nodesService.text = this.props.text
    }
    if (!this.props.nodesReceived) {
      this.props.fetchNodes(this.props.documentId)
    }
  }

  componentWillUpdate (nextProps) {
    if (this.props.text === null && nextProps.text !== null) {
      this.nodesService.text = nextProps.text
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

  addNode = (type, startOffset, endOffset) => {
    const { documentId } = this.props
    this.props.submitNode(
      documentId,
      type,
      [startOffset, endOffset - startOffset]
    )
  }

  makeSelection = (startOffset, endOffset) => {
    const range = [startOffset, endOffset]
    const node = createNode(nodeTypes.SELECTION, range)
    this.nodesService.addSelectionNode(node)
    this.setState({ selection: node })
  }

  removeSelection = () => {
    if (this.state.selection) {
      this.setState({ selection: null })
    }
  }

  // Note that there is no changing nodes, just replace on write
  changeNode

  render () {
    if (this.isLoading) {
      return <div />
    }
    this.nodesService.addNodesFromNodes(this.props.nodes)
    return (
      <Annotate
        makeSelection={this.makeSelection}
        removeSelection={this.removeSelection}
        addNode={this.addNode}
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
  submitNode: persistence.submitNode,
  fetchNodes: persistence.fetchNodes,
  fetchText: persistence.fetchText,
  setDisplayLoadingSpinner: appActions.setDisplayLoadingSpinner,
  unsetDisplayLoadingSpinner: appActions.unsetDisplayLoadingSpinner
}

export default connect(mapStateToProps, mapDispatchToProps)(AnnotateDataWrapper)
