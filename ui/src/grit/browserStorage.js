import storeEngine from 'store/src/store-engine'
import localStorage from 'store/storages/localStorage'
import sessionStorage from 'store/storages/sessionStorage'
import nanoid from 'nanoid'

import * as nodeTypes from '../annotate/nodeTypes'
import createNode from '../annotate/services/NodeCreatorService'

const defaultGetPlugin = function () {
  return {
    get: function (superFunc, key, defaultValue) {
      return superFunc(key) || defaultValue
    }
  }
}

const store = storeEngine.createStore([localStorage, sessionStorage], [defaultGetPlugin])

export function uploadDefinitionDocument (definition) {
  const id = nanoid()
  const node = createNode(nodeTypes.TEXT, 'document')
  store.set(`${id}_definition`, definition)
  store.set(`${id}_nodes`, [node])
  return Promise.resolve(
    {
      id,
      definition
    }
  )
}

export function submitNode (id, nodeType, range, data) {
  const docId = `${id}_nodes`
  const node = createNode(nodeType, range, data)
  const storedNodes = store.get(docId)
  storedNodes.push(node)
  store.set(docId, storedNodes)
  return Promise.resolve(
    {
      id,
      node
    }
  )
}

export function getDocumentNodes (documentId) {
  return Promise.resolve(
    store.get(`${documentId}_nodes`, [])
  )
}

export function getDocumentDefinition (documentId) {
  return Promise.resolve(
    store.get(`${documentId}_definition`)
  )
}
