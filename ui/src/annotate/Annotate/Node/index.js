import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import Button from '@instructure/ui-core/lib/components/Button'
import Container from '@instructure/ui-core/lib/components/Container'
import FormFieldGroup from '@instructure/ui-core/lib/components/FormFieldGroup'
import Grid, { GridCol, GridRow } from '@instructure/ui-core/lib/components/Grid'
import Heading from '@instructure/ui-core/lib/components/Heading'
import Link from '@instructure/ui-core/lib/components/Link'
import List, { ListItem } from '@instructure/ui-core/lib/components/List'
import Popover, { PopoverContent, PopoverTrigger } from '@instructure/ui-core/lib/components/Popover'
import ScreenReaderContent from '@instructure/ui-core/lib/components/ScreenReaderContent'
import Select from '@instructure/ui-core/lib/components/Select'
import TextInput from '@instructure/ui-core/lib/components/TextInput'
import Text from '@instructure/ui-core/lib/components/Text'
import themeable from '@instructure/ui-themeable'
import capitalizeFirstLetter from '@instructure/ui-utils/lib/capitalizeFirstLetter'

import * as nodeTypes from '../../nodeTypes'
import * as colors from '../../colors'
import { nodeDefinition } from '../../../react/customPropTypes'

import styles from './styles.css'
import theme from './theme'

@themeable(theme, styles)
export default class Node extends Component {
  static propTypes = {
    cancelSelection: PropTypes.func,
    createAnnotation: PropTypes.func,
    node: PropTypes.shape({
      id: PropTypes.number.isRequired,
      range: PropTypes.arrayOf(PropTypes.number),
      selectionRange: PropTypes.arrayOf(PropTypes.number),
      text: PropTypes.string.isRequired,
      definitionNodes: PropTypes.arrayOf(nodeDefinition)
    }).isRequired
  }

  static defaultProps = {
    cancelSelection: () => {},
    createAnnotation: () => {}
  }

  static renderColorOptions () {
    return Object.values(colors).map((color) => {
      return <option key={color} value={color}>{Node.normalizeText(color)}</option>
    })
  }

  static normalizeText (text) {
    return capitalizeFirstLetter(text.toLowerCase())
  }

  static getTypes (nodes) {
    return nodes.map((n) => n.type).filter((type) => type !== nodeTypes.TEXT)
  }

  state = {
    showTypeMenu: false,
    show: true
  }

  setSelectRef = (node) => {
    this.highlightColorSelect = node
  }

  setTagRef = (node) => {
    this.tagInput = node
  }

  getClassNames () {
    const classes = new Set()
    this.props.node.definitionNodes.forEach((defNode) => {
      if (defNode.type === nodeTypes.TEXT) { return }
      if (defNode.type === nodeTypes.HIGHLIGHT) {
        classes.add(styles[defNode.data.color.toLowerCase()])
      } else {
        classes.add(styles[defNode.type.toLowerCase()])
      }
    })
    return classes.length > 1 ? styles.mixedTags : classnames(classes.toArray())
  }

  createNode = (type, data) => {
    const { node } = this.props
    this.setState({ show: false })
    this.props.createAnnotation(type, node.selectionRange, data)
  }

  createTag = () => {
    this.createNode(nodeTypes.TAG, { label: this.tagInput.value })
  }

  createHighlight = () => {
    this.createNode(nodeTypes.HIGHLIGHT, { color: this.highlightColorSelect.value })
  }

  showTypeMenu = () => {
    this.setState({ showTypeMenu: true })
  }

  /* eslint-disable jsx-a11y/anchor-is-valid */
  renderWithPopover () {
    return (
      <Popover
        applicationElement={() => document.getElementById('app')}
        closeButtonLabel="Close"
        show={this.state.show}
        label="Select Type Popover"
        offsetX={this.props.node.text.length < 3 ? '16px' : undefined}
        on="click"
        onToggle={this.props.cancelSelection}
        shouldContainFocus
        shouldReturnFocus
      >
        <PopoverTrigger as="span">
          <Link variant="inverse">
            {this.renderContent()}
          </Link>
        </PopoverTrigger>
        <PopoverContent>
          <Container padding="small" display="block" as="form">
            <Grid colSpacing="small" rowSpacing="small">
              <GridRow>
                <GridCol>
                  <Heading level="h3" as="h1">Create Annotation</Heading>
                </GridCol>
              </GridRow>
              <GridRow>
                <GridCol>
                  <FormFieldGroup
                    description={<ScreenReaderContent>Annotation Inputs</ScreenReaderContent>}
                    layout="stacked"
                    rowSpacing="small"
                  >
                    <TextInput
                      label={<ScreenReaderContent>Enter Tag Label</ScreenReaderContent>}
                      inputRef={this.setTagRef}
                    />
                    <Select
                      layout="inline"
                      label={<ScreenReaderContent>Select Highlight Color</ScreenReaderContent>}
                      width="15rem"
                      ref={this.setSelectRef}
                    >
                      {Node.renderColorOptions()}
                    </Select>
                  </FormFieldGroup>
                </GridCol>
                <GridCol>
                  <FormFieldGroup
                    description={<ScreenReaderContent>Buttons to Submit Annotation</ScreenReaderContent>}
                    layout="stacked"
                    rowSpacing="small"
                  >
                    <Button onClick={this.createTag} fluidWidth variant="primary">Tag</Button>
                    <Button onClick={this.createHighlight} fluidWidth variant="primary">Highlight</Button>
                  </FormFieldGroup>
                </GridCol>
              </GridRow>
            </Grid>
          </Container>
        </PopoverContent>
      </Popover>
    )
  }

  renderTypesOnNode () {
    const types = new Set(Node.getTypes(this.props.node.definitionNodes))
    return (
      <List>
        {
          types.toArray().map((type) => {
            return (
              <ListItem key={type}>
                <Text>
                  {Node.normalizeText(type)}
                </Text>
              </ListItem>
            )
          })
        }
      </List>
    )
  }

  renderMultiTypePopover () {
    return (
      <Popover
        applicationElement={() => document.getElementById('app')}
        closeButtonLabel="Close"
        label="Display of Types of Annotations"
        offsetX={this.props.node.text.length < 3 ? '16px' : undefined}
        on="click"
        shouldContainFocus
        shouldReturnFocus
      >
        <PopoverTrigger as="span">
          <Link variant="inverse">
            {this.renderPlainTextNode()}
          </Link>
        </PopoverTrigger>
        <PopoverContent>
          <Container margin="small x-large small small" padding="none" display="block" as="form">
            <FormFieldGroup
              description={<ScreenReaderContent>Annotations</ScreenReaderContent>}
              layout="stacked"
              rowSpacing="small"
            >
              <Heading level="h3" as="h1">Annotations</Heading>
              {this.renderTypesOnNode()}
            </FormFieldGroup>
          </Container>
        </PopoverContent>
      </Popover>
    )
  }

  renderPlainTextNode () {
    /* eslint-disable react/no-danger */
    return (
      <Text>
        <span
          data-id={this.props.node.id}
          className={this.getClassNames()}
          dangerouslySetInnerHTML={{ __html: this.props.node.text }}
        />
      </Text>
    )
  }

  renderContent () {
    return this.props.node.definitionNodes.length > 1
      ? this.renderMultiTypePopover()
      : this.renderPlainTextNode()
  }

  // add data-id to get the internal node detail so we can normalize range offsets
  render () {
    return this.state.showTypeMenu ? this.renderWithPopover() : this.renderContent()
  }
}
