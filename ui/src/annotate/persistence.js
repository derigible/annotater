import router from '../app/router'

import * as actions from './actions'
import * as appActions from '../app/actions' // This will likely change to be an app action
import grit from '../grit'

export function submitText (text) {
  return function (dispatch) {
    dispatch(appActions.setDisplayLoadingSpinner())
    return grit.uploadTextDocument(text)
      .then(
        (data) => {
          dispatch(actions.loadText(data.id, data.text))
          dispatch(actions.setDocumentNodes(data.id, []))
          return data
        },
        (error) => dispatch(appActions.setAlert(error))
      )
      .then(
        (data) => {
          router.navigate(`${data.id}`)
          return data
        }
      ).then(
        (data) => {
          dispatch(appActions.unsetDisplayLoadingSpinner())
          return data
        }
      )
  }
}

export function submitHighlight (text, range) {}

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
