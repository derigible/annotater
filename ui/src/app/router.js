import Router from 'middle-router'

export const configureRouter = () => {
  return Router()
    .lazy(
      '/annotate',
      () => new Promise(
        (resolve) => {
          require.ensure([], (require) => { resolve(require('../annotate/router').default) }, 'annotate')
        }
      )
    )
}

const router = configureRouter()

export default router
