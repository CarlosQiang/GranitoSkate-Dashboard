export interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  headingFontFamily: string
  borderRadius: "none" | "small" | "medium" | "large" | "full"
  buttonStyle: "default" | "outline" | "ghost" | "link"
  cardStyle: "default" | "flat" | "elevated"
  sidebarStyle: "default" | "minimal" | "expanded"
  enableAnimations: boolean
  animationSpeed: "slow" | "normal" | "fast"
  enableDarkMode: boolean
  preferDarkMode: boolean
  shopName: string
  logoUrl: string | null
  favicon: string | null
  textColor: string
  headingColor: string
  mutedTextColor: string
  linkColor: string
  fontSize: "small" | "medium" | "large"
}

export const defaultThemeConfig: ThemeConfig = {
  primaryColor: "#C9379D",
  secondaryColor: "#6941C6",
  accentColor: "#E54065",
  fontFamily: "Inter, sans-serif",
  headingFontFamily: "Inter, sans-serif",
  borderRadius: "medium",
  buttonStyle: "default",
  cardStyle: "default",
  sidebarStyle: "default",
  enableAnimations: true,
  animationSpeed: "normal",
  enableDarkMode: true,
  preferDarkMode: false,
  shopName: "GranitoSkate",
  logoUrl: null,
  favicon: null,
  textColor: "#1F2937",
  headingColor: "#111827",
  mutedTextColor: "#6B7280",
  linkColor: "#C9379D",
  fontSize: "medium",
}
