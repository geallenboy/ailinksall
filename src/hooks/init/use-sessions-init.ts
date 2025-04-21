"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useSessionHooks } from "../chat/use-session-hooks";

export const SessionInitializer: React.FC = () => {
    const { sessionId } = useParams();
    const {
        refetchSessions,
        refetchCurrentSession,
    } = useSessionHooks();

    // 初始化时获取所有会话和当前会话
    useEffect(() => {
        refetchSessions?.();
        if (sessionId) {
            refetchCurrentSession?.();
        }
    }, [sessionId, refetchSessions, refetchCurrentSession]);

    return null; // 不渲染任何内容
};