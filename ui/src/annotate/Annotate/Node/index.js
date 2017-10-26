import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import Button from '@instructure/ui-core/lib/components/Button'
import Container from '@instructure/ui-core/lib/components/Container'
import FormFieldGroup from '@instructure/ui-core/lib/components/FormFieldGroup'
import Grid, { GridCol, GridRow } from '@instructure/ui-core/lib/components/Grid'
import Heading from '@instructure/ui-core/lib/components/Heading'
import Link from '@instructure/ui-core/lib/components/Link'
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
      text: PropTypes.string.isRequired,
      definitionNodes: PropTypes.arrayOf(nodeDefinition)
    }).isRequired
  }

  static defaultProps = {
    cancelSelection: () => {},
    createAnnotation: () => {}
  }

  static getTypes (nodes) {
    return nodes.map((n) => n.type)
  }

  static renderColorOptions () {
    return Object.values(colors).map((color) => {
      return <option key={color} value={color}>{capitalizeFirstLetter(color.toLowerCase())}</option>
    })
  }

  state = {
    showTypeMenu: false
  }

  createTag = () => {
    const { node } = this.props
    this.props.createAnnotation(nodeTypes.TAG, node.range, node.text)
  }

  getClassNames () {
    const types = Node.getTypes(this.props.node.definitionNodes)
    return classnames({
      [styles.selection]: types.includes(nodeTypes.SELECTION)
    })
  }

  setTagRef = (node) => {
    this.tagInput = node
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
        defaultShow
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
                    <Button fluidWidth variant="primary">Tag</Button>
                    <Button fluidWidth variant="primary">Highlight</Button>
                  </FormFieldGroup>
                </GridCol>
              </GridRow>
            </Grid>
          </Container>
        </PopoverContent>
      </Popover>
    )
  }

  renderContent () {
    return (
      <Text>
        <span data-id={this.props.node.id} className={this.getClassNames()}>
          {this.props.node.text}
        </span>
      </Text>
    )
  }

  // add data-id to get the internal node detail so we can normalize range offsets
  render () {
    return this.state.showTypeMenu ? this.renderWithPopover() : this.renderContent()
  }
}
