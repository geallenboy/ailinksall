import { Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";

export const Logo = () => {
  return (
    <Link href={"/"} className="flex items-center gap-2">
      <Sparkles strokeWidth={1.5} className="text-white" />
      <span className="text-lg font-semibold text-white">AI Chat</span>
    </Link>
  );
};

export default Logo;
