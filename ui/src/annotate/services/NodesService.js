import * as nodeTypes from '../nodeTypes'
/**
 * This service creates and maintains the nodes for the document being
 * annotated. This does not create the react components, but rather tracks
 * and manages the underlying data.
 *
 * Nodes from persistence will have a schema as follows:
 * {
 *   id: <string>,
 *   range: [<offset>, <length>],
 *   type: oneOf(Annotate.nodeTypes)
 *   data: {
 *     <specific to the nodeType>
 *   }
 * }
 *
 * AnnotationNodes
 */
export default class NodesService {
  constructor () {
    this.needsSorting = true
    this.theNodes = {}
  }

  get nodes () {
    if (this.needsSorting) {
      this.sortedNodes = NodesService.sortNodes(Object.values(this.theNodes))
      this.needsSorting = false
    }
    return this.sortedNodes
  }

  get text () {
    return this.theText
  }

  set text (text) {
    this.theText = text
  }

  createUINode (data) {
    return {
      id: data.id,
      text: this.text.substring(...data.range),
      type: NodesService.validateAndGetNodeType(data.type),
      range: data.range,
      data: data.data
    }
  }

  static validateAndGetNodeType (type) {
    if (!Object.values(nodeTypes).includes(type)) { return nodeTypes.ERROR }
    return type
  }

  static sortNodes (nodes) {
    console.log(nodes)
    return nodes.sort((nodea, nodeb) => nodea.range[0] - nodeb.range[0])
  }

  addSelectionNode (node) {
    this.theNodes[nodeTypes.SELECTION] = this.createUINode(node)
    this.needsSorting = true
  }

  // Will add all new nodes. If none are new, does nothing
  addNodesFromNodes (nodes) {
    console.log(nodes)
    nodes.forEach((node) => {
      const exists = this.theNodes[node.id]
      if (!exists) {
        this.theNodes[node.id] = this.createUINode(node)
        this.needsSorting = true
      }
    })
  }
}
