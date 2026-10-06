import { Noto_Sans, Noto_Sans_Arabic } from "next/font/google";

import "../styles/main.scss";

import PWARegister from "../components/pwa/PWARegister";
import { LanguageProvider } from "../components/providers/LanguageProvider";
import AutoBackupRunner from "../components/providers/AutoBackupRunner";
import StorageBoundary from "../components/providers/StorageBoundary";
import defaultMessages from "../locales/translations/en.json";
import { DEFAULT_LOCALE, getLocaleConfig } from "../locales/config";

/* Loads the main Latin font used across the application. */
const uiFont = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-ui",
  display: "swap",
});

/* Loads the matching Arabic and Persian font. */
const arabicFont = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
});

const defaultLocaleConfig = getLocaleConfig(DEFAULT_LOCALE);

export const metadata = {
  title: defaultMessages.metaTitle,
  description: defaultMessages.metaDescription,
  applicationName: "My Day",
  manifest: "/manifest.webmanifest",

  icons: {
    icon: [
      {
        url: "/icons/app-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/app-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/icons/app-192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
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

/* Provides language, typography and PWA settings. */
export default function RootLayout({ children }) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      dir={defaultLocaleConfig.direction}
      suppressHydrationWarning
    >
      <body className={`${uiFont.variable} ${arabicFont.variable}`}>
        <StorageBoundary>
          <LanguageProvider>
            {children}
            <AutoBackupRunner />
            <PWARegister />
          </LanguageProvider>
        </StorageBoundary>
      </body>
    </html>
  );
}
