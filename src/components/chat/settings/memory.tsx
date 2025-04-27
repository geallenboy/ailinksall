import { usePreferenceHooks } from "@/hooks/chat";
import { SettingCard } from "./setting-card";
import { SettingsContainer } from "./settings-container";

export const MemorySettings = () => {
  const { preferences } = usePreferenceHooks();

  const renderMemory = (memory: string) => {
    return (
      <SettingCard className="justify-center flex flex-col">
        {memory}
      </SettingCard>
    );
  };

  return (
    <SettingsContainer title="Memory">
      {preferences?.memories?.map(renderMemory)}
    </SettingsContainer>
  );
};
