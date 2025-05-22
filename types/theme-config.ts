export interface ThemeConfig {
  // Colores principales
  primaryColor: string
  secondaryColor: string
  accentColor: string

  // Nuevos colores de texto
  textColor: string
  headingColor: string
  mutedTextColor: string
  linkColor: string

  // Fuentes
  fontFamily: string
  headingFontFamily: string
  fontSize: "small" | "medium" | "large"

  // Estilos de interfaz
  borderRadius: "none" | "small" | "medium" | "large" | "full"
  buttonStyle: "solid" | "outline" | "soft" | "ghost"
  cardStyle: "flat" | "raised" | "bordered"
  sidebarStyle: "default" | "compact" | "expanded"

  // Animaciones
  enableAnimations: boolean
  animationSpeed: "slow" | "normal" | "fast"

  // Modo oscuro
  enableDarkMode: boolean
  preferDarkMode: boolean

  // Branding
  shopName: string
  logoUrl: string | null
  favicon: string | null
}

export const defaultThemeConfig: ThemeConfig = {
  // Colores principales
  primaryColor: "#c7a04a", // Color dorado de Granito
  secondaryColor: "#4b5563",
  accentColor: "#3182ce",

  // Colores de texto
  textColor: "#4b5563",
  headingColor: "#111827",
  mutedTextColor: "#6b7280",
  linkColor: "#c7a04a", // Mismo que primaryColor por defecto

  // Fuentes
  fontFamily: "Inter, sans-serif",
  headingFontFamily: "Inter, sans-serif",
  fontSize: "medium",

  // Estilos de interfaz
  borderRadius: "medium",
  buttonStyle: "solid",
  cardStyle: "raised",
  sidebarStyle: "default",

  // Animaciones
  enableAnimations: true,
  animationSpeed: "normal",

  // Modo oscuro
  enableDarkMode: true,
  preferDarkMode: false,

  // Branding
  shopName: "GranitoSkate",
  logoUrl: null,
  favicon: null,
}
