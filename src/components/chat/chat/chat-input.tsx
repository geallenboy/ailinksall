import { ArrowElbowDownRight, Stop, X } from "@phosphor-icons/react";
import { EditorContent } from "@tiptap/react"; // 富文本编辑器组件
import { motion } from "framer-motion"; // 动画库
import { useParams } from "next/navigation"; // 路由参数hook
import { useEffect, useRef, useState } from "react";
import { ArrowDown02Icon, Navigation03Icon } from "@hugeicons/react"; // 图标组件
import { slideUpVariant } from "@/lib/chat/framer-motion"; // 预定义动画效果
import { cn } from "@/lib/utils"; // 类名合并工具函数
import { ChatExamples } from "@/components/chat/chat/chat-examples"; // 聊天示例组件
import { ChatGreeting } from "@/components/chat/chat/chat-greeting"; // 聊天欢迎组件
import { PluginSelect } from "@/components/chat/plugin-select"; // 插件选择组件
import { PromptsBotsCombo } from "@/components/chat/prompts-bots-combo"; // 提示词和机器人组合组件
import { QuickSettings } from "@/components/chat/quick-settings"; // 快速设置组件
import { Button } from "@/components/ui/button"; // UI按钮组件
import { useModelList, useRecordVoice, useScrollToBottom } from "@/hooks"; // 自定义hooks
import {
  useAssistantStore,
  usePreferenceStore,
  useSessionStore,
} from "@/store/chat"; // 状态管理store
import { useAssistantHooks } from "@/hooks/chat/use-assistant-hooks"; // 助手hook
import { useChatHooks } from "@/hooks/chat/use-chat-hooks"; // 聊天相关hook
import { usePreferenceHooks } from "@/hooks/chat"; // 偏好设置hook
import { TAssistant } from "@/types/chat"; // 类型定义
import { defaultPreferences } from "@/config/chat/preferences"; // 默认偏好设置

/**
 * 附件类型定义，用于文件上传
 */
export type TAttachment = {
  file?: File; // 文件对象
  base64?: string; // base64编码的文件内容
};

/**
 * 聊天输入组件
 * 负责处理用户输入、消息发送及相关交互
 */
