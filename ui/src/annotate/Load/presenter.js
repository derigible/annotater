import React, { Component } from 'react'
import PropTypes from 'prop-types'
import uniqueId from 'lodash/uniqueId'
import debounce from 'lodash/debounce'

import Button from '@instructure/ui-core/lib/components/Button'
import Checkbox from '@instructure/ui-core/lib/components/Checkbox'
import Container from '@instructure/ui-core/lib/components/Container'
import FormFieldGroup from '@instructure/ui-core/lib/components/FormFieldGroup'
import ScreenReaderContent from '@instructure/ui-core/lib/components/ScreenReaderContent'
import RichContentInput from 'quiz-interactions/lib/components/common/components/rce/RichContentInput'

function debouncer (update) {
  return debounce(update, 500, {
    leading: false,
    maxWait: 600,
    trailing: true
  })
}

function getProps (overrides) {
  return {
    toolbar: [
      'undo redo | bold italic underline | removeformat | ' +
      'alignleft aligncenter alignright | superscript subscript bullist numlist | ' +
      'fontsizeselect | formatselect | table quizzes_image media link'
    ],
    ...overrides
  }
}

function tagElements (content) {
  const temp = document.createElement('div')
  temp.innerHTML = content.replace(/<p[^>]*>/g, '<span>').replace(/<\/p>/g, '</span><br />')
  const toTag = temp.childNodes
  const domString = []
  toTag.forEach((tag) => {
    // eslint-disable-next-line no-param-reassign
    tag.dataset && (tag.dataset.positionId = uniqueId())
    domString.push(tag.outerHTML)
  })
  // Possible replace all p tags with br, which means that the data-position-id above breaks :{
  // but may be the best option. look into further
  // return domString.join('')
  return domString.join('')
}

export default class Load extends Component {
  static propTypes = {
    submitText: PropTypes.func.isRequired
  }

  state = {
    spellcheck: true,
    rceContent: ''
  }

  setCheckboxRef = (node) => {
    this.checkboxRef = node
  }

  setTextareaRef = (node) => {
    this.textareaRef = node
  }

  submitText = () => {
    this.props.submitText(tagElements(this.state.rceContent))
  }

  uniqueId = uniqueId()

  handleOnChange = debouncer((event, rceContent) => {
    this.setState({ rceContent: rceContent.editorContent })
  })

  handleOnBlur = () => {}
  handleOpenImportModal = () => {}
  handleSpellCheckChange = (e) => { this.setState({ spellcheck: e.target.checked }) }
  renderImportModal = () => {}

  render () {
    return (
      <div>
        <Container
          margin="large"
        >
          <FormFieldGroup
            description={<ScreenReaderContent>Import Text</ScreenReaderContent>}
          >
            <RichContentInput
              actsAsInput
              appContainer="#content"
              id="load_content_rce"
              label={<ScreenReaderContent>Rich Content Entry</ScreenReaderContent>}
              name="load_rce"
              onBlur={this.handleOnBlur}
              onChange={this.handleOnChange}
              onKeyUp={this.handleOnChange}
              openImportModal={this.handleOpenImportModal}
              placeholder="Waiting for input..."
              renderImportModal={this.renderImportModal}
              textareaId={`rceTextArea_${this.uniqueId}`}
              tinyMCEOptions={getProps({ browser_spellcheck: this.state.spellcheck })}
              type="text"
              ref={this.setTextareaRef}
            />
            <Checkbox
              ref={this.setCheckboxRef}
              checked={this.state.spellcheck}
              onChange={this.handleSpellCheckChange}
              label="Enable spell check"
            />
            <Button
              variant="primary"
              onClick={this.submitText}
            >
              Import
            </Button>
          </FormFieldGroup>
        </Container>
      </div>
    )
  }
}
