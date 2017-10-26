import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import Container from '@instructure/ui-core/lib/components/Container'
import FormFieldGroup from '@instructure/ui-core/lib/components/FormFieldGroup'
import Link from '@instructure/ui-core/lib/components/Link'
import Popover, { PopoverContent, PopoverTrigger } from '@instructure/ui-core/lib/components/Popover'
import TextInput from '@instructure/ui-core/lib/components/TextInput'
import Text from '@instructure/ui-core/lib/components/Text'
import themeable from '@instructure/ui-themeable'

import * as nodeTypes from '../../nodeTypes'

import styles from './styles.css'
import theme from './theme'

@themeable(theme, styles)
export default class Node extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    types: PropTypes.arrayOf(PropTypes.oneOf(Object.values(nodeTypes))).isRequired
  }

  state = {
    showTypeMenu: false
  }

  getClassNames () {
    return classnames({
      [styles.selection]: this.props.types.includes(nodeTypes.SELECTION)
    })
  }

  showTypeMenu = () => {
    this.setState({ showTypeMenu: true })
  }

  /* eslint-disable jsx-a11y/anchor-is-valid */
  renderWithPopover () {
    return (
      <Popover
        on="click"
        shouldContainFocus
        shouldReturnFocus
        closeButtonLabel="Close"
        applicationElement={() => document.getElementById('app')}
        defaultShow
        label="Popover Dialog Example"
        offsetY="16px"
      >
        <PopoverTrigger>
          <Link variant="inverse">
            {this.renderContent()}
          </Link>
        </PopoverTrigger>
        <PopoverContent>
          <Container padding="medium" display="block" as="form">
            <FormFieldGroup description="Log In">
              <TextInput label="Username" inputRef={(el) => { if (el) { this.username = el } }} />
              <TextInput label="Password" type="password" />
            </FormFieldGroup>
          </Container>
        </PopoverContent>
      </Popover>
    )
  }

  renderContent () {
    return (
      <Text>
        <span data-id={this.props.id} className={this.getClassNames()}>
          {this.props.text}
        </span>
      </Text>
    )
  }

  // add data-id to get the internal node detail so we can normalize range offsets
  render () {
    return this.state.showTypeMenu ? this.renderWithPopover() : this.renderContent()
  }
}
