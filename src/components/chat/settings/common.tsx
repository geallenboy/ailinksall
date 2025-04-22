"use client"; // 声明这是一个客户端组件，而非服务器端组件

import { ArrowClockwise, Info } from "@phosphor-icons/react"; // 导入图标组件
import { ChangeEvent } from "react"; // 导入React的ChangeEvent类型
import { Button } from "@/components/ui/button"; // 导入UI组件
import { Flex } from "@/components/ui/flex"; // 导入Flex布局组件
import { Input } from "@/components/ui/input"; // 导入输入框组件
import { Slider } from "@/components/ui/slider"; // 导入滑块组件
import { Type } from "@/components/ui/text"; // 导入文本组件
import { Textarea } from "@/components/ui/textarea"; // 导入文本域组件
import { SettingCard } from "./setting-card"; // 导入设置卡片组件
import { SettingsContainer } from "./settings-container"; // 导入设置容器组件
import { TPreferences } from "@/types/chat"; // 导入聊天偏好设置类型
import { defaultPreferences } from "@/config/chat/preferences"; // 导入默认偏好设置
import { usePreferenceHooks } from "@/hooks/chat"; // 导入偏好设置钩子

export const CommonSettings = () => {
  // 使用自定义Hook获取偏好设置和更新函数
  const { preferences, updatePreferences } = usePreferenceHooks();

  /**
   * 渲染重置到默认值的按钮组件
   * @param key - 需要重置的偏好设置键名
   * @returns 重置按钮组件
   */
  const renderResetToDefault = (key: keyof TPreferences) => {
    return (
      <Button
        variant="outline" // 按钮样式为轮廓线
        size="iconXS" // 按钮尺寸为超小图标
        rounded="lg" // 按钮圆角大小
        onClick={() => {
          // 点击时将该设置项恢复为默认值
          updatePreferences({ [key]: defaultPreferences[key] });
        }}
      >
        <ArrowClockwise size={14} weight="bold" /> {/* 重置图标 */}
      </Button>
    );
  };

  /**
   * 处理输入框值变化的函数
   * @param min - 允许的最小值
   * @param max - 允许的最大值
   * @param key - 需要更新的偏好设置键名
   * @returns 处理输入变化的事件处理函数
   */
  const onInputChange = (min: number, max: number, key: keyof TPreferences) => {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value); // 将输入值转换为数字
      if (value < min) {
        // 如果小于最小值，设置为最小值
        updatePreferences({ [key]: min });
        return;
      } else if (value > max) {
        // 如果大于最大值，设置为最大值
        updatePreferences({ [key]: max });
        return;
      }
      // 否则更新为输入值
      updatePreferences({ [key]: value });
    };
  };

  /**
   * 处理滑块值变化的函数
   * @param min - 允许的最小值
   * @param max - 允许的最大值
   * @param key - 需要更新的偏好设置键名
   * @returns 处理滑块变化的事件处理函数
   */
  const onSliderChange = (
    min: number,
    max: number,
    key: keyof TPreferences
  ) => {
    return (value: number[]) => {
      // 滑块组件返回的是数组，我们取第一个值
      if (value?.[0] < min) {
        // 如果小于最小值，设置为最小值
        updatePreferences({ [key]: min });
        return;
      } else if (value?.[0] > max) {
        // 如果大于最大值，设置为最大值
        updatePreferences({ [key]: max });
        return;
      }
      // 否则更新为滑块值
      updatePreferences({ [key]: value?.[0] });
    };
  };

  return (
    <SettingsContainer title="模型设置">
      {/* 系统默认提示词设置 */}
      <Flex direction="col" gap="sm" className="w-full" items="start">
        <Type
          size="xs"
          textColor="secondary"
          className="flex flex-row items-center gap-1"
        >
          系统默认提示词 <Info weight="regular" size={14} /> {/* 信息图标 */}
        </Type>

        <Textarea
          name="systemPrompt"
          value={preferences.systemPrompt} // 绑定到当前系统提示词值
          autoComplete="off"
          onChange={(e) => {
            // 输入变化时更新系统提示词
            updatePreferences({ systemPrompt: e.target.value });
          }}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // 重置系统提示词为默认值
            updatePreferences({
              systemPrompt: defaultPreferences.systemPrompt,
            });
          }}
        >
          重置系统提示词
        </Button>
      </Flex>

      {/* 模型参数设置卡片 */}
      <SettingCard className="p-3 mt-2">
        {/* 上下文长度设置 */}
        <Flex justify="between">
          <Flex direction="col" items="start">
            <Type weight="medium">上下文长度</Type>
            <Type size="xxs" textColor="secondary">
              用作上下文的前几条消息数量
            </Type>
          </Flex>
          <Flex items="center" gap="sm">
            <Input
              name="messageLimit"
              type="number"
              size="sm"
              className="w-[100px]"
              value={preferences?.messageLimit} // 绑定当前上下文长度
              autoComplete="off"
              onChange={(e) => {
                // 输入变化时更新上下文长度
                updatePreferences({
                  messageLimit: Number(e.target.value),
                });
              }}
            />
            {renderResetToDefault("messageLimit")} {/* 重置按钮 */}
          </Flex>
        </Flex>
        <div className="my-3 h-[1px] bg-zinc-500/10 w-full" /> {/* 分隔线 */}
        {/* 最大输出令牌数设置 */}
        <Flex justify="between">
          <Flex direction="col" items="start">
            <Type weight="medium">最大输出令牌数</Type>
            <Type size="xxs" textColor="secondary">
              生成的最大令牌数
            </Type>
          </Flex>
          <Flex items="center" gap="sm">
            <Input
              name="maxTokens"
              type="number"
              size="sm"
              className="w-[100px]"
              value={preferences?.maxTokens} // 绑定当前最大令牌数
              autoComplete="off"
              onChange={(e) => {
                // 输入变化时更新最大令牌数
                updatePreferences({
                  maxTokens: Number(e.target.value),
                });
              }}
            />
            {renderResetToDefault("maxTokens")} {/* 重置按钮 */}
          </Flex>
        </Flex>
        <div className="my-3 h-[1px] bg-zinc-500/10 w-full" /> {/* 分隔线 */}
        {/* 温度设置 - 控制生成的随机性 */}
        <Flex justify="between">
          <Flex direction="col" items="start">
            <Type weight="medium">温度</Type>
            <Type size="xxs" textColor="secondary">
              控制生成的随机性
            </Type>
          </Flex>
          <Flex items="center" gap="sm">
            <Slider
              className="my-2 w-[80px]"
              value={[Number(preferences?.temperature)]} // 滑块显示当前温度值
              min={0}
              step={0.1} // 滑块步长
              max={1}
              onValueChange={onSliderChange(0, 1, "temperature")} // 滑块改变时更新温度
            />
            <Input
              name="temperature"
              type="number"
              size="sm"
              className="w-[80px]"
              value={preferences?.temperature} // 输入框显示当前温度值
              min={0}
              step={1}
              max={100}
              autoComplete="off"
              onChange={onInputChange(0, 1, "temperature")} // 输入改变时更新温度
            />
            {renderResetToDefault("temperature")} {/* 重置按钮 */}
          </Flex>
        </Flex>
        <div className="my-3 h-[1px] bg-zinc-500/10 w-full" /> {/* 分隔线 */}
        {/* TopP设置 - 控制生成的多样性 */}
        <Flex justify="between">
          <Flex direction="col" items="start">
            <Type weight="medium">TopP</Type>
            <Type size="xxs" textColor="secondary">
              控制生成的多样性
            </Type>
          </Flex>
          <Flex items="center" gap="sm">
            <Slider
              className="my-2 w-[80px]"
              value={[Number(preferences.topP)]} // 滑块显示当前TopP值
              min={0}
              step={0.01} // 滑块步长
              max={1}
              onValueChange={onSliderChange(0, 1, "topP")} // 滑块改变时更新TopP
            />
            <Input
              name="topP"
              type="number"
              size="sm"
              className="w-[80px]"
              value={preferences.topP} // 输入框显示当前TopP值
              min={0}
              step={1}
              max={1}
              autoComplete="off"
              onChange={onInputChange(0, 1, "topP")} // 输入改变时更新TopP
            />
            {renderResetToDefault("topP")} {/* 重置按钮 */}
          </Flex>
        </Flex>
        <div className="my-3 h-[1px] bg-zinc-500/10 w-full" /> {/* 分隔线 */}
        {/* TopK设置 - 控制生成的多样性 */}
        <Flex justify="between">
          <Flex direction="col" items="start">
            <Type weight="medium">TopK</Type>
            <Type size="xxs" textColor="secondary">
              控制生成的多样性
            </Type>
          </Flex>
          <Flex items="center" gap="sm">
            <Slider
              className="my-2 w-[80px]"
              value={[Number(preferences.topK)]} // 滑块显示当前TopK值
              min={1}
              step={1} // 滑块步长
              max={100}
              onValueChange={onSliderChange(1, 100, "topK")} // 滑块改变时更新TopK
            />
            <Input
              name="topK"
              type="number"
              size="sm"
              className="w-[80px]"
              value={preferences.topK} // 输入框显示当前TopK值
              min={0}
              step={1}
              max={100}
              autoComplete="off"
              onChange={onInputChange(1, 100, "topK")} // 输入改变时更新TopK
            />
            {renderResetToDefault("topK")} {/* 重置按钮 */}
          </Flex>
        </Flex>
      </SettingCard>
    </SettingsContainer>
  );
};
