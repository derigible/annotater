import PropTypes from 'prop-types'
import * as nodeTypes from '../annotate/nodeTypes'

export const nodeDefinition = PropTypes.shape({
  id: PropTypes.string.isRequired,
  range: PropTypes.arrayOf(PropTypes.number).isRequired,
  type: PropTypes.oneOf(Object.values(nodeTypes)),
  data: PropTypes.object
})

export default nodeDefinition
