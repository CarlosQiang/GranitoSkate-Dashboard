export interface ThemeConfig {
  // Colores principales
  primaryColor: string
  secondaryColor: string
  accentColor: string

  // Tipografía
  fontFamily: string
  headingFontFamily: string

  // Branding
  logoUrl: string | null
  shopName: string
  favicon: string | null

  // UI
  borderRadius: "none" | "small" | "medium" | "large" | "full"
  buttonStyle: "solid" | "outline" | "soft" | "ghost"
  cardStyle: "flat" | "raised" | "bordered"

  // Layout
  sidebarStyle: "default" | "compact" | "expanded"
  contentWidth: "default" | "narrow" | "wide" | "full"

  // Modo oscuro
  enableDarkMode: boolean
  preferDarkMode: boolean

  // Animaciones
  enableAnimations: boolean
  animationSpeed: "slow" | "normal" | "fast"
}

export const defaultThemeConfig: ThemeConfig = {
  // Colores de Granito por defecto
  primaryColor: "#c7a04a",
  secondaryColor: "#4a6fc7",
  accentColor: "#c74a6f",

  // Tipografía
  fontFamily: "Inter, sans-serif",
  headingFontFamily: "Inter, sans-serif",

  // Branding
  logoUrl: null,
  shopName: "GranitoSkate",
  favicon: null,

  // UI
  borderRadius: "medium",
  buttonStyle: "solid",
  cardStyle: "raised",

  // Layout
  sidebarStyle: "default",
  contentWidth: "default",

  // Modo oscuro
  enableDarkMode: true,
  preferDarkMode: false,

  // Animaciones
  enableAnimations: true,
  animationSpeed: "normal",
}
