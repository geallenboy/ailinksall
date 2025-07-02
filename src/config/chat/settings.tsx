"use client";
import {
  BrainIcon,
  DashboardCircleIcon,
  Database02Icon,
  Settings03Icon,
  SparklesIcon,
  VoiceIcon,
} from "@hugeicons/react";
import { CommonSettings } from "@/components/chat/settings/common";
import { Data } from "@/components/chat/settings/data";
import { MemorySettings } from "@/components/chat/settings/memory";
import { ModelSettings } from "@/components/chat/settings/models";
import { PluginSettings } from "@/components/chat/settings/plugins";
import { VoiceInput } from "@/components/chat/settings/voice-input";
import { TSettingMenuItem } from "@/store/chat/settings-store";

// 创建菜单配置
export const createSettingMenu = (): TSettingMenuItem[] => [
  {
    name: "通用",
    icon: () => <Settings03Icon size={18} strokeWidth="2" />,
    key: "common",
    component: <CommonSettings />,
  },
  {
    name: "模型",
    icon: () => <SparklesIcon size={18} strokeWidth="2" />,
    key: "models",
    component: <ModelSettings />,
  },
  {
    name: "插件",
    icon: () => <DashboardCircleIcon size={18} strokeWidth="2" />,
    key: "plugins",
    component: <PluginSettings />,
  },
  {
    name: "记忆",
    icon: () => <BrainIcon size={18} strokeWidth="2" />,
    key: "memory",
    component: <MemorySettings />,
  },
  {
    name: "语音输入",
    icon: () => <VoiceIcon size={18} strokeWidth="2" />,
    key: "voice-input",
    component: <VoiceInput />,
  },
  {
    name: "数据",
    icon: () => <Database02Icon size={18} strokeWidth="2" />,
    key: "Your Data",
    component: <Data />,
  },
];
