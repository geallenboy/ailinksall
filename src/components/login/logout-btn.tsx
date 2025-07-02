"use client";

import { logoutAction } from "@/app/actions/auth-action";
import React from "react";

export const LogoutBtn = () => {
  const handleLogout = async () => {
    await logoutAction();
  };
  return (
    <span
      onClick={handleLogout}
      className="inline-block w-full cursor-pointer text-destructive"
    >
      退出
    </span>
  );
};

export default LogoutBtn;
