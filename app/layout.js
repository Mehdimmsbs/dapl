import {
  Noto_Sans,
  Noto_Sans_Arabic,
} from "next/font/google";

import "./globals.css";
import "./theme.css";
import "../styles/main.scss";

import { LanguageProvider } from "../components/providers/LanguageProvider";
import defaultMessages from "../locales/translations/en.json";
import {
  DEFAULT_LOCALE,
  getLocaleConfig,
} from "../locales/config";

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
};

/* Provides shared language and typography settings. */
export default function RootLayout({ children }) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      dir={defaultLocaleConfig.direction}
      suppressHydrationWarning
    >
      <body className={`${uiFont.variable} ${arabicFont.variable}`}>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}