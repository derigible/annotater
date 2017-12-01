import update from 'immutability-helper'

import * as actionTypes from './actionTypes'

const initialState = {}

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.CREATE_NODE:
      return update(state,
        {
          [action.documentId]: {
            nodes: {
              $push: [action.node]
            }
          }
        }
      )
    case actionTypes.LOAD_DEFINITION:
      return update(state,
        {
          [action.id]: {
            [getVerb(state, action)]: {
              docDefinition: action.definition
            }
          }
        }
      )
    case actionTypes.SET_DOCUMENT_NODES:
      return update(state,
        {
          [action.id]: {
            [getVerb(state, action)]: {
              nodes: action.nodes,
              nodesReceived: true
            }
          }
        }
      )
    default:
      return state
  }
}

function getVerb (state, action) {
  return state[action.id] ? '$merge' : '$set'
}
