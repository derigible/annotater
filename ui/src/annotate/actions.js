import * as actionTypes from './actionTypes'

export const loadDefinition = (id, definition) => {
  return {
    type: actionTypes.LOAD_DEFINITION,
    id,
    definition
  }
}

export const setDocumentNodes = (id, nodes) => {
  return {
    type: actionTypes.SET_DOCUMENT_NODES,
    id,
    nodes
  }
}

export const createNode = (documentId, node) => {
  return {
    type: actionTypes.CREATE_NODE,
    documentId,
    node
  }
}
