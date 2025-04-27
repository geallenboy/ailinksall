"use client";

import { defaultPreferences } from "@/config/chat/preferences";
import { usePreferencesQuery } from "@/hooks";
import { usePreferenceHooks } from "@/hooks/chat";
import React, { useEffect } from "react";

export type TPreferencesProvider = {
  children: React.ReactNode;
};

export const PreferenceProvider = ({ children }: TPreferencesProvider) => {
  const { preferencesQuery, apiKeysQuery } = usePreferencesQuery();
  const { setPreferences, setApiKeys } = usePreferenceHooks();

  useEffect(() => {
    preferencesQuery.data &&
      setPreferences({ ...defaultPreferences, ...preferencesQuery.data });
  }, [preferencesQuery.data]);

  useEffect(() => {
    apiKeysQuery.data && setApiKeys(apiKeysQuery.data);
  }, [apiKeysQuery.data]);

  return <> {children}</>;
};
