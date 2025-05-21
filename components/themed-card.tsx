"use client"

import type React from "react"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "@/contexts/theme-context"

interface ThemedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "flat"
}

const ThemedCard = forwardRef<HTMLDivElement, ThemedCardProps>(
  ({ className, variant = "default", style, ...props }, ref) => {
    const { theme } = useTheme()

    // Estilos personalizados basados en el tema
    const customStyle: React.CSSProperties = {
      ...style,
    }

    // Aplicar estilos según la variante
    if (variant === "bordered") {
      customStyle.borderColor = theme.primaryColor
      customStyle.borderWidth = "2px"
    } else if (variant === "flat") {
      customStyle.boxShadow = "none"
      customStyle.border = "none"
    }

    return <Card className={cn("themed-card", className)} style={customStyle} ref={ref} {...props} />
  },
)
ThemedCard.displayName = "ThemedCard"

const ThemedCardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <CardHeader className={cn("themed-card-header", className)} ref={ref} {...props} />
  },
)
ThemedCardHeader.displayName = "ThemedCardHeader"

const ThemedCardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { theme } = useTheme()
    const customStyle: React.CSSProperties = {
      color: theme.primaryColor,
    }

    return <CardTitle className={cn("themed-card-title", className)} style={customStyle} ref={ref} {...props} />
  },
)
ThemedCardTitle.displayName = "ThemedCardTitle"

const ThemedCardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return <CardDescription className={cn("themed-card-description", className)} ref={ref} {...props} />
  },
)
ThemedCardDescription.displayName = "ThemedCardDescription"

const ThemedCardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <CardContent className={cn("themed-card-content", className)} ref={ref} {...props} />
  },
)
ThemedCardContent.displayName = "ThemedCardContent"

const ThemedCardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <CardFooter className={cn("themed-card-footer", className)} ref={ref} {...props} />
  },
)
ThemedCardFooter.displayName = "ThemedCardFooter"

export { ThemedCard, ThemedCardHeader, ThemedCardTitle, ThemedCardDescription, ThemedCardContent, ThemedCardFooter }
