import storeEngine from 'store/src/store-engine'
import localStorage from 'store/storages/localStorage'
import sessionStorage from 'store/storages/sessionStorage'
import { v4 as uuid } from 'uuid'

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
  store.set(`${id}_text`, text)
  return Promise.resolve(
    {
      id,
      text
    }
  )
}

export function uploadDocumentNodes (id, nodes) {
  store.set(`${id}_nodes`, nodes)
  return Promise.resolve(
    {
      id,
      nodes
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
