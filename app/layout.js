import "./globals.css";

import { LanguageProvider } from "../components/providers/LanguageProvider";
import defaultMessages from "../locales/translations/en.json";
import {
  DEFAULT_LOCALE,
  getLocaleConfig,
} from "../locales/config";

const defaultLocaleConfig = getLocaleConfig(DEFAULT_LOCALE);

export const metadata = {
  title: defaultMessages.metaTitle,
  description: defaultMessages.metaDescription,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      dir={defaultLocaleConfig.direction}
      suppressHydrationWarning
    >
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}