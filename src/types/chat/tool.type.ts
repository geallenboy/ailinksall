import { FC, ReactNode, RefAttributes } from "react";
import { TToolResponse, TApiKeys, TPreferences } from "@/types/chat";
import { HugeiconsProps } from "@hugeicons/react";


export const toolKeys = ["calculator", "web_search"];
export type TToolKey = (typeof toolKeys)[number];
export type IconSize = "sm" | "md" | "lg";

export type TToolArg = {
    updatePreferences: (
        newPreferences: Partial<TPreferences>,
        onSuccess?: (preference: TPreferences) => void
    ) => Promise<void>;
    preferences: TPreferences;
    apiKeys: TApiKeys;
    sendToolResponse: (response: TToolResponse) => void;
};

export type TTool = {
    key: TToolKey;
    description: string;
    renderUI?: (args: any) => ReactNode;
    name: string;
    loadingMessage?: string;
    resultMessage?: string;
    tool: (args: TToolArg) => any;
    icon: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>>;
    smallIcon: FC<Omit<HugeiconsProps, "ref"> & RefAttributes<SVGSVGElement>>;
    validate?: () => Promise<boolean>;
    validationFailedAction?: () => void;
    showInMenu?: boolean;
};