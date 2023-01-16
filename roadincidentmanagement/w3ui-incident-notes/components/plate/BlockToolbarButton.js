import {
  getPreventDefaultHandler,
  someNode,
  toggleNodeType,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-core';
import ToolbarButton from './ToolbarButton';

/**
 * Toolbar button to toggle the type of elements in selection.
 */
export default function BlockToolbarButton({
  id,
  type,
  inactiveType,
  active,
  ...props
}) {
  const editor = usePlateEditorState(useEventPlateId(id));

  return (
    <ToolbarButton
      active={
        active ?? (!!(editor && editor.selection && someNode(editor, { match: { type } })))
      }
      onMouseDown={
        editor &&
        getPreventDefaultHandler(toggleNodeType, editor, {
          activeType: type,
          inactiveType,
        })
      }
      {...props}
    />
  );
};