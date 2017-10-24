import React from 'react'
import Router from 'middle-router'

import Annotate from './Annotate'
import Load from './Load'

const app = 'annotate'
const annotateRouter = Router()
  .use('/:id', ({ path, resolve, exiting, params, location }) => {
    resolve({
      app,
      view: <Annotate documentId={params.id} />
    })
  })
  .use('/*', ({ path, resolve, exiting, params, location }) => {
    resolve({
      app,
      view: <Load />
    })
  })

export default annotateRouter
