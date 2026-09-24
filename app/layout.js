import "./globals.css";
import PWARegister from "./PWARegister";

export const viewport = { themeColor: "#5b5ce2", width: "device-width", initialScale: 1 };

export const metadata = {
  title: "برنامه‌ریز شخصی",
  description: "برنامه‌ریز شخصی و مدیریت کارهای روزانه",
  manifest: "/manifest.webmanifest",
  themeColor: "#5b5ce2",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" }
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}<PWARegister /></body>
    </html>
  );
}