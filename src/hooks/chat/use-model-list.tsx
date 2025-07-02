import { ModelIcon } from "@/components/chat/icons/model-icon";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { ChatDeepSeek } from "@langchain/deepseek";
import { useQuery } from "@tanstack/react-query";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { useMemo } from "react";
import { useAssistantsQuery } from "../query/use-assistants-query";
import { defaultPreferences } from "@/config/chat/preferences";
import { TAssistant, TBaseModel, TModel, TModelKey } from "@/types/chat";
import { usePreferenceStore } from "@/store/chat";

export const useModelList = () => {
  const { preferences } = usePreferenceStore();
  const assistantsProps = useAssistantsQuery();
  const ollamaModelsQuery = useQuery({
    queryKey: ["ollama-models"],
    queryFn: async () => {
      try {
        // 添加超时处理
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

        const response = await fetch(`${preferences.ollamaBaseUrl}/api/tags`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Ollama API 返回错误: ${response.status}`);
        }

        return response.json();
      } catch (error: any) {
        console.log(`Ollama 模型加载失败: ${error.message}`);
        return { models: [] }; // 返回空数组而不是抛出错误
      }
    },
    // 不自动重试
    retry: false,
    // 仅当 ollamaBaseUrl 存在且不是默认值时启用
    enabled: !!(
      preferences &&
      preferences.ollamaBaseUrl &&
      preferences.ollamaBaseUrl !== "http://localhost:11434"
    ),
    // 减少重新获取频率
    staleTime: 5 * 60 * 1000, // 5分钟
  });

  const createInstance = async (model: TModel, apiKey: string) => {
    const temperature =
      preferences.temperature || defaultPreferences.temperature;
    const topP = preferences.topP || defaultPreferences.topP;
    const topK = preferences.topK || defaultPreferences.topK;
    const maxTokens = preferences.maxTokens || model.tokens;

    switch (model.baseModel) {
      case "openai":
        // 保持现有代码不变
        return new ChatOpenAI({
          model: model.key,
          streaming: true,
          apiKey,
          temperature,
          maxTokens,
          topP,
          maxRetries: 2,
        });

      case "anthropic":
        // 保持现有代码不变
        return new ChatAnthropic({
          model: model.key,
          streaming: true,
          anthropicApiUrl: `${window.location.origin}/api/anthropic/`,
          apiKey,
          maxTokens,
          temperature,
          topP,
          topK,
          maxRetries: 2,
        });

      case "gemini":
        // 保持现有代码不变
        return new ChatGoogleGenerativeAI({
          model: model.key,
          apiKey,
          maxOutputTokens: maxTokens,
          streaming: true,
          temperature,
          maxRetries: 1,
          onFailedAttempt: (error) => {
            console.error("Failed attempt", error);
          },
          topP,
          topK,
        });

      case "deepseek":
        // 添加 DeepSeek 模型支持
        return new ChatDeepSeek({
          model: model.key,
          streaming: true,
          apiKey,
          temperature,
          maxTokens, // 最大令牌数
          topP,
          maxRetries: 2,
          // 可选：指定 DeepSeek API 的基础URL，如果您正在使用代理
          // baseURL: `${window.location.origin}/api/deepseek/`,
        });

      case "ollama":
        // 保持现有代码不变
        return new ChatOllama({
          model: model.key,
          baseUrl: preferences.ollamaBaseUrl,
          topK,
          numPredict: maxTokens,
          topP,
          maxRetries: 2,
          temperature,
        });

      default:
        throw new Error("Invalid model");
    }
  };
  const models: TModel[] = [
    {
      name: "GPT 4o",
      key: "gpt-4o",
      tokens: 128000,
      isNew: true,
      inputPrice: 5,
      outputPrice: 15,
      plugins: ["web_search", "image_generation", "memory"],
      icon: (size) => <ModelIcon size={size} type="gpt4" />,
      baseModel: "openai",
      maxOutputTokens: 2048,
    },
    {
      name: "GPT4 Turbo",
      key: "gpt-4-turbo",
      tokens: 128000,
      isNew: false,
      plugins: ["web_search", "image_generation", "memory"],
      inputPrice: 10,
      outputPrice: 30,
      icon: (size) => <ModelIcon size={size} type="gpt4" />,
      baseModel: "openai",
      maxOutputTokens: 4095,
    },
    {
      name: "GPT4",
      key: "gpt-4",
      tokens: 128000,
      isNew: false,
      plugins: ["web_search", "image_generation", "memory"],
      inputPrice: 30,
      outputPrice: 60,
      icon: (size) => <ModelIcon size={size} type="gpt4" />,
      baseModel: "openai",
      maxOutputTokens: 4095,
    },
    {
      name: "GPT3.5 Turbo",
      key: "gpt-3.5-turbo",
      isNew: false,
      inputPrice: 0.5,
      outputPrice: 1.5,
      plugins: ["web_search", "image_generation", "memory"],
      tokens: 16385,
      icon: (size) => <ModelIcon size={size} type="gpt3" />,
      baseModel: "openai",
      maxOutputTokens: 4095,
    },
    {
      name: "GPT3.5 Turbo 0125",
      key: "gpt-3.5-turbo-0125",
      isNew: false,
      tokens: 16385,
      plugins: ["web_search", "image_generation", "memory"],
      icon: (size) => <ModelIcon size={size} type="gpt3" />,
      baseModel: "openai",
      maxOutputTokens: 4095,
    },
    {
      name: "GPT3.5 Turbo Instruct",
      key: "gpt-3.5-turbo-instruct",
      isNew: false,
      tokens: 4000,
      inputPrice: 1.5,
      outputPrice: 2,
      plugins: ["web_search"],
      icon: (size) => <ModelIcon size={size} type="gpt3" />,
      baseModel: "openai",
      maxOutputTokens: 4095,
    },
    {
      name: "Claude 3 Opus",
      key: "claude-3-opus-20240229",
      isNew: false,
      inputPrice: 15,
      outputPrice: 75,
      tokens: 200000,
      plugins: [],
      icon: (size) => <ModelIcon size={size} type="anthropic" />,
      maxOutputTokens: 4095,

      baseModel: "anthropic",
    },
    {
      name: "Claude 3 Sonnet",
      inputPrice: 3,
      outputPrice: 15,
      plugins: [],
      key: "claude-3-sonnet-20240229",
      isNew: false,
      maxOutputTokens: 4095,
      tokens: 200000,
      icon: (size) => <ModelIcon size={size} type="anthropic" />,

      baseModel: "anthropic",
    },
    {
      name: "Claude 3 Haiku",
      key: "claude-3-haiku-20240307",
      isNew: false,
      inputPrice: 0.25,
      outputPrice: 1.5,
      tokens: 200000,
      plugins: [],
      maxOutputTokens: 4095,
      icon: (size) => <ModelIcon size={size} type="anthropic" />,
      baseModel: "anthropic",
    },
    {
      name: "Gemini Pro 1.5",
      key: "gemini-1.5-pro-latest",
      isNew: true,
      inputPrice: 3.5,
      outputPrice: 10.5,
      plugins: [],
      tokens: 200000,
      icon: (size) => <ModelIcon size={size} type="gemini" />,
      baseModel: "gemini",
      maxOutputTokens: 8190,
    },
    {
      name: "Gemini Flash 1.5",
      key: "gemini-1.5-flash-latest",
      isNew: true,
      inputPrice: 0.35,
      outputPrice: 1.05,
      plugins: [],
      tokens: 200000,
      icon: (size) => <ModelIcon size={size} type="gemini" />,
      baseModel: "gemini",
      maxOutputTokens: 8190,
    },
    {
      name: "Gemini Pro",
      isNew: false,
      key: "gemini-pro",
      inputPrice: 0.5,
      outputPrice: 1.5,
      plugins: [],
      tokens: 200000,
      icon: (size) => <ModelIcon size={size} type="gemini" />,
      baseModel: "gemini",
      maxOutputTokens: 4095,
    },
    // 添加 DeepSeek 模型
    {
      name: "DeepSeek-Coder",
      key: "deepseek-coder",
      tokens: 32768,
      isNew: true,
      inputPrice: 1.0,
      outputPrice: 2.5,
      plugins: ["web_search", "image_generation"],
      icon: (size) => <ModelIcon size={size} type="deepseek" />,
      baseModel: "deepseek",
      maxOutputTokens: 4096,
    },
    {
      name: "DeepSeek Chat",
      key: "deepseek-chat",
      tokens: 32000,
      isNew: false,
      inputPrice: 0.8,
      outputPrice: 2.0,
      plugins: ["web_search"],
      icon: (size) => <ModelIcon size={size} type="deepseek" />,
      baseModel: "deepseek",
      maxOutputTokens: 4096,
    },
    {
      name: "DeepSeek Chat-Light",
      key: "deepseek-chat-light",
      tokens: 16000,
      isNew: false,
      inputPrice: 0.3,
      outputPrice: 0.8,
      plugins: ["web_search"],
      icon: (size) => <ModelIcon size={size} type="deepseek" />,
      baseModel: "deepseek",
      maxOutputTokens: 2048,
    },
  ];

  const allModels: TModel[] = useMemo(() => {
    const ollamaModels = ollamaModelsQuery.data?.models || [];

    // 检查是否需要尝试加载 Ollama 模型
    const shouldShowOllama =
      preferences.ollamaBaseUrl &&
      preferences.ollamaBaseUrl.trim() !== "" &&
      !ollamaModelsQuery.isError;

    // 基础模型列表
    const baseModels = [...models];

    // 如果不需要展示 Ollama 模型，直接返回基础模型
    if (!shouldShowOllama) {
      return baseModels;
    }

    // 为可能空的 Ollama 模型提供备选显示
    if (ollamaModelsQuery.isLoading) {
      // 添加加载中占位符
      return [
        ...baseModels,
        {
          name: "Ollama 模型加载中...",
          key: "ollama-loading",
          tokens: 0,
          inputPrice: 0,
          outputPrice: 0,
          plugins: [],
          icon: () => <ModelIcon size={"sm"} type="chathub" />,
          baseModel: "ollama",
          maxOutputTokens: 0,
          isDisabled: true,
        },
      ];
    }

    // 添加找到的 Ollama 模型或显示未找到消息
    if (ollamaModels.length === 0 && !ollamaModelsQuery.isLoading) {
      // 未找到模型时添加提示
      return [
        ...baseModels,
        {
          name: "未检测到 Ollama 模型",
          key: "ollama-not-found",
          tokens: 0,
          inputPrice: 0,
          outputPrice: 0,
          plugins: [],
          icon: () => <ModelIcon size={"sm"} type="chathub" />,
          baseModel: "ollama",
          maxOutputTokens: 0,
          isDisabled: true,
        },
      ];
    }

    // 正常返回所有模型
    return [
      ...baseModels,
      ...(ollamaModels?.map(
        (model: any): TModel => ({
          name: model.name,
          key: model.name,
          tokens: 128000,
          inputPrice: 0,
          outputPrice: 0,
          plugins: [],
          icon: () => <ModelIcon size={"sm"} type="chathub" />,
          baseModel: "ollama",
          maxOutputTokens: 2048,
        })
      ) || []),
    ];
  }, [
    ollamaModelsQuery.data,
    ollamaModelsQuery.isLoading,
    ollamaModelsQuery.isError,
    preferences.ollamaBaseUrl,
  ]);

  const getModelByKey = (key: TModelKey) => {
    return allModels.find((model) => model.key === key);
  };

  const getTestModelKey = (key: TBaseModel): TModelKey => {
    switch (key) {
      case "openai":
        return "gpt-3.5-turbo";
      case "anthropic":
        return "claude-3-haiku-20240307";
      case "gemini":
        return "gemini-pro";
      case "ollama":
        return "phi3:latest";
      case "deepseek": // 新增
        return "deepseek-chat";
    }
    return "gpt-3.5-turbo";
  };

  const assistants: TAssistant[] = [
    ...allModels?.map(
      (model): TAssistant => ({
        name: model.name,
        key: model.key,
        baseModel: model.key,
        type: "base",
        systemPrompt:
          preferences.systemPrompt || defaultPreferences.systemPrompt,
      })
    ),
    ...(assistantsProps?.assistantsQuery?.data || []),
  ];

  const getAssistantByKey = (
    key: string
  ): { assistant: TAssistant; model: TModel } | undefined => {
    const assistant = assistants.find((assistant) => assistant.key === key);
    if (!assistant) {
      return;
    }

    const model = getModelByKey(assistant?.baseModel);

    if (!model) {
      return;
    }

    return {
      assistant,
      model,
    };
  };

  const getAssistantIcon = (assistantKey: string) => {
    const assistant = getAssistantByKey(assistantKey);
    return assistant?.assistant.type === "base" ? (
      assistant?.model?.icon("sm")
    ) : (
      <ModelIcon type="openai" size="sm" />
    );
  };

  const ollamaStatus = useMemo(() => {
    if (!preferences.ollamaBaseUrl || preferences.ollamaBaseUrl.trim() === "") {
      return { status: "not-configured", message: "Ollama 未配置" };
    }

    if (ollamaModelsQuery.isLoading) {
      return { status: "loading", message: "正在连接 Ollama 服务..." };
    }

    if (ollamaModelsQuery.isError) {
      return {
        status: "error",
        message: "无法连接到 Ollama 服务，请确认服务已启动且地址正确",
      };
    }

    if (
      !ollamaModelsQuery.data?.models ||
      ollamaModelsQuery.data.models.length === 0
    ) {
      return {
        status: "empty",
        message: "已连接 Ollama，但未找到任何模型",
      };
    }

    return {
      status: "connected",
      message: `已连接 Ollama (${ollamaModelsQuery.data.models.length} 个模型)`,
    };
  }, [
    preferences.ollamaBaseUrl,
    ollamaModelsQuery.status,
    ollamaModelsQuery.data,
  ]);

  return {
    models: allModels,
    createInstance,
    getModelByKey,
    getTestModelKey,
    getAssistantIcon,
    assistants,
    getAssistantByKey,
    ollamaStatus, // 新增
    ...assistantsProps,
  };
};
