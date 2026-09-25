import "./globals.css";

import PWARegister from "../components/pwa/PWARegister";
import { LanguageProvider } from "../components/providers/LanguageProvider";
import defaultMessages from "../locales/translations/en.json";
import {
  DEFAULT_LOCALE,
  getLocaleConfig,
} from "../locales/config";

const defaultLocaleConfig =
  getLocaleConfig(DEFAULT_LOCALE);

export const metadata = {
  title: defaultMessages.metaTitle,
  description: defaultMessages.metaDescription,
  applicationName: "My Day",
  manifest: "/manifest.webmanifest",

  icons: {
    icon: "/icons/my-day-logo.png",
    apple: "/icons/my-day-logo.png",
  },

  appleWebApp: {
    capable: true,
    title: "My Day",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#5b5cf6",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      dir={defaultLocaleConfig.direction}
      suppressHydrationWarning
    >
      <body>
        <LanguageProvider>
          {children}
          <PWARegister />
        </LanguageProvider>
      </body>
    </html>
  );
}