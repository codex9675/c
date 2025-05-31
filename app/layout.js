// app/layout.js
import "./globals.css";
import Providers from "./providers";
import Head from "next/head";
export const metadata = {
  title: "GukLuk",
  description:
    "We help businesses build great websites that showcase their work and connect with customers online easily and effectively.",
  icons: {
    icon: "/web-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
