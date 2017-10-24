import update from 'immutability-helper'

import * as actionTypes from './actionTypes'

const initialState = {}

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.SET_HIGHLIGHT:
      return update(state,
        {
          [action.id]: {
            nodes: {
              $splice: [
                // Remove the old text and replace with the text that wasn't highlighted
                // followed by a node of the highlighted text
                [action.textIndex, 1, action.unHighlightedText, action.highlightedText]
              ]
            }
          }
        }
      )
    case actionTypes.LOAD_TEXT:
      return update(state,
        {
          [action.id]: {
            [getVerb(state, action)]: {
              text: action.text
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
