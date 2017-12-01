import { connect } from 'react-redux'

import Load from './presenter'
import { submitDefinition } from '../persistence'

export default connect(null, { submitDefinition })(Load)
