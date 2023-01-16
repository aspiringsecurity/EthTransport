import { useState } from 'react'
import { Plate, PlateProvider, createPlugins } from '@udecode/plate-core';
import {
  createHeadingPlugin,
  ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_H4, ELEMENT_H5, ELEMENT_H6
} from '@udecode/plate-heading'
import { createParagraphPlugin, ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph'
import { createBlockquotePlugin, ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import {
  createBasicMarksPlugin,
  MARK_BOLD, MARK_CODE, MARK_ITALIC, MARK_STRIKETHROUGH, MARK_SUBSCRIPT, MARK_SUPERSCRIPT, MARK_UNDERLINE
} from '@udecode/plate-basic-marks'

import Toolbar from './Toolbar'
import { SmallLoading } from '../Loading'
import Button from "../Button"

const editableProps = {
  placeholder: 'Type...',
};

const plugins = createPlugins([
  createHeadingPlugin(),
  createParagraphPlugin(),
  createBlockquotePlugin(),
  createBasicMarksPlugin(),
], {
  components: {
    [ELEMENT_H1]: ({ attributes, children }) => <h1 {...attributes} className="text-5xl">{children}</h1>,
    [ELEMENT_H2]: ({ attributes, children }) => <h2 {...attributes} className="text-4xl">{children}</h2>,
    [ELEMENT_H3]: ({ attributes, children }) => <h3 {...attributes} className="text-3xl">{children}</h3>,
    [ELEMENT_H4]: ({ attributes, children }) => <h4 {...attributes} className="text-2xl">{children}</h4>,
    [ELEMENT_H5]: ({ attributes, children }) => <h5 {...attributes} className="text-xl">{children}</h5>,
    [ELEMENT_H6]: ({ attributes, children }) => <h6 {...attributes} className="text-base">{children}</h6>,
    [ELEMENT_PARAGRAPH]: ({ attributes, children }) => <p {...attributes} className="text-base">{children}</p>,
    [ELEMENT_BLOCKQUOTE]: ({ attributes, children }) => <blockquote {...attributes} className="text-base text-gray-400 border-l-2 border-solid border-gray-400 p-2">{children}</blockquote>,
    [MARK_BOLD]: ({ attributes, children }) => <b {...attributes} className="font-bold">{children}</b>,
    [MARK_CODE]: ({ attributes, children }) => <code {...attributes} className="font-mono">{children}</code>,
    [MARK_ITALIC]: ({ attributes, children }) => <i {...attributes} className="italic">{children}</i>,
    [MARK_STRIKETHROUGH]: ({ attributes, children }) => <strike {...attributes} className="line-through">{children}</strike>,
    [MARK_SUBSCRIPT]: ({ attributes, children }) => <sub {...attributes}>{children}</sub>,
    [MARK_SUPERSCRIPT]: ({ attributes, children }) => <sup {...attributes}>{children}</sup>,
    [MARK_UNDERLINE]: ({ attributes, children }) => <u {...attributes} className="underline">{children}</u>,
  }
})

const readOnlyEditableProps = {
  readOnly: true
};

export function ReadOnlyEditor(props) {
  return (
    <div className="p-8 ">
      <Plate editableProps={readOnlyEditableProps} plugins={plugins} {...props} />
    </div>
  )
}

export function EditorProvider({ plugins = plugins, ...props }) {
  return <PlateProvider plugins={plugins} {...props} />
}

export default function Editor({ onChange, onPublish }) {
  const [publishing, setPublishing] = useState(false)
  async function onClickPublish() {
    setPublishing(true)
    onPublish && await onPublish()
    setPublishing(false)
  }
  return (
    <PlateProvider
      onChange={onChange}
      plugins={plugins}
    >
      <div className="flex flex-col-reverse sm:flex-row items-center border-b-gray-300 border-b-2">
        <Toolbar className="flex flex-row px-6 py-2" />
        <Button onClick={onClickPublish}>
          Publish Note {publishing && <SmallLoading />}
        </Button>
      </div>
      <div className="px-8 pt-2">
        <Plate
          editableProps={editableProps} />
      </div>
    </PlateProvider>
  )
}
