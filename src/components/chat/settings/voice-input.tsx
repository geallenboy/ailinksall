import { SettingsContainer } from "./settings-container";
import { usePreferenceContext } from "@/context";
import { SettingCard } from "./setting-card";
import { Flex } from "@/components/ui/flex";
import { Type } from "@/components/ui/text";
import { Switch } from "@/components/ui/switch";

export const VoiceInput = () => {
  const { updatePreferences, preferences } = usePreferenceContext();
  return (
    <SettingsContainer title="语音转文字设置">
      <SettingCard className="justify-center flex flex-col p-3">
        <Flex justify={"between"} items={"center"}>
          <Flex direction={"col"} items={"start"}>
            <Type textColor={"primary"} weight={"medium"}>
              启用 Whisper 语音转文字
            </Type>
            <Type size={"xs"} textColor={"tertiary"}>
              需要 OpenAI API 密钥。
            </Type>
          </Flex>
          <Switch
            checked={preferences?.whisperSpeechToTextEnabled}
            onCheckedChange={(checked) => {
              updatePreferences({
                whisperSpeechToTextEnabled: checked,
              });
            }}
          />
        </Flex>
      </SettingCard>
    </SettingsContainer>
  );
};
