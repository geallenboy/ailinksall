"use client";

import { useChatStore } from "@/store/chat/chat-store";
import { useEditor } from "@tiptap/react";
import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Highlight } from "@tiptap/extension-highlight";
import { HardBreak } from "@tiptap/extension-hard-break";
import {
  DisableEnter,
  ShiftEnterToLineBreak,
} from "@/lib/chat/tiptap-extension";

/**
 * 聊天编辑器Hook
 * 提供编辑器实例和相关控制方法
 */
export function useChatEditor() {
  // 获取提示词面板控制状态
  const { setOpenPromptsBotCombo } = useChatStore();

  // 创建编辑器实例
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: "Type / or Ask anything...",
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

      // 输入 / 时打开提示词面板
      if (text === "/") {
        setOpenPromptsBotCombo(true);
      } else {
        // 处理高亮语法
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

  return { editor };
}
