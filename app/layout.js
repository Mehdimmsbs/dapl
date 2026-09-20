import "./globals.css";

export const metadata = {
  title: "برنامه‌ریز شخصی",
  description: "نمونه برنامه زمان‌بندی و مدیریت کارهای روزانه"
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}