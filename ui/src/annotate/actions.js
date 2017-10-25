import * as actionTypes from './actionTypes'

export const loadText = (id, text) => {
  return {
    type: actionTypes.LOAD_TEXT,
    id,
    text
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
