import { v4 as uuid } from 'uuid'

import * as nodeTypes from '../nodeTypes'

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
    case nodeTypes.TEXT:
      return createTextNode(range, data)
    case nodeTypes.SELECTION:
      return createSelectionNode(range, data)
    default:
      return createErrorNode(data)
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

function createSelectionNode (range) {
  return {
    id: nodeTypes.SELECTION,
    type: nodeTypes.SELECTION,
    range
  }
}

function createErrorNode (range, data) {
  return {
    id: uuid(),
    range: range,
    type: nodeTypes.ERROR,
    data
  }
}
