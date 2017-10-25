import storeEngine from 'store/src/store-engine'
import localStorage from 'store/storages/localStorage'
import sessionStorage from 'store/storages/sessionStorage'
import { v4 as uuid } from 'uuid'

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

export function uploadTextDocument (text) {
  const id = uuid()
  const node = createNode(nodeTypes.TEXT, [0, text.length])
  store.set(`${id}_text`, text)
  store.set(`${id}_nodes`, [node])
  return Promise.resolve(
    {
      id,
      text
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
      storedNodes
    }
  )
}

export function getDocumentNodes (documentId) {
  return Promise.resolve(
    store.get(`${documentId}_nodes`, [])
  )
}

export function getDocumentText (documentId) {
  return Promise.resolve(
    store.get(`${documentId}_text`)
  )
}
