import { DisableEnter, ShiftEnterToLineBreak } from "@/lib/chat/tiptap-extension";
import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { Highlight } from "@tiptap/extension-highlight";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Text } from "@tiptap/extension-text";
import { Editor, useEditor } from "@tiptap/react";
import { logger } from "@/lib/logger";

export const createChatEditor = (
    setOpenPromptsBotCombo: (value: boolean) => void
) => {
    return useEditor({
        extensions: [
            Document,
            Paragraph,
            Text,
            Placeholder.configure({
                placeholder: "输入 / 或询问任何问题...",
            }),
            ShiftEnterToLineBreak,
            Highlight.configure({
                HTMLAttributes: {
                    class: "prompt-highlight",
                },
            }),
            HardBreak,
            DisableEnter,
        ],
        content: ``,
        autofocus: true,
        onTransaction(props) {
            const { editor } = props;
            const text = editor.getText();
            const html = editor.getHTML();

            logger.debug("Editor transaction", { text, html });

            if (text === "/") {
                setOpenPromptsBotCombo(true);
            } else {
                const newHTML = html.replace(
                    /{{{{(.*?)}}}}/g,
                    ` <mark class="prompt-highlight">$1</mark> `
                );

                if (newHTML !== html) {
                    editor.commands.setContent(newHTML, true, {
                        preserveWhitespace: true,
                    });
                }
                setOpenPromptsBotCombo(false);
            }
        },
        parseOptions: {
            preserveWhitespace: "full",
        },
    });
};

export const clearEditorContent = (editor: Editor | null) => {
    if (!editor) return;

    editor.commands.clearContent();
    editor.commands.insertContent("");
    editor.commands.focus("end");

    logger.debug("Editor content cleared");
};