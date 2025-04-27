import { ArrowElbowDownRight, Stop, X } from "@phosphor-icons/react";
import { EditorContent } from "@tiptap/react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown02Icon, Navigation03Icon } from "@hugeicons/react";
import { slideUpVariant } from "@/lib/chat/framer-motion";
import { cn } from "@/lib/utils"; // 类名合并工具函数
import { ChatExamples } from "@/components/chat/chat/chat-examples";
import { ChatGreeting } from "@/components/chat/chat/chat-greeting";
import { PluginSelect } from "@/components/chat/plugin-select";
import { PromptsBotsCombo } from "@/components/chat/prompts-bots-combo";
import { QuickSettings } from "@/components/chat/quick-settings";
import { Button } from "@/components/ui/button";
import { useModelList, useRecordVoice, useScrollToBottom } from "@/hooks";
import {
  useAssistantStore,
  usePreferenceStore,
  useSessionStore,
} from "@/store/chat";
import { useAssistantHooks } from "@/hooks/chat/use-assistant-hooks";
import { useChatHooks } from "@/hooks/chat/use-chat-hooks";
import { usePreferenceHooks } from "@/hooks/chat";
import { TAssistant } from "@/types/chat";
import { defaultPreferences } from "@/config/chat/preferences";
import { debounce } from "lodash";
import { createLogger } from "@/utils/logger";

// 创建组件专用日志记录器
const logger = createLogger("ChatInput");

/**
 * 附件类型定义，用于文件上传
 */
export type TAttachment = {
  file?: File;
  base64?: string;
};

/**
 * 聊天输入组件
 * 负责处理用户输入、消息发送及相关交互
 */
