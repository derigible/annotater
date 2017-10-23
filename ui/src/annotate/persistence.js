// TODO: This file is to interact with the api/other persistent states. hook this
// up to an api_client once the api is written.
import uniqueId from 'lodash/uniqueId'
import router from './router'

import * as actions from './actions'
import * as appActions from '../app/actions' // This will likely change to be an app action
import * as nodeTypes from './nodeTypes'

// TODO: data transform should be on the api, but is here for now to help aid in ui testing - should it?
// At any rate, this will be replaced by an api call and teh function below won't be changed
function transformLoadText (text) {
  return new Promise(
    (resolve) => {
      return {
        id: uniqueId(),
        nodes: [
          {
            text,
            type: nodeTypes.TEXT
          }
        ]
      }
    }
  )
}

export function submitText (text) {
  return function (dispatch) {
    dispatch(appActions.setDisplayLoadingSpinner())
    return transformLoadText(text)
      .then(
        (data) => {
          dispatch(actions.loadText(data.id, data.nodes))
          return data
        },
        (error) => dispatch(appActions.setAlert(error))
      )
      .then(
        (data) => {
          router.navigate(data.id)
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
