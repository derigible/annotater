import update from 'immutability-helper'

import * as actionTypes from './actionTypes'

const initialState = {
  alerts: {},
  displayLoadingSpinner: false
}

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.SET_ALERT:
      return { ...state, [action.id]: action.alert }
    case actionTypes.UNSET_ALERT:
      return update(state, { alerts: { $unset: [action.id] } })
    case actionTypes.DISPLAY_LOADING_SPINNER:
      return { ...state, displayLoadingSpinner: true }
    case actionTypes.HIDE_LOADING_SPINNER:
      return { ...state, displayLoadingSpinner: false }
    default:
      return state
  }
}
