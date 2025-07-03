import React from 'react';
import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo-utils";
import { GlobalProviders } from "@/components/providers/global-providers";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Navigation, Footer } from "@/components/layout";
import "./globals.css";

// 生成网站根metadata
export const metadata: Metadata = generatePageMetadata({
  title: "AI洞察引擎 - 从信息到智慧的认知增强伙伴",
  description: "AI洞察引擎是您在AI时代的认知增强伙伴。通过洞察引擎、预见引擎和行动引擎，我们将信息转化为洞察，洞察转化为预见，预见转化为行动。让AI为您思考，成为您的外脑。",
  type: "website",
  url: "/"
});

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <GlobalProviders>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <main className="min-h-screen">
              <Navigation />
              {children}
              <Footer />
            </main>
          </NextIntlClientProvider>
        </GlobalProviders>
      </body>
    </html>
  );
}
