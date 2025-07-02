"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ensureUserExists } from "./actions/user-action";
import { useUserStore } from "@/store/user/user-store";

const supabase = createClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<any>(null);
  const { updateUser } = useUserStore();
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log(user);
    if (user) {
      setUsers(user);
      await ensureUserExists({
        id: user.id,
        email: user.email || "",
        displayName: user.user_metadata.full_name,
      });
      updateUser(user);
    }
  };

  return <div>{children}</div>;
}
