import {
  useEventPlateId,
  usePlateEditorState,
  getPluginType,
} from '@udecode/plate-core';
import {
  ELEMENT_H1, ELEMENT_H2, ELEMENT_H3, ELEMENT_H4, ELEMENT_H5, ELEMENT_H6
} from '@udecode/plate-heading'
import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import {
  MARK_BOLD, MARK_CODE, MARK_ITALIC, MARK_STRIKETHROUGH, MARK_SUBSCRIPT, MARK_SUPERSCRIPT, MARK_UNDERLINE
} from '@udecode/plate-basic-marks'
import MarkToolbarButton from './MarkToolbarButton';
import BlockToolbarButton from './BlockToolbarButton';

/**
 * Toolbar button to toggle the mark of the leaves in selection.
 */
export default function Toolbar({
  id,
  className = 'flex flex-row divide-x divide-slate-300',
  ...props
}) {
  const editor = usePlateEditorState(useEventPlateId(id));

  return (
    <div className={className} {...props}>
      <MarkToolbarButton type={getPluginType(editor, MARK_BOLD)}>
        <span className="font-bold">B</span>
      </MarkToolbarButton>
      <MarkToolbarButton type={getPluginType(editor, MARK_ITALIC)}>
        <span className="italic font-bold">I</span>
      </MarkToolbarButton>
      <MarkToolbarButton type={getPluginType(editor, MARK_UNDERLINE)}>
        <span className="underline">U</span>
      </MarkToolbarButton>
      <MarkToolbarButton type={getPluginType(editor, MARK_STRIKETHROUGH)}>
        <span className="line-through">S</span>
      </MarkToolbarButton>
      <MarkToolbarButton type={getPluginType(editor, MARK_CODE)}>
        <span className="font-bold text-xs leading-loose">&lt;/&gt;</span>
      </MarkToolbarButton>
      <BlockToolbarButton type={getPluginType(editor, ELEMENT_BLOCKQUOTE)}>
        <span className="text-xl">&#8221;</span>
      </BlockToolbarButton>
      <BlockToolbarButton type={getPluginType(editor, ELEMENT_H1)}>
        <span className="font-bold">H1</span>
      </BlockToolbarButton>
      <BlockToolbarButton type={getPluginType(editor, ELEMENT_H2)}>
        <span className="font-bold">H2</span>
      </BlockToolbarButton>
      <BlockToolbarButton type={getPluginType(editor, ELEMENT_H3)}>
        <span className="font-bold">H3</span>
      </BlockToolbarButton>
      <BlockToolbarButton type={getPluginType(editor, ELEMENT_H4)}>
        <span className="font-bold">H4</span>
      </BlockToolbarButton>
      <BlockToolbarButton type={getPluginType(editor, ELEMENT_H5)}>
        <span className="font-bold">H5</span>
      </BlockToolbarButton>
      <BlockToolbarButton type={getPluginType(editor, ELEMENT_H6)}>
        <span className="font-bold">H6</span>
      </BlockToolbarButton>

    </div >
  );
};