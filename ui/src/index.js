import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import canvas from '@instructure/ui-themes/lib/canvas'

canvas.use()
/* eslint-disable import/first */
import Body from './app/Body'
import rootReducer from './store/rootReducer'
import configureStore from './store'

import router from './app/router'
/* eslint-enable import/first */

const store = configureStore({}, rootReducer)

router.on('route', async (args, routing) => { // eslint-disable-line arrow-parens
  try {
    const { view } = await routing

    ReactDOM.render(
      <Provider store={store}>
        <Body>
          {view}
        </Body>
      </Provider>,
      document.getElementById('app')
    )
  } catch (ex) {
    console.error(ex) // eslint-disable-line no-console
  }
}).start()
