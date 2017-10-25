import router from '../app/router'

import * as actions from './actions'
import * as appActions from '../app/actions'
import grit from '../grit'

// When submitting text, you must also include its default node
export function submitText (text) {
  return function (dispatch) {
    dispatch(appActions.setDisplayLoadingSpinner())

    return grit.uploadTextDocument(text)
      .then(
        (data) => {
          dispatch(actions.loadText(data.id, data.text))
          return data
        },
        (error) => dispatch(appActions.setAlert(error))
      )
      .then(
        (data) => {
          router.navigate(`${data.id}`)
          return data
        }
      )
      .then(
        (data) => {
          dispatch(appActions.unsetDisplayLoadingSpinner())
          return data
        }
      )
  }
}

export function submitNode (documentId, nodeType, range, data) {
  return function (dispatch) {
    return grit.submitNode(documentId, nodeType, range, data).then(
      (respData) => {
        dispatch(actions.createNode(documentId, respData.node))
        return respData
      }
    )
  }
}

export function fetchNodes (documentId) {
  return function (dispatch) {
    return grit.getDocumentNodes(documentId).then(
      (data) => {
        dispatch(actions.setDocumentNodes(documentId, data))
        return data
      }
    )
  }
}

export function fetchText (documentId) {
  return function (dispatch) {
    return grit.getDocumentText(documentId).then(
      (data) => {
        dispatch(actions.loadText(documentId, data))
        return data
      }
    )
  }
}
