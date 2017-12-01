import React, { Component } from 'react'
import PropTypes from 'prop-types'
import camelCase from 'lodash/camelCase'
import debounce from 'lodash/debounce'
import nanoid from 'nanoid'

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

const blockLevelTags = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'CANVAS',
  'DD',
  'DIV',
  'DL',
  'DT',
  'FIELDSET',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'FORM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'HR',
  'LI',
  'MAIN',
  'NAV',
  'NOSCRIPT',
  'OL',
  'OUTPUT',
  'P',
  'PRE',
  'SECTION',
  'TABLE',
  'THEAD',
  'TBODY',
  'TR',
  'TFOOT',
  'UL',
  'VIDEO'
])
const inlineTags = new Set([
  'A',
  'ABBR',
  'ACRONYM',
  'B',
  'BDO',
  'BIG',
  'BR',
  'BUTTON',
  'CITE',
  'CODE',
  'DFN',
  'EM',
  'I',
  'IMG',
  'INPUT',
  'KBD',
  'LABEL',
  'MAP',
  'OBJECT',
  'Q',
  'SAMP',
  'SCRIPT',
  'SELECT',
  'SMALL',
  'SPAN',
  'STRONG',
  'SUB',
  'SUP',
  'TEXTAREA',
  'TD',
  'TH',
  'TIME',
  'TT',
  'VAR'
])

function getStyles (style) {
  const inlineStyles = {}
  if (style !== undefined) {
    for (let i = 0; i < style.length; i++) {
      const styleName = style.item(i)
      inlineStyles[camelCase(styleName)] = style.getPropertyValue(styleName)
    }
  }
  return inlineStyles
}

function isTextNode (el) {
  return el.nodeType === Node.TEXT_NODE
}

function createTag (node) {
  return {
    id: nanoid(10),
    tag: isTextNode(node) ? 'TEXT' : node.tagName,
    styles: getStyles(node.style)
  }
}

function getParentStyles (node, tag) {
  if (node.style) {
    // eslint-disable-next-line no-param-reassign
    tag.styles = Object.assign({}, getStyles(node.style), tag.styles) // newer styles matter less
  }
  if (inlineTags.has(node.parentNode.tagName)) {
    getParentStyles(node.parentNode, tag)
  }
  // Currently stop at any block level parent, may need to reevaluate later
}

function getParentTags (node, parentTags) {
  if (inlineTags.has(node.tagName)) {
    parentTags.push(node.tagName)
  }
  // currently stops at any block level parent, may need to reevaluate later
}

function flattenDoc (node, jsonDoc) {
  console.log(node)
  if (isTextNode(node) && !node.textContent.match(/(\r\n|\n|\r)/gm)) {
    const tag = createTag(node)
    tag.content = node.textContent
    getParentStyles(node.parentNode, tag)
    tag.parentTags = []
    getParentTags(node.parentNode, tag.parentTags)
    jsonDoc.push(tag)
  } else if (blockLevelTags.has(node.tagName)) {
    console.log(node)
    const tag = createTag(node)
    tag.children = []
    Array.from(node.childNodes).forEach((n) => {
      flattenDoc(n, tag.children)
    })
    jsonDoc.push(tag)
  } else if (inlineTags.has(node.tagName)) {
    Array.from(node.childNodes).forEach((n) => {
      flattenDoc(n, jsonDoc)
    })
  }
}

function docToJson (content) {
  const temp = document.createElement('div')
  temp.innerHTML = content
  const outJson = []
  temp.childNodes.forEach((n) => {
    flattenDoc(n, outJson)
  })
  return outJson
}

export default class Load extends Component {
  static propTypes = {
    submitDefinition: PropTypes.func.isRequired
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

  submitDefinition = () => {
    const out = docToJson(this.state.rceContent)
    this.props.submitDefinition(out)
  }

  uniqueId = 'textAreaRCE'

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
              onClick={this.submitDefinition}
            >
              Import
            </Button>
          </FormFieldGroup>
        </Container>
      </div>
    )
  }
}
