// TODO: This file is to interact with the api/other persistent states. hook this
// up to an api_client once the api is written.
import { v4 as uuid } from 'uuid'

import router from '../app/router'

import * as actions from './actions'
import * as appActions from '../app/actions' // This will likely change to be an app action

// TODO: replace this with a call to the persistence datastore (api, sdk, whatever)
// most likely this will be stored in an s3 bucket whose id is used as the file name
function uploadTextDocument (text) {
  // consider adding this to a sessionStore to allow demoing functionality
  // for non-loggedin users
  return Promise.resolve(
    {
      id: uuid(),
      text
    }
  )
}

export function submitText (text) {
  return function (dispatch) {
    dispatch(appActions.setDisplayLoadingSpinner())
    return uploadTextDocument(text)
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
      ).then(
        (data) => {
          dispatch(appActions.unsetDisplayLoadingSpinner())
          return data
        }
      )
  }
}

export function submitHighlight (text, range) {}