export const ChatInput = () => {
  // 获取路由参数中的sessionId
  const { sessionId } = useParams();

  // 滚动到底部的功能hook
  const { showButton, scrollToBottom } = useScrollToBottom();

  // 语音录制相关功能和状态
  const {
    renderListeningIndicator, // 渲染监听指示器
    renderRecordingControls, // 渲染录音控制
    recording, // 是否正在录制
    text, // 转录的文本
    transcribing, // 是否正在转录
  } = useRecordVoice();

  // 获取当前会话信息
  const { currentSession } = useSessionStore();

  // 获取助手状态管理
  const { open: openAssistants } = useAssistantStore();

  // 获取选中的助手信息
  const { selectedAssistant } = useAssistantHooks();

  // 获取聊天相关功能
  const {
    editor, // TipTap富文本编辑器实例
    handleRunModel, // 运行模型函数
    openPromptsBotCombo, // 是否打开提示词/机器人组合面板
    setOpenPromptsBotCombo, // 设置提示词/机器人组合面板开关状态
    sendMessage, // 发送消息函数
    isGenerating, // 是否正在生成回复
    contextValue, // 上下文值
    setContextValue, // 设置上下文值
    stopGeneration, // 停止生成函数
  } = useChatHooks();

  // 获取偏好设置
  const { preferences } = usePreferenceStore();
  const { updatePreferences } = usePreferenceHooks();

  // 获取模型列表和助手信息
  const { models, getAssistantByKey, getAssistantIcon } = useModelList();

  // 创建输入框引用
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 选中的助手key状态
  const [selectedAssistantKey, setSelectedAssistantKey] = useState<
    TAssistant["key"]
  >(preferences.defaultAssistant);

  // 确保选中的助手有效，否则重置为默认助手
  useEffect(() => {
    const assistantProps = getAssistantByKey(preferences.defaultAssistant);
    if (assistantProps?.model) {
      setSelectedAssistantKey(preferences.defaultAssistant);
    } else {
      // 如果当前选中的助手无效，重置为默认助手
      updatePreferences({
        defaultAssistant: defaultPreferences.defaultAssistant,
      });
    }
  }, [models, preferences]);

  // 编辑器激活时，将焦点放在末尾
  useEffect(() => {
    if (editor?.isActive) {
      editor.commands.focus("end");
    }
  }, [editor?.isActive]);

  // 会话ID变化时，自动聚焦输入框
  useEffect(() => {
    if (sessionId) {
      inputRef.current?.focus();
    }
  }, [sessionId]);

  // 判断是否为新会话（没有消息）
  const isFreshSession = !currentSession?.messages?.length;

  // 处理语音转录文本
  // 当有语音转录文本时，将其设置到编辑器，并调用模型生成响应
  useEffect(() => {
    if (text) {
      // 清空编辑器内容并设置新文本
      editor?.commands.clearContent();
      editor?.commands.setContent(text);

      // 获取默认助手信息
      const props = getAssistantByKey(preferences.defaultAssistant);
      if (!props) {
        return;
      }

      // 运行模型处理语音输入
      handleRunModel({
        input: text,
        sessionId: sessionId?.toString() ?? "",
        assistant: props.assistant,
      });

      // 处理完后清空编辑器
      editor?.commands.clearContent();
    }
  }, [text]); // 当text变化时执行

  /**
   * 渲染滚动到底部按钮
   * 仅当需要显示按钮且不在录音或转录状态时显示
   */
  const renderScrollToBottom = () => {
    if (showButton && !recording && !transcribing) {
      return (
        <motion.span
          initial={{ scale: 0, opacity: 0 }} // 初始状态
          animate={{ scale: 1, opacity: 1 }} // 动画后状态
          exit={{ scale: 0, opacity: 0 }} // 退出状态
        >
          <Button
            onClick={scrollToBottom} // 点击时滚动到底部
            size="iconSm" // 按钮尺寸
            variant="outline" // 按钮样式
            rounded="full" // 圆形按钮
          >
            <ArrowDown02Icon size={16} strokeWidth="2" /> {/* 向下箭头图标 */}
          </Button>
        </motion.span>
      );
    }
  };

  /**
   * 渲染停止生成按钮
   * 仅在生成响应过程中显示
   */
  const renderStopGeneration = () => {
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
              stopGeneration(); // 点击停止生成
            }}
          >
            <Stop size={16} weight="fill" /> {/* 停止图标 */}
            Stop generation
          </Button>
        </motion.span>
      );
    }
  };

  /**
   * 渲染选中的上下文
   * 显示当前选中的上下文信息，并提供清除按钮
   */
  const renderSelectedContext = () => {
    if (contextValue) {
      return (
        <div className="flex flex-row items-start py-2 ring-1 ring-zinc-100 dark:ring-zinc-700 bg-white border-zinc-100 dark:bg-zinc-800 border dark:border-white/10 text-zinc-700 dark:text-zinc-200 rounded-xl w-full md:w-[700px] lg:w-[720px] justify-start gap-2 pl-2 pr-2">
          <ArrowElbowDownRight size={16} weight="bold" className="mt-1" />{" "}
          {/* 箭头图标 */}
          <p className="w-full overflow-hidden ml-2 text-sm md:text-base line-clamp-2">
            {contextValue} {/* 显示上下文内容 */}
          </p>
          <Button
            size={"iconXS"}
            variant="ghost"
            onClick={() => {
              setContextValue(""); // 清除上下文
            }}
            className="flex-shrink-0 ml-4"
          >
            <X size={14} weight="bold" /> {/* X图标 */}
          </Button>
        </div>
      );
    }
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-end md:justify-center absolute bottom-0 px-2 md:px-4 pb-4 pt-16 right-0 gap-2",
        "bg-gradient-to-t transition-all ease-in-out duration-1000 from-white dark:from-zinc-800 to-transparent from-70% left-0",
        isFreshSession && "top-0" // 如果是新会话，则扩展到顶部
      )}
    >
      {/* 新会话时显示欢迎信息 */}
      {isFreshSession && <ChatGreeting />}

      {/* 控制按钮区域 */}
      <div className="flex flex-row items-center gap-2">
        {renderScrollToBottom()} {/* 滚动到底部按钮 */}
        {renderStopGeneration()} {/* 停止生成按钮 */}
        {renderListeningIndicator()} {/* 语音监听指示器 */}
      </div>

      {/* 主输入区域 */}
      <div className="flex flex-col gap-3 w-full md:w-[700px] lg:w-[720px]">
        {renderSelectedContext()} {/* 选中的上下文 */}
        {/* 编辑器区域 */}
        {editor && (
          <PromptsBotsCombo
            open={openPromptsBotCombo} // 提示词/机器人面板的开关状态
            onBack={() => {
              // 返回按钮回调，清空编辑器并聚焦
              editor?.commands.clearContent();
              editor?.commands.focus("end");
            }}
            onPromptSelect={(prompt) => {
              // 选择提示词回调，将提示词内容设置到编辑器
              editor?.commands.setContent(prompt.content);
              editor?.commands.insertContent("");
              editor?.commands.focus("end");
              setOpenPromptsBotCombo(false);
            }}
            onOpenChange={setOpenPromptsBotCombo} // 开关状态变化回调
          >
            {/* 输入区容器 */}
            <motion.div
              variants={slideUpVariant} // 动画变体
              initial={"initial"} // 初始动画状态
              animate={editor.isEditable ? "animate" : "initial"} // 根据编辑器状态切换动画
              className="flex flex-col items-start gap-0 focus-within:ring-2 ring-zinc-100 dark:ring-zinc-700 ring-offset-2 dark:ring-offset-zinc-800 bg-zinc-50 dark:bg-white/5 w-full dark:border-white/5 rounded-2xl overflow-hidden"
            >
              {/* 输入框区域 */}
              <div className="flex flex-row items-end pl-2 md:pl-3 pr-2 py-2 w-full gap-0">
                {/* TipTap编辑器 */}
                <EditorContent
                  editor={editor}
                  autoFocus
                  onKeyDown={(e) => {
                    console.log("keydown", e.key);
                    if (e.key === "Enter" && !e.shiftKey) {
                      // 按下Enter键且没有按Shift键时发送消息
                      sendMessage();
                    }
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
                  onClick={openAssistants} // 点击打开助手选择器
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
                    variant={!!editor?.getText() ? "default" : "secondary"} // 有文本时使用默认样式，否则使用次要样式
                    disabled={!editor?.getText()} // 没有文本时禁用
                    className={cn(
                      !!editor?.getText() &&
                        "bg-zinc-800 dark:bg-emerald-500/20 text-white dark:text-emerald-400 dark:outline-emerald-400"
                    )}
                    onClick={() => {
                      sendMessage(); // 点击发送消息
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
        )}
      </div>

      {/* 新会话时显示聊天示例 */}
      {isFreshSession && <ChatExamples />}
    </div>
  );
};
