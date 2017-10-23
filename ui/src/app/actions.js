import uniqueId from 'lodash/uniqueId'
import * as actionTypes from './actionTypes'

export function setAlert (alert) {
  return {
    type: actionTypes.SET_ALERT,
    alert,
    id: uniqueId()
  }
}

export function unsetAlert (alert) {
  return {
    type: actionTypes.UNSET_ALERT,
    id: uniqueId()
  }
}

export function setDisplayLoadingSpinner (alert) {
  return {
    type: actionTypes.DISPLAY_LOADING_SPINNER
  }
}

export function unsetDisplayLoadingSpinner (alert) {
  return {
    type: actionTypes.HIDE_LOADING_SPINNER
  }
}
