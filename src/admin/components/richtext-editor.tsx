import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import { HeadingDropdownMenu } from "../@/components/tiptap-ui/heading-dropdown-menu";
import { LinkPopover } from "../@/components/tiptap-ui/link-popover";
import { ListButton } from "../@/components/tiptap-ui/list-button";
import { TextAlignButton } from "../@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "../@/components/tiptap-ui/undo-redo-button";
import { Separator } from "../@/components/tiptap-ui-primitive/separator";
import { MarkButton } from "../@/components/tiptap-ui/mark-button";
import { Content } from "@tiptap/core";

import "../@/styles/tiptap-extensions-styles.scss";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";

export const RichTextEditor = ({
  content,
  onChange,
}: {
  content: Content;
  onChange: (html: string) => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3, 4],
      }),
      BulletList,
      OrderedList,
      ListItem,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Link.configure({
        openOnClick: true,
        defaultProtocol: "https",
      }),
      Bold,
      Italic,
      Underline,
      Strike,
      Superscript,
      Subscript,
    ],
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] w-full rounded-md border border-input bg-ui-bg-field hover:bg-ui-bg-field-hover shadow-borders-base px-3 py-2 ring-offset-background focus-visible:outline-none ",
      },
    },
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
        <Separator />

        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="underline" />
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
        <Separator />

        <ListButton type="bulletList" />
        <ListButton type="orderedList" />
        <Separator />

        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
        <Separator />

        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </div>

      <EditorContent
        placeholder="Add your rich text content"
        editor={editor}
        role="presentation"
      />
    </EditorContext.Provider>
  );
};
