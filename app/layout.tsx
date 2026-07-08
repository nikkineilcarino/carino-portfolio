import type { Metadata } from "next";
import { profileAsset, seoContent, siteIdentity } from "@/constants/site";
import "./globals.css";

export const metadata: Metadata = {
  title: seoContent.title,
  description: seoContent.description,
  keywords: seoContent.keywords,
  applicationName: "Nikki Neil Cariño Portfolio",
  authors: [{ name: siteIdentity.name }],
  creator: siteIdentity.name,
  publisher: siteIdentity.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: profileAsset.publicPath,
        type: "image/jpeg",
      },
    ],
  },
  openGraph: {
    title: seoContent.title,
    description: seoContent.description,
    siteName: "Nikki Neil Cariño Portfolio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: seoContent.title,
    description: seoContent.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
