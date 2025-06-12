import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import { HeadingDropdownMenu } from "../../../@/components/tiptap-ui/heading-dropdown-menu";
import { LinkPopover } from "../../../@/components/tiptap-ui/link-popover";
import { ListButton } from "../../../@/components/tiptap-ui/list-button";
import { TextAlignButton } from "../../../@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "../../../@/components/tiptap-ui/undo-redo-button";

import StarterKit from "@tiptap/starter-kit";

export const RichTextEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });
  return (
    <EditorContext.Provider value={{ editor }}>
      <div className="tiptap-button-group" data-orientation="horizontal">
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <LinkPopover />
        <ListButton type="bulletList" />
        <ListButton type="orderedList" />
        <ListButton type="taskList" />
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </div>

      <EditorContent editor={editor} role="presentation" />
    </EditorContext.Provider>
  );
};
