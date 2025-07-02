import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/public/theme-provider";
import { cn } from "@/lib/utils";
import Provider from "./provider";
import "./globals.css";
import { interVar } from "./fonts";
import { ReactQueryProvider } from "@/provider/react-query";

export const metadata: Metadata = {
  title: "ChatHub",
  description: "Most intutive all-in-one AI chat client",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn(`${interVar.variable} font-sans`, "antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <Provider>
              <ReactQueryProvider>{children}</ReactQueryProvider>
            </Provider>
            <Toaster richColors />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
