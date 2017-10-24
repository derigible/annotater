import * as nodeTypes from '../nodeTypes'
/**
 * This service creates and maintains the nodes for the document being
 * annotated. This does not create the react components, but rather tracks
 * and manages the underlying data.
 *
 * Nodes from persistence will have a schema as follows:
 * {
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
  constructor (text, nodes) {
    this.originalNodes = nodes
    this.text = text
    this.annotationNodes = []
    this.$$hasGenerated = false
  }

  get nodes () {
    return this.annotationNodes
  }

  createNode (data) {
    return {
      text: this.text.substring(...data.range),
      type: NodesService.validateAndGetNodeType(data.type),
      data: data.data
    }
  }

  static validateAndGetNodeType (type) {
    if (!Object.values(nodeTypes).includes(type)) { return nodeTypes.ERROR }
    return type
  }

  generate () {
    if (this.$$hasGenerated) { throw new Error('Cannot generate - already generated.') }
    this.originalNodes.forEach((node) => {
      this.annotationNodes.push(this.createNode(node))
    })
    if (this.nodes.length === 0) {
      this.annotationNodes.push(
        this.createNode({
          range: [0, this.text.length],
          type: nodeTypes.TEXT,
          data: {
            color: 'default',
            size: 'default'
          }
        })
      )
    }
  }

  addNode (data) {
    this.annotationNodes.push(data)
  }
}
