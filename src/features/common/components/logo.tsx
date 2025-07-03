import { Brain, Lightbulb } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import React from "react";

interface LogoProps {
  withLink?: boolean;
  className?: string;
}

export const Logo = ({ withLink = true, className = "flex items-center gap-2" }: LogoProps) => {
  const T = useTranslations("app");
  const locale = useLocale();
  
  const LogoContent = () => (
    <>
      <div className="relative">
        <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        <Lightbulb className="w-3 h-3 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
      </div>
      <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
        {locale === 'zh' ? 'AI洞察引擎' : 'AI Insight Engine'}
      </span>
    </>
  );

  if (withLink) {
    return (
      <Link href={`/${locale}/`} className={className}>
        <LogoContent />
      </Link>
    );
  }

  return (
    <div className={className}>
      <LogoContent />
    </div>
  );
};

export default Logo;
