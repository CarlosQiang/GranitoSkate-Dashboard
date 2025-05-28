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
  applyThemeToDOM: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(defaultThemeConfig)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Función para convertir hex a HSL
  const hexToHSL = (hex: string) => {
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

  // Función para ajustar el brillo de un color
  const adjustColor = (hex: string, percent: number): string => {
    let r = Number.parseInt(hex.substring(1, 3), 16)
    let g = Number.parseInt(hex.substring(3, 5), 16)
    let b = Number.parseInt(hex.substring(5, 7), 16)

    r = Math.min(255, Math.max(0, r + Math.round((percent / 100) * 255)))
    g = Math.min(255, Math.max(0, g + Math.round((percent / 100) * 255)))
    b = Math.min(255, Math.max(0, b + Math.round((percent / 100) * 255)))

    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }

  // Función para aplicar el tema al DOM
  const applyThemeToDOM = () => {
    const root = document.documentElement

    // Generar variaciones de color
    const primaryLight = adjustColor(theme.primaryColor, 15)
    const primaryDark = adjustColor(theme.primaryColor, -15)
    const primaryLighter = adjustColor(theme.primaryColor, 30)
    const primaryDarker = adjustColor(theme.primaryColor, -30)

    const secondaryLight = adjustColor(theme.secondaryColor, 15)
    const secondaryDark = adjustColor(theme.secondaryColor, -15)

    const accentLight = adjustColor(theme.accentColor, 15)
    const accentDark = adjustColor(theme.accentColor, -15)

    // Aplicar colores principales a variables CSS
    root.style.setProperty("--primary", hexToHSL(theme.primaryColor))
    root.style.setProperty("--primary-foreground", "210 40% 98%")
    root.style.setProperty("--secondary", hexToHSL(theme.secondaryColor))
    root.style.setProperty("--secondary-foreground", "222.2 84% 4.9%")
    root.style.setProperty("--accent", hexToHSL(theme.accentColor))
    root.style.setProperty("--accent-foreground", "210 40% 98%")
    root.style.setProperty("--ring", hexToHSL(theme.primaryColor))

    // Aplicar colores directos para compatibilidad
    root.style.setProperty("--color-primary", theme.primaryColor)
    root.style.setProperty("--color-primary-hover", theme.primaryColorHover || primaryDark)
    root.style.setProperty("--color-secondary", theme.secondaryColor)
    root.style.setProperty("--color-secondary-hover", theme.secondaryColorHover || secondaryDark)
    root.style.setProperty("--color-accent", theme.accentColor)
    root.style.setProperty("--color-accent-hover", theme.accentColorHover || accentDark)

    // Aplicar variaciones de granito para consistencia
    root.style.setProperty("--granito-50", hexToHSL(adjustColor(theme.primaryColor, 75)))
    root.style.setProperty("--granito-100", hexToHSL(adjustColor(theme.primaryColor, 60)))
    root.style.setProperty("--granito-200", hexToHSL(primaryLighter))
    root.style.setProperty("--granito-300", hexToHSL(primaryLight))
    root.style.setProperty("--granito-400", hexToHSL(adjustColor(theme.primaryColor, 5)))
    root.style.setProperty("--granito-500", hexToHSL(theme.primaryColor))
    root.style.setProperty("--granito-600", hexToHSL(primaryDark))
    root.style.setProperty("--granito-700", hexToHSL(primaryDarker))
    root.style.setProperty("--granito-800", hexToHSL(adjustColor(theme.primaryColor, -45)))
    root.style.setProperty("--granito-900", hexToHSL(adjustColor(theme.primaryColor, -60)))
    root.style.setProperty("--granito-950", hexToHSL(adjustColor(theme.primaryColor, -75)))

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
      document.body.style.fontFamily = theme.fontFamily
    }
    if (theme.headingFontFamily) {
      root.style.setProperty("--heading-font-family", theme.headingFontFamily)
    }

    // Aplicar estilos de botón
    root.setAttribute("data-button-style", theme.buttonStyle)

    // Aplicar estilos de tarjeta
    root.setAttribute("data-card-style", theme.cardStyle)

    // Aplicar estilos de sidebar
    root.setAttribute("data-sidebar-style", theme.sidebarStyle)

    // Aplicar animaciones
    if (theme.enableAnimations) {
      document.body.classList.remove("disable-animations")
      document.body.classList.add(`theme-animation-${theme.animationSpeed}`)
    } else {
      document.body.classList.add("disable-animations")
      document.body.classList.remove("theme-animation-slow", "theme-animation-normal", "theme-animation-fast")
    }

    // Aplicar modo de alto contraste
    if (theme.highContrastMode) {
      document.body.classList.add("high-contrast")
    } else {
      document.body.classList.remove("high-contrast")
    }

    // Aplicar nombre de la tienda
    if (theme.shopName) {
      const titleElements = document.querySelectorAll("[data-shop-name]")
      titleElements.forEach((el) => {
        el.textContent = theme.shopName
      })
    }

    // Aplicar colores a todos los botones personalizables
    const customButtons = document.querySelectorAll(".btn-primary, .btn-custom")
    customButtons.forEach((button) => {
      const btn = button as HTMLElement
      btn.style.backgroundColor = theme.primaryColor
      btn.style.borderColor = theme.primaryColor
    })

    // Aplicar colores a elementos de navegación activos
    const activeNavItems = document.querySelectorAll(".nav-item-active")
    activeNavItems.forEach((item) => {
      const navItem = item as HTMLElement
      navItem.style.backgroundColor = theme.primaryColor
    })

    // Aplicar colores a badges y elementos de estado
    const statusElements = document.querySelectorAll(".status-primary")
    statusElements.forEach((element) => {
      const el = element as HTMLElement
      el.style.backgroundColor = `${theme.primaryColor}20`
      el.style.color = theme.primaryColor
      el.style.borderColor = theme.primaryColor
    })

    console.log("Tema aplicado al DOM:", theme)
  }

  // Cargar tema desde la API al iniciar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        setIsLoading(true)

        // Cargar desde localStorage primero
        const savedTheme = localStorage.getItem("app-theme")
        if (savedTheme) {
          try {
            const parsedTheme = JSON.parse(savedTheme)
            setTheme(parsedTheme)
          } catch (error) {
            console.error("Error al cargar el tema guardado:", error)
          }
        }

        // Luego intentar cargar desde la API
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

  // Aplicar tema cuando cambie
  useEffect(() => {
    if (!isLoading) {
      applyThemeToDOM()
      localStorage.setItem("app-theme", JSON.stringify(theme))
    }
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
          return false
        }
      } catch (error) {
        console.error("Error al guardar el tema en la API:", error)
        return false
      }

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
        applyThemeToDOM,
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
