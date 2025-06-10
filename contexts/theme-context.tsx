"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, type ReactNode } from "react"

// Define el tipo para la configuración del tema
interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  // Agrega aquí más propiedades según sea necesario
}

// Define el contexto del tema
interface ThemeContextProps {
  theme: ThemeConfig | null
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig | null>>
  isLoading: boolean
}

// Crea el contexto del tema con un valor predeterminado
const ThemeContext = createContext<ThemeContextProps>({
  theme: null,
  setTheme: () => {},
  isLoading: true,
})

// Define un tema predeterminado
const defaultThemeConfig: ThemeConfig = {
  primaryColor: "#007bff",
  secondaryColor: "#6c757d",
}

// Crea un proveedor de tema
interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    loadTheme()
  }, [])

  const loadTheme = async () => {
    try {
      const response = await fetch("/api/theme")
      if (response.ok) {
        const data = await response.json()
        setTheme(data.config)
      } else {
        // Si no se puede cargar, usar la configuración predeterminada
        setTheme(defaultThemeConfig)

        // Intentar inicializar los assets predeterminados
        try {
          await fetch("/api/theme", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(defaultThemeConfig),
          })
        } catch (initError) {
          console.warn("No se pudieron inicializar los assets predeterminados:", initError)
        }
      }
    } catch (error) {
      console.error("Error al cargar el tema:", error)
      setTheme(defaultThemeConfig)
    } finally {
      setIsLoading(false)
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>{children}</ThemeContext.Provider>
}

// Crea un hook personalizado para usar el contexto del tema
export const useTheme = (): ThemeContextProps => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider")
  }
  return context
}
