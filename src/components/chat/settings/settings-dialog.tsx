import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/chat/settings-store";

export const SettingsDialog = () => {
  const { isSettingOpen, dismiss } = useSettingsStore();

  return (
    <Dialog open={isSettingOpen} onOpenChange={(open) => !open && dismiss()}>
      <DialogContent className="w-[96dvw] max-h-[80dvh] rounded-2xl md:min-w-[800px] gap-0 md:h-[600px] flex flex-col overflow-hidden border border-white/5 p-0">
        <DialogHeader />
        <div className="flex flex-col md:flex-row w-full relative h-full overflow-hidden">
          <SettingsNavigation />
          <SettingsContent />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// 对话框标题
const DialogHeader = () => (
  <div className="w-full px-4 py-3 border-b border-zinc-500/20">
    <p className="text-md font-medium">设置</p>
  </div>
);

// 导航菜单部分
const SettingsNavigation = () => {
  const { settingMenu, selectedMenu, setSelectedMenu } = useSettingsStore();

  return (
    <div className="w-full md:w-[220px] px-2 pt-2 pb-2 md:pb-16 border-zinc-500/10 absolute md:h-full overflow-x-auto md:overflow-y-auto no-scrollbar left-0 top-0 right-0 md:bottom-0 flex flex-row md:flex-col md:gap-0 gap-1">
      {settingMenu.map((menu) => (
        <Button
          variant={selectedMenu === menu.key ? "secondary" : "ghost"}
          key={menu.key}
          onClick={() => setSelectedMenu(menu.key)}
          className="justify-start gap-2 px-2"
          size="default"
        >
          <div className="w-6 h-6 flex flex-row items-center justify-center">
            {menu.icon()}
          </div>
          <span
            className={cn(
              "text-xs md:text-sm md:flex font-medium",
              selectedMenu === menu.key ? "flex" : "hidden"
            )}
          >
            {menu.name}
          </span>
        </Button>
      ))}
    </div>
  );
};

// 内容部分
const SettingsContent = () => {
  const selectedMenuItem = useSettingsStore((state) =>
    state.getSelectedMenuItem()
  );

  return (
    <div className="md:ml-[220px] mt-12 md:mt-0 pb-16 w-full h-full overflow-y-auto no-scrollbar">
      {selectedMenuItem?.component}
    </div>
  );
};
