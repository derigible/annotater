import { createStore, applyMiddleware } from 'redux'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'

export default function configureStore (initialState, rootReducer) {
  const logger = createLogger()
  const createStoreWithMiddleware = applyMiddleware(thunk, logger)(createStore)
  return createStoreWithMiddleware(rootReducer, initialState)
}
