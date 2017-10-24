// TODO: This file is to interact with the api/other persistent states. hook this
// up to an api_client once the api is written.
//
// Eventually this module will be written in such a way that the sdk persistence
// layer (to aws) will be added. It would be nice to have a feature that will allow
// users to make edits locally and then have them commit it to aws (in which case
// the localstorage store will dump what the user is currently working on and it
// will be saved.)
import * as browserStorage from './browserStorage'

export default browserStorage
