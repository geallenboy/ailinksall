"use client";

import { useSessionHooks } from "../chat/use-session-hooks";

export const SessionInitializer: React.FC = () => {

    useSessionHooks();


    return null; // 不渲染任何内容
};