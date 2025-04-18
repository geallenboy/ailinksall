import { useSessionsContext } from "@/context/sessions";
import { generateAndDownloadJson } from "@/lib/chat/helper";
import { ChangeEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Flex } from "@/components/ui/flex";
import { Input } from "@/components/ui/input";
import { Type } from "@/components/ui/text";
import { PopOverConfirmProvider } from "@/components/ui/use-confirm-popover";
import { useToast } from "@/components/ui/use-toast";
import { SettingCard } from "./setting-card";
import { SettingsContainer } from "./settings-container";
import { usePreferencesStore, useSettingsStore } from "@/store/chat";
import { TPreferences } from "@/types/chat";
import { defaultPreferences } from "@/config/chat/preferences";

const apiSchema = z.object({
  openai: z.string().optional(),
  gemini: z.string().optional(),
  anthropic: z.string().optional(),
});

const preferencesSchema = z.object({
  defaultAssistant: z.string(),
  systemPrompt: z.string().optional(),
  memories: z.array(z.string()).optional(),
  messageLimit: z.number().int().positive().optional(),
  temperature: z.number().optional(),
  defaultPlugins: z.array(z.string()).optional(),
  whisperSpeechToTextEnabled: z.boolean().optional(),
  maxTokens: z.number().int().positive().optional(),
  defaultWebSearchEngine: z
    .string()
    .refine((val) => ["google", "duckduckgo"].includes(val))
    .optional(),
  topP: z.number().optional(),
  topK: z.number().optional(),
  googleSearchEngineId: z.string().optional(),
  googleSearchApiKey: z.string().optional(),
  ollamaBaseUrl: z.string().optional(),
});

const runModelPropsSchema = z.object({
  context: z.string().optional(),
  input: z.string().optional(),
  image: z.string().optional(),
  sessionId: z.string(),
  messageId: z.string().optional(),
  assistant: z.object({
    key: z.string(),
    name: z.string(),
    baseModel: z.string(),
    systemPrompt: z.string(),
    type: z.string().refine((val) => ["custom", "base"].includes(val)),
  }),
});

const chatMessageSchema = z.object({
  id: z.string(),
  image: z.string().optional(),
  rawHuman: z.string().optional(),
  rawAI: z.string().optional(),
  sessionId: z.string(),
  inputProps: runModelPropsSchema,
  toolName: z.string().optional(),
  toolResult: z.string().optional(),
  isLoading: z.boolean().optional(),
  isToolRunning: z.boolean().optional(),
  hasError: z.boolean().optional(),
  errorMesssage: z.string().optional(),
  createdAt: z.string(),
});

const botSchema = z.object({
  prompt: z.string(),
  name: z.string(),
  description: z.string(),
  greetingMessage: z.string().optional(),
  id: z.string(),
  avatar: z.string().optional(),
  status: z.string().optional(),
  deafultBaseModel: z.string().default("gpt-3.5-turbo"),
});

const sessionSchema = z.object({
  messages: z.array(chatMessageSchema),
  title: z.string().optional(),
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

const promptSchema = z.object({});

const importSchema = z.object({
  apiKeys: apiSchema.optional(),
  preferences: preferencesSchema.optional(),
  sessions: sessionSchema.array().optional(),
  prompts: z.array(z.string()).optional(),
});

export const Data = () => {
  const { dismiss } = useSettingsStore();
  const { toast } = useToast();

  const {
    sessions,
    addSessionsMutation,
    clearSessionsMutation,
    createSession,
  } = useSessionsContext();

  const { preferences, apiKeys, updatePreferences, updateApiKeys } =
    usePreferencesStore();

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = async function (e) {
        const content = e.target?.result as string;

        console.log(content);
        try {
          const jsonData = JSON.parse(content);
          console.log(jsonData);
          const parsedData = importSchema.parse(jsonData, {
            errorMap: (issue: any, ctx: any) => {
              console.log(issue, ctx);
              return { message: ctx.defaultError };
            },
          });
          parsedData?.apiKeys && updateApiKeys(parsedData?.apiKeys);
          parsedData?.preferences &&
            updatePreferences(parsedData?.preferences as TPreferences);

          const incomingSessions = parsedData?.sessions?.filter(
            (s) => !!s.messages.length
          );

          toast({
            title: "Data Imported",
            description: "The JSON file you uploaded has been imported",
            variant: "default",
          });

          console.log(parsedData);
        } catch (e) {
          console.error(e);
          toast({
            title: "Invalid JSON",
            description: "The JSON file you uploaded is invalid",
            variant: "destructive",
          });
          return;
        }
      };
      reader.readAsText(file);
    }
  }

  return (
    <SettingsContainer title="管理您的数据">
      <Flex direction="col" gap="md" className="w-full">
        <SettingCard className="p-3">
          <Flex items="center" justify="between">
            <Type textColor="secondary">清除所有聊天会话</Type>
            <PopOverConfirmProvider
              title="您确定要清除所有聊天会话吗？此操作无法撤销。"
              confirmBtnText="清除所有"
              onConfirm={() => {
                clearSessionsMutation.mutate(undefined, {
                  onSuccess: () => {
                    toast({
                      title: "数据已清除",
                      description: "所有聊天数据已被清除",
                      variant: "default",
                    });
                    createSession({
                      redirect: true,
                    });
                    dismiss();
                  },
                });
              }}
            >
              <Button variant="destructive" size="sm">
                清除所有
              </Button>
            </PopOverConfirmProvider>
          </Flex>
          <div className="my-3 h-[1px] bg-zinc-500/10 w-full" />
          <Flex items="center" justify="between">
            <Type textColor="secondary" className="w-full">
              清除所有聊天会话和偏好设置
            </Type>
            <PopOverConfirmProvider
              title="您确定要重置所有聊天会话和偏好设置吗？此操作无法撤销。"
              confirmBtnText="重置所有"
              onConfirm={() => {
                clearSessionsMutation.mutate(undefined, {
                  onSuccess: () => {
                    updatePreferences(defaultPreferences);
                    toast({
                      title: "重置成功",
                      description: "所有聊天数据已被重置",
                      variant: "default",
                    });
                    createSession({
                      redirect: true,
                    });
                    dismiss();
                  },
                });
              }}
            >
              <Button variant="destructive" size="sm">
                重置所有
              </Button>
            </PopOverConfirmProvider>
          </Flex>
        </SettingCard>

        <SettingCard className="p-3">
          <Flex items="center" justify="between">
            <Type textColor="secondary" className="w-full">
              导入数据
            </Type>
            <Input
              type="file"
              onChange={handleFileSelect}
              hidden
              className="invisible"
              id="import-config"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                document?.getElementById("import-config")?.click();
              }}
            >
              导入
            </Button>
          </Flex>
          <div className="my-3 h-[1px] bg-zinc-500/10 w-full" />

          <Flex items="center" justify="between" className="w-full">
            <Type textColor="secondary">导出数据</Type>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                generateAndDownloadJson(
                  {
                    sessions: sessions,
                    preferences: preferences,
                    apiKeys: apiKeys,
                  },
                  "chats.so.json"
                );
              }}
            >
              导出
            </Button>
          </Flex>
        </SettingCard>
      </Flex>
    </SettingsContainer>
  );
};
