import { v4 as uuid } from 'uuid'

import * as nodeTypes from '../nodeTypes'
import * as colors from '../colors'

/* Nodes from persistence will have a schema as follows:
 * {
 *   id: <string>,
 *   range: [<offset>, <length>],
 *   type: oneOf(Annotate.nodeTypes)
 *   data: {
 *     <specific to the nodeType>
 *   }
 * }
 * */
export default function createNode (type, range, data) {
  switch (type) {
    case nodeTypes.HIGHLIGHT:
      return createHighlightNode(range, data)
    case nodeTypes.TEXT:
      return createTextNode(range, data)
    case nodeTypes.TAG:
      return createTagNode(range, data)
    default:
      return createErrorNode(range, data)
  }
}

function createHighlightNode (
  range,
  data = { color: Object.values(colors)[Math.floor(Math.random() * Object.values(colors).length)] }
) {
  return {
    id: uuid(),
    range,
    type: nodeTypes.HIGHLIGHT,
    data
  }
}

function createTextNode (range, data = { color: 'default', size: 'default' }) {
  return {
    id: uuid(),
    range,
    type: nodeTypes.TEXT,
    data
  }
}

function createTagNode (range, data) {
  return {
    id: uuid(),
    range,
    type: nodeTypes.TAG,
    data
  }
}

function createErrorNode (range, data) {
  return {
    id: uuid(),
    range,
    type: nodeTypes.ERROR,
    data
  }
}
