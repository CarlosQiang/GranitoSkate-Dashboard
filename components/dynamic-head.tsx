"use client"

import { useTheme } from "@/contexts/theme-context"
import { useEffect } from "react"

export function DynamicHead() {
  const { theme } = useTheme()

  useEffect(() => {
    // Actualizar el título de la página dinámicamente
    if (theme.shopName) {
      document.title = `${theme.shopName} - Panel de Administración`
    }

    // Actualizar el favicon si hay uno personalizado
    if (theme.faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      const shortcutIcon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement
      const appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement

      if (favicon) favicon.href = theme.faviconUrl
      if (shortcutIcon) shortcutIcon.href = theme.faviconUrl
      if (appleIcon) appleIcon.href = theme.faviconUrl
    }
  }, [theme.shopName, theme.faviconUrl])

  return null
}
