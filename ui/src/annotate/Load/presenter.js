import React, { Component } from 'react'
import PropTypes from 'prop-types'
import uniqueId from 'lodash/uniqueId'

import Button from '@instructure/ui-core/lib/components/Button'
import Checkbox from '@instructure/ui-core/lib/components/Checkbox'
import FormFieldGroup from '@instructure/ui-core/lib/components/FormFieldGroup'
import ScreenReaderContent from '@instructure/ui-core/lib/components/ScreenReaderContent'
import TextArea from '@instructure/ui-core/lib/components/TextArea'
// import RichContentInput from 'quiz-interactions/lib/components/common/components/rce/RichContentInput'

export default class Load extends Component {
  static propTypes = {
    submitText: PropTypes.func.isRequired
  }

  setCheckboxRef = (node) => {
    this.checkboxRef = node
  }

  setTextareaRef = (node) => {
    this.textareaRef = node
  }

  submitText = () => {
    this.props.submitText(this.textareaRef.value)
  }

  uniqueId = uniqueId()

  handleOnChange = () => {}
  handleOnBlur = () => {}
  handleOpenImportModal = () => {}
  renderImportModal = () => {}

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
        <Checkbox ref={this.setCheckboxRef} label="Enable spell check" value="medium" defaultChecked />
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

// Add this in when quizInteractions is working well again
// <RichContentInput
//   appContainer="#content"
//   textareaId={`rceTextArea_${this.uniqueId}`}
//   label={<ScreenReaderContent>Rich Content Entry</ScreenReaderContent>}
//   onChange={this.handleOnChange}
//   onKeyUp={this.handleOnChange}
//   onBlur={this.handleOnBlur}
//   openImportModal={this.handleOpenImportModal}
//   renderImportModal={this.renderImportModal}
//   tinyMCEOptions={{
//     browser_spellcheck: this.checkboxRef.value
//   }}
// />
