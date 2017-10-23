import * as actionTypes from './actionTypes'

export const loadText = (id, text) => {
  return {
    type: actionTypes.LOAD_TEXT,
    id,
    text
  }
}

export const setHighlight = (id, textIndex, unHighlightedText, highlightedText) => {
  return {
    type: actionTypes.LOAD_TEXT,
    id,
    textIndex,
    unHighlightedText,
    highlightedText
  }
}
