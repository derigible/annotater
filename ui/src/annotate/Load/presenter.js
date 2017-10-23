import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Button from '@instructure/ui-core/lib/components/Button'
import FormFieldGroup from '@instructure/ui-core/lib/components/FormFieldGroup'
import ScreenReaderContent from '@instructure/ui-core/lib/components/ScreenReaderContent'
import TextArea from '@instructure/ui-core/lib/components/TextArea'

export default class Load extends Component {
  static propTypes = {
    submitText: PropTypes.func.isRequired
  }

  setTextareaRef = (node) => {
    this.textareaRef = node
  }

  submitText = () => {
    this.props.submitText(this.textareaRef.value)
  }

  render () {
    return (
      <FormFieldGroup
        description={<ScreenReaderContent>Import Text</ScreenReaderContent>}
      >
        <TextArea
          label="Enter Text Below"
          resize="vertical"
          placeholder="Waiting for input..."
          autoGrow
          textareaRef={this.setTextareaRef}
        />
        <Button
          variant="primary"
          onClick={this.submitText}
        >
          Import
        </Button>
      </FormFieldGroup>
    )
  }
}