export const ChatInput = memo(() => {
  logger.info("🚀 组件初始化");

  // 记录渲染次数
  const renderCount = useRef(0);
  renderCount.current += 1;
  logger.debug(`第 ${renderCount.current} 次渲染`);

  // 获取路由参数中的sessionId
  const { sessionId } = useParams();
  logger.debug("获取路由参数", { sessionId });

  // 滚动到底部的功能hook
  const { showButton, scrollToBottom } = useScrollToBottom();
  logger.debug("初始化滚动状态", { showScrollButton: showButton });

  // 语音录制相关功能和状态
  const {
    renderListeningIndicator,
    renderRecordingControls,
    recording,
    text,
    transcribing,
  } = useRecordVoice();
  logger.debug("初始化语音录制状态", {
    recording,
    transcribing,
    hasText: !!text,
  });

  // 获取当前会话信息
  const { currentSession } = useSessionStore();
  logger.debug("获取当前会话", {
    sessionId: currentSession?.id,
    messageCount: currentSession?.messages?.length,
  });

  // 获取助手状态管理
  const { open: openAssistants } = useAssistantStore();

  // 获取选中的助手信息
  const { selectedAssistant } = useAssistantHooks();
  logger.debug("获取选中助手", {
    assistantName: selectedAssistant?.assistant.name,
    assistantKey: selectedAssistant?.assistant.key,
  });

  // 获取聊天相关功能
  const {
    editor,
    handleRunModel,
    openPromptsBotCombo,
    setOpenPromptsBotCombo,
    sendMessage,
    isGenerating,
    contextValue,
    setContextValue,
    stopGeneration,
  } = useChatHooks();
  logger.debug("获取聊天功能状态", {
    hasEditor: !!editor,
    isGenerating,
    hasContextValue: !!contextValue,
    openPromptsBotCombo,
  });

  // 获取偏好设置
  const { preferences } = usePreferenceStore();
  const { updatePreferences } = usePreferenceHooks();
  logger.debug("获取偏好设置", {
    defaultAssistant: preferences.defaultAssistant,
    messageLimit: preferences.messageLimit,
  });

  // 获取模型列表和助手信息
  const { models, getAssistantByKey, getAssistantIcon } = useModelList();
  logger.debug("获取模型列表", { modelCount: models.length });

  // 创建输入框引用
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 选中的助手key状态
  const [selectedAssistantKey, setSelectedAssistantKey] = useState<
    TAssistant["key"]
  >(preferences.defaultAssistant);
  logger.debug("设置初始助手Key", { selectedAssistantKey });

  // 确保选中的助手有效，否则重置为默认助手
  useEffect(() => {
    logger.debug("检查选中助手有效性", {
      preferredAssistant: preferences.defaultAssistant,
    });

    const assistantProps = getAssistantByKey(preferences.defaultAssistant);
    if (assistantProps?.model) {
      logger.debug("使用有效的首选助手", {
        assistantKey: preferences.defaultAssistant,
      });
      setSelectedAssistantKey(preferences.defaultAssistant);
    } else {
      // 如果当前选中的助手无效，重置为默认助手
      logger.warn("首选助手无效，重置为默认助手", {
        invalid: preferences.defaultAssistant,
        default: defaultPreferences.defaultAssistant,
      });
      updatePreferences({
        defaultAssistant: defaultPreferences.defaultAssistant,
      });
    }
  }, [models, preferences, getAssistantByKey, updatePreferences]);

  // 编辑器激活时，将焦点放在末尾
  useEffect(() => {
    if (editor?.isActive) {
      logger.debug("编辑器激活，聚焦到末尾");
      editor.commands.focus("end");
    }
  }, [editor?.isActive]);

  // 会话ID变化时，自动聚焦输入框
  useEffect(() => {
    if (sessionId) {
      logger.debug("会话ID变化，聚焦输入框", { sessionId });
      inputRef.current?.focus();
    }
  }, [sessionId]);

  // 使用useMemo缓存计算结果
  const isFreshSession = useMemo(() => {
    const result = !currentSession?.messages?.length;
    logger.debug("计算是否为新会话", {
      isFreshSession: result,
      messageCount: currentSession?.messages?.length,
    });
    return result;
  }, [currentSession?.messages?.length]);

  // 防抖处理发送消息
  const debouncedSendMessage = useCallback(
    debounce(() => {
      logger.info("🚀 触发防抖发送消息");
      sendMessage();
    }, 300),
    [sendMessage]
  );

  // 处理语音转录文本
  useEffect(() => {
    if (!text || !editor) return;

    logger.info("处理语音转录文本", {
      textLength: text.length,
      hasEditor: !!editor,
    });

    const processVoiceText = async () => {
      logger.debug("清空编辑器内容");
      editor.commands.clearContent();

      logger.debug("设置语音转录文本到编辑器");
      editor.commands.setContent(text);

      const props = getAssistantByKey(preferences.defaultAssistant);
      if (!props) {
        logger.warn("找不到默认助手", {
          defaultAssistant: preferences.defaultAssistant,
        });
        return;
      }

      logger.info("使用语音转录文本运行模型", {
        textLength: text.length,
        assistant: props.assistant.name,
        sessionId: sessionId?.toString() ?? "",
      });

      await handleRunModel({
        input: text,
        sessionId: sessionId?.toString() ?? "",
        assistant: props.assistant,
      });

      logger.debug("模型运行后清空编辑器");
      editor.commands.clearContent();
    };

    processVoiceText();
  }, [
    text,
    editor,
    getAssistantByKey,
    handleRunModel,
    preferences.defaultAssistant,
    sessionId,
  ]);

  // 提取 useCallback 到组件顶层
  const handleBackClick = useCallback(() => {
    logger.debug("点击返回按钮");
    editor?.commands.clearContent();
    editor?.commands.focus("end");
  }, [editor]);

  const handlePromptSelect = useCallback(
    (prompt: any) => {
      logger.info("选择提示词", {
        promptId: prompt.id,
        contentLength: prompt.content?.length,
      });

      if (!editor) {
        logger.warn("选择提示词时编辑器不可用");
        return;
      }

      editor.commands.setContent(prompt.content);
      editor.commands.insertContent("");
      editor.commands.focus("end");
      setOpenPromptsBotCombo(false);
    },
    [editor, setOpenPromptsBotCombo]
  );

  // 添加清除上下文的回调函数
  const handleClearContext = useCallback(() => {
    logger.info("清除上下文");
    setContextValue("");
  }, [setContextValue]);

  /**
   * 渲染滚动到底部按钮
   * 仅当需要显示按钮且不在录音或转录状态时显示
   */
  const renderScrollToBottom = useCallback(() => {
    const shouldShow = showButton && !recording && !transcribing;
    logger.debug("渲染滚动到底部按钮", {
      shouldShow,
      showButton,
      recording,
      transcribing,
    });

    if (!shouldShow) return null;

    return (
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
      >
        <Button
          onClick={() => {
            logger.debug("点击滚动到底部按钮");
            scrollToBottom();
          }}
          size="iconSm"
          variant="outline"
          rounded="full"
        >
          <ArrowDown02Icon size={16} strokeWidth="2" />
        </Button>
      </motion.span>
    );
  }, [showButton, recording, transcribing, scrollToBottom]);

  /**
   * 渲染停止生成按钮
   * 仅在生成响应过程中显示
   */
  const renderStopGeneration = useCallback(() => {
    logger.debug("渲染停止生成按钮", { isGenerating });

    if (isGenerating) {
      return (
        <motion.span
          className="mb-2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <Button
            rounded="full"
            className="dark:bg-zinc-800 dark:border dark:text-white dark:border-white/10"
            onClick={() => {
              logger.info("点击停止生成按钮");
              stopGeneration();
            }}
          >
            <Stop size={16} weight="fill" />
            Stop generation
          </Button>
        </motion.span>
      );
    }
    return null;
  }, [isGenerating, stopGeneration]);

  /**
   * 渲染选中的上下文
   * 显示当前选中的上下文信息，并提供清除按钮
   */
  const renderSelectedContext = useCallback(() => {
    logger.debug("渲染选中的上下文", {
      hasContext: !!contextValue,
      contextLength: contextValue?.length,
    });

    if (contextValue) {
      return (
        <div className="flex flex-row items-start py-2 ring-1 ring-zinc-100 dark:ring-zinc-700 bg-white border-zinc-100 dark:bg-zinc-800 border dark:border-white/10 text-zinc-700 dark:text-zinc-200 rounded-xl w-full md:w-[700px] lg:w-[720px] justify-start gap-2 pl-2 pr-2">
          <ArrowElbowDownRight size={16} weight="bold" className="mt-1" />
          <p className="w-full overflow-hidden ml-2 text-sm md:text-base line-clamp-2">
            {contextValue}
          </p>
          <Button
            size={"iconXS"}
            variant="ghost"
            onClick={() => {
              logger.debug("点击清除上下文按钮");
              handleClearContext();
            }}
            className="flex-shrink-0 ml-4"
          >
            <X size={14} weight="bold" />
          </Button>
        </div>
      );
    }
    return null;
  }, [contextValue, handleClearContext]);

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      logger.debug("键盘事件", { key: e.key, shiftKey: e.shiftKey });

      if (e.key === "Enter" && !e.shiftKey) {
        logger.info("检测到Enter键发送消息");
        e.preventDefault();
        debouncedSendMessage();
      }
    },
    [debouncedSendMessage]
  );

  logger.info("✅ 完成组件渲染准备");

  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-end md:justify-center absolute bottom-0 px-2 md:px-4 pb-4 pt-16 right-0 gap-2",
        "bg-gradient-to-t transition-all ease-in-out duration-1000 from-white dark:from-zinc-800 to-transparent from-70% left-0",
        isFreshSession && "top-0"
      )}
    >
      {/* 新会话时显示欢迎信息 */}
      {isFreshSession && (
        <>
          {logger.debug("渲染欢迎信息 (新会话)")}
          <ChatGreeting />
        </>
      )}

      {/* 控制按钮区域 */}
      <div className="flex flex-row items-center gap-2">
        {renderScrollToBottom()}
        {renderStopGeneration()}
        {renderListeningIndicator()}
      </div>

      {/* 主输入区域 */}
      <div className="flex flex-col gap-3 w-full md:w-[700px] lg:w-[720px]">
        {contextValue && renderSelectedContext()}
        {/* 编辑器区域 */}
        {editor && (
          <>
            {logger.debug("渲染编辑器区域")}
            <PromptsBotsCombo
              open={openPromptsBotCombo}
              onBack={handleBackClick}
              onPromptSelect={handlePromptSelect}
              onOpenChange={(open) => {
                logger.debug("提示词/机器人面板状态变化", { open });
                setOpenPromptsBotCombo(open);
              }}
            >
              {/* 输入区容器 */}
              <motion.div
                variants={slideUpVariant}
                initial={"initial"}
                animate={editor.isEditable ? "animate" : "initial"}
                className="flex flex-col items-start gap-0 focus-within:ring-2 ring-zinc-100 dark:ring-zinc-700 ring-offset-2 dark:ring-offset-zinc-800 bg-zinc-50 dark:bg-white/5 w-full dark:border-white/5 rounded-2xl overflow-hidden"
              >
                {/* 输入框区域 */}
                <div className="flex flex-row items-end pl-2 md:pl-3 pr-2 py-2 w-full gap-0">
                  {/* TipTap编辑器 */}
                  <EditorContent
                    editor={editor}
                    autoFocus
                    onKeyDown={(e) => {
                      handleKeyDown(e);
                    }}
                    className="w-full min-h-8 text-sm md:text-base max-h-[120px] overflow-y-auto outline-none focus:outline-none p-1 [&>*]:outline-none no-scrollbar [&>*]:no-scrollbar [&>*]:leading-6 wysiwyg cursor-text"
                  />

                  {/* 非生成状态时显示录音控制 */}
                  {!isGenerating && renderRecordingControls()}
                </div>

                {/* 底部工具栏 */}
                <div className="flex flex-row items-center w-full justify-start gap-0 pt-1 pb-2 px-2">
                  {/* 助手选择按钮 */}
                  <Button
                    variant={"ghost"}
                    onClick={() => {
                      logger.debug("点击打开助手选择器");
                      openAssistants();
                    }}
                    className={cn("pl-1 pr-3 gap-2 text-xs md:text-sm")}
                    size="sm"
                  >
                    {/* 显示选中助手的图标和名称 */}
                    {selectedAssistant!.assistant.key &&
                      getAssistantIcon(selectedAssistant!.assistant.key)}
                    {selectedAssistant?.assistant.name}
                  </Button>

                  {/* 插件选择 */}
                  <PluginSelect selectedAssistantKey={selectedAssistantKey} />

                  {/* 快速设置 */}
                  <QuickSettings />

                  {/* 弹性空间 */}
                  <div className="flex-1"></div>

                  {/* 发送按钮 - 仅在非生成状态显示 */}
                  {!isGenerating && (
                    <Button
                      size="iconSm"
                      rounded="full"
                      variant={!!editor?.getText() ? "default" : "secondary"}
                      disabled={!editor?.getText()}
                      className={cn(
                        !!editor?.getText() &&
                          "bg-zinc-800 dark:bg-emerald-500/20 text-white dark:text-emerald-400 dark:outline-emerald-400"
                      )}
                      onClick={() => {
                        logger.info("点击发送按钮", {
                          textLength: editor?.getText()?.length,
                        });
                        debouncedSendMessage();
                      }}
                    >
                      <Navigation03Icon
                        size={18}
                        variant="stroke"
                        strokeWidth="2"
                      />
                    </Button>
                  )}
                </div>
              </motion.div>
            </PromptsBotsCombo>
          </>
        )}
      </div>

      {/* 新会话时显示聊天示例 */}
      {isFreshSession && (
        <>
          {logger.debug("渲染聊天示例 (新会话)")}
          <ChatExamples />
        </>
      )}
    </div>
  );
});

ChatInput.displayName = "ChatInput";
