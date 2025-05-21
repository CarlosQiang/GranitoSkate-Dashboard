"use client"

import type React from "react"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/theme-context"

interface ThemedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, style, ...props }, ref) => {
    const { theme } = useTheme()

    // Estilos personalizados basados en el tema
    const customStyle: React.CSSProperties = {
      ...style,
    }

    // Si es el botón predeterminado, aplicamos el color primario
    if (variant === "default") {
      customStyle.backgroundColor = theme.primaryColor
      customStyle.color = "#ffffff"
    } else if (variant === "outline") {
      customStyle.borderColor = theme.primaryColor
      customStyle.color = theme.primaryColor
    } else if (variant === "secondary") {
      customStyle.backgroundColor = theme.secondaryColor
      customStyle.color = "#ffffff"
    }

    return (
      <Button
        className={cn("themed-button", className)}
        variant={variant}
        size={size}
        asChild={asChild}
        style={customStyle}
        ref={ref}
        {...props}
      />
    )
  },
)
ThemedButton.displayName = "ThemedButton"

export { ThemedButton }
