"use client";
import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export const LanguageSwitcher = () => {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const onChange = () => {
    const newLocale = locale === "zh" ? "en" : "zh";
    
    // 移除当前语言前缀
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    // 跳转到新语言的路径
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <Button variant="ghost" size="icon" onClick={onChange} className="relative">
      {locale === "zh" ? "英" : "中"}
    </Button>
  );
};

export default LanguageSwitcher;
