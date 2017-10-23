import { connect } from 'react-redux'

import Load from './presenter'
import { submitText } from '../persistence'

export default connect(null, { submitText })(Load)
