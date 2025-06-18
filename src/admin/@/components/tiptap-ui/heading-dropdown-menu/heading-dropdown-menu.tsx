import * as React from "react";
import { isNodeSelection, type Editor } from "@tiptap/react";

import Button, {
  ButtonProps,
} from "../../tiptap-ui-primitive/button/button.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../tiptap-ui-primitive/dropdown-menu/dropdown-menu.js";
import HeadingButton, {
  getFormattedHeadingName,
  headingIcons,
  Level,
} from "../heading-button/heading-button.js";
import { isNodeInSchema } from "../../../lib/tiptap-utils.js";
import { useTiptapEditor } from "../../../hooks/use-tiptap-editor.js";
import { ChevronDownIcon } from "../../tiptap-icons/chevron-down-icon.js";
import { HeadingIcon } from "../../tiptap-icons/heading-icon.js";

export interface HeadingDropdownMenuProps extends Omit<ButtonProps, "type"> {
  editor?: Editor | null;
  levels?: Level[];
  hideWhenUnavailable?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function HeadingDropdownMenu({
  editor: providedEditor,
  levels = [1, 2, 3, 4, 5, 6],
  hideWhenUnavailable = false,
  onOpenChange,
  ...props
}: HeadingDropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const editor = useTiptapEditor(providedEditor);

  const headingInSchema = isNodeInSchema("heading", editor);

  const handleOnOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  const getActiveIcon = React.useCallback(() => {
    if (!editor) return <HeadingIcon className="tiptap-button-icon" />;

    const activeLevel = levels.find((level) =>
      editor.isActive("heading", { level })
    ) as Level | undefined;

    if (!activeLevel) return <HeadingIcon className="tiptap-button-icon" />;

    const ActiveIcon = headingIcons[activeLevel];
    return <ActiveIcon className="tiptap-button-icon" />;
  }, [editor, levels]);

  const canToggleAnyHeading = React.useCallback((): boolean => {
    if (!editor) return false;
    return levels.some((level) =>
      editor.can().toggleNode("heading", "paragraph", { level })
    );
  }, [editor, levels]);

  const isDisabled = !canToggleAnyHeading();
  const isAnyHeadingActive = editor?.isActive("heading") ?? false;

  const show = React.useMemo(() => {
    if (!headingInSchema || !editor) {
      return false;
    }

    if (hideWhenUnavailable) {
      if (isNodeSelection(editor.state.selection) || !canToggleAnyHeading()) {
        return false;
      }
    }

    return true;
  }, [headingInSchema, editor, hideWhenUnavailable, canToggleAnyHeading]);

  if (!show || !editor || !editor.isEditable) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOnOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          disabled={isDisabled}
          data-style="ghost"
          data-active-state={isAnyHeadingActive ? "on" : "off"}
          data-disabled={isDisabled}
          role="button"
          tabIndex={-1}
          aria-label="Format text as heading"
          aria-pressed={isAnyHeadingActive}
          tooltip="Heading"
          {...props}
        >
          {getActiveIcon()}
          <ChevronDownIcon className="tiptap-button-dropdown-small" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        portal={false}
        className="shadow-elevation-flyout bg-ui-bg-base z-50 rounded-[8px] p-1 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
      >
        <DropdownMenuGroup>
          {levels.map((level) => (
            <DropdownMenuItem key={`heading-${level}`} asChild>
              <HeadingButton
                editor={editor}
                level={level}
                text={getFormattedHeadingName(level)}
                tooltip={""}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default HeadingDropdownMenu;
