import { combineReducers } from 'redux'
import annotate from '../annotate/reducer'
import app from '../app/reducer'

export default combineReducers({
  annotate,
  app
})
