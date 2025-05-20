"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { type ThemeConfig, defaultThemeConfig } from "@/types/theme-config"

interface ThemeContextType {
  theme: ThemeConfig
  updateTheme: (newTheme: Partial<ThemeConfig>) => void
  resetTheme: () => void
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(defaultThemeConfig)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Cargar tema guardado al iniciar
  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme")
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme)
        setTheme(parsedTheme)
      } catch (error) {
        console.error("Error al cargar el tema guardado:", error)
      }
    }

    // Detectar preferencia de modo oscuro
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const savedDarkMode = localStorage.getItem("dark-mode")

    if (savedDarkMode) {
      setIsDarkMode(savedDarkMode === "true")
    } else if (theme.preferDarkMode || (theme.enableDarkMode && prefersDark)) {
      setIsDarkMode(true)
    }
  }, [])

  // Aplicar modo oscuro
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("dark-mode", isDarkMode.toString())
  }, [isDarkMode])

  // Aplicar variables CSS personalizadas
  useEffect(() => {
    const root = document.documentElement

    // Convertir colores hex a HSL para compatibilidad con Tailwind
    const hexToHSL = (hex: string) => {
      // Implementación simple para convertir hex a HSL
      // En una implementación real, usaríamos una biblioteca como color2k o similar
      const r = Number.parseInt(hex.slice(1, 3), 16) / 255
      const g = Number.parseInt(hex.slice(3, 5), 16) / 255
      const b = Number.parseInt(hex.slice(5, 7), 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0,
        s = 0,
        l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
        }

        h = Math.round(h * 60)
      }

      s = Math.round(s * 100)
      l = Math.round(l * 100)

      return `${h} ${s}% ${l}%`
    }

    // Aplicar colores personalizados
    root.style.setProperty("--primary", hexToHSL(theme.primaryColor))
    root.style.setProperty("--secondary", hexToHSL(theme.secondaryColor))
    root.style.setProperty("--accent", hexToHSL(theme.accentColor))

    // Aplicar radio de borde
    const borderRadiusMap = {
      none: "0rem",
      small: "0.25rem",
      medium: "0.5rem",
      large: "1rem",
      full: "9999px",
    }
    root.style.setProperty("--radius", borderRadiusMap[theme.borderRadius])

    // Aplicar fuentes
    if (theme.fontFamily) {
      root.style.setProperty("--font-family", theme.fontFamily)
    }

    // Guardar tema en localStorage
    localStorage.setItem("app-theme", JSON.stringify(theme))
  }, [theme])

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    setTheme((prevTheme) => ({
      ...prevTheme,
      ...newTheme,
    }))
  }

  const resetTheme = () => {
    setTheme(defaultThemeConfig)
    localStorage.removeItem("app-theme")
  }

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
  }

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider")
  }
  return context
}
