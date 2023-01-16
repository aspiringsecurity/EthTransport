import {
  getPreventDefaultHandler,
  isMarkActive,
  toggleMark,
  useEventPlateId,
  usePlateEditorState,
} from '@udecode/plate-core';
import ToolbarButton from './ToolbarButton';

/**
 * Toolbar button to toggle the mark of the leaves in selection.
 */
export default function MarkToolbarButton ({
  id,
  type,
  clear,
  ...props
}) {
  const editor = usePlateEditorState(useEventPlateId(id));

  return (
    <ToolbarButton
      active={!!editor && editor.selection && isMarkActive(editor, type)}
      onMouseDown={
        editor
          ? getPreventDefaultHandler(toggleMark, editor, { key: type, clear })
          : undefined
      }
      {...props}
    />
  );
};