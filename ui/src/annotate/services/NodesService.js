import * as nodeTypes from '../nodeTypes'
/**
 * Nodes from persistence will have a schema as follows:
 * {
 *   range: [<offset>, <length>],
 *   type: oneOf(Annotate.nodeTypes)
 *   data: {
 *     <specific to the nodeType>
 *   }
 * }
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

  generate () {
    if (this.$$hasGenerated) { throw new Error('Cannot generate - already generated.') }
    this.originalNodes.forEach((node) => {

    })
    if (this.nodes.length > 0) {
      return this.nodes
    } else {
      return this.createNode({
        range: [0, this.text.length],
        type: nodeTypes.TEXT,
        data: {
          color: 'default',
          size: 'default'
        }
      })
    }
  }
}
