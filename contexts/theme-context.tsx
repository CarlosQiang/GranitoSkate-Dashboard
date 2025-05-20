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
  saveTheme: () => Promise<boolean>
  isSaving: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(defaultThemeConfig)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar tema desde localStorage al iniciar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        setIsLoading(true)

        // Primero intentamos cargar desde localStorage para una experiencia más rápida
        const savedTheme = localStorage.getItem("app-theme")
        if (savedTheme) {
          try {
            const parsedTheme = JSON.parse(savedTheme)
            setTheme(parsedTheme)
          } catch (error) {
            console.error("Error al cargar el tema guardado:", error)
          }
        }

        // Luego intentamos cargar desde la API si está disponible
        try {
          const response = await fetch("/api/theme")
          if (response.ok) {
            const data = await response.json()
            if (data.themeConfig) {
              setTheme(data.themeConfig)
              localStorage.setItem("app-theme", JSON.stringify(data.themeConfig))
            }
          }
        } catch (error) {
          console.error("Error al cargar el tema desde la API:", error)
          // No bloqueamos la carga si la API falla
        }
      } catch (error) {
        console.error("Error al cargar el tema:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [])

  // Detectar preferencia de modo oscuro
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const savedDarkMode = localStorage.getItem("dark-mode")

    if (savedDarkMode) {
      setIsDarkMode(savedDarkMode === "true")
    } else if (theme.preferDarkMode || (theme.enableDarkMode && prefersDark)) {
      setIsDarkMode(true)
    }
  }, [theme.enableDarkMode, theme.preferDarkMode])

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
    if (isLoading) return

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

    // Aplicar clases de animación
    if (theme.enableAnimations) {
      document.body.classList.remove("disable-animations")
      document.body.classList.add(`theme-animation-${theme.animationSpeed}`)
    } else {
      document.body.classList.add("disable-animations")
      document.body.classList.remove("theme-animation-slow", "theme-animation-normal", "theme-animation-fast")
    }

    // Guardar tema en localStorage para acceso rápido
    localStorage.setItem("app-theme", JSON.stringify(theme))
  }, [theme, isLoading])

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

  const saveTheme = async (): Promise<boolean> => {
    try {
      setIsSaving(true)

      // Intentar guardar en la API si está disponible
      try {
        const response = await fetch("/api/theme", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ themeConfig: theme }),
        })

        if (!response.ok) {
          console.error("Error al guardar el tema en la API:", await response.text())
        }
      } catch (error) {
        console.error("Error al guardar el tema en la API:", error)
        // No bloqueamos el guardado si la API falla
      }

      // Siempre guardamos en localStorage
      localStorage.setItem("app-theme", JSON.stringify(theme))
      return true
    } catch (error) {
      console.error("Error al guardar el tema:", error)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        updateTheme,
        resetTheme,
        isDarkMode,
        toggleDarkMode,
        saveTheme,
        isSaving,
      }}
    >
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
