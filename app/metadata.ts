import type { Metadata } from "next"

// Metadatos por defecto para toda la aplicación
export const metadata: Metadata = {
  title: {
    default: "Granito Skate Shop - Panel de Administración",
    template: "%s | Granito Skate Shop",
  },
  description: "Panel de administración para la tienda Granito Skate Shop",
  keywords: ["skate", "skateboard", "tienda", "administración", "dashboard", "shopify"],
  authors: [
    {
      name: "Granito Skate Shop",
      url: "https://granitoskate.com",
    },
  ],
  creator: "Granito Skate Shop",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://admin.granitoskate.com",
    title: "Granito Skate Shop - Panel de Administración",
    description: "Panel de administración para la tienda Granito Skate Shop",
    siteName: "Granito Skate Shop Admin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Granito Skate Shop - Panel de Administración",
    description: "Panel de administración para la tienda Granito Skate Shop",
    creator: "@granitoskate",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}
