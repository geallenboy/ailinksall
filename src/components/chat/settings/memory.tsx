import { usePreferencesStore } from "@/store/chat";
import { SettingCard } from "./setting-card";
import { SettingsContainer } from "./settings-container";

export const MemorySettings = () => {
  const { preferences } = usePreferencesStore();

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
