"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  className?: string
  id?: string
}

export function ColorPicker({ color, onChange, className, id }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Colores predefinidos
  const presetColors = [
    "#c7a04a", // Granito (default)
    "#4a6fc7", // Azul
    "#c74a6f", // Rosa
    "#4ac7a0", // Verde menta
    "#c7a04a", // Dorado
    "#6f4ac7", // Púrpura
    "#c74a4a", // Rojo
    "#4ac74a", // Verde
    "#000000", // Negro
    "#ffffff", // Blanco
  ]

  // Abrir el selector de color nativo al hacer clic
  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  // Manejar cambio de color
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  // Manejar selección de color predefinido
  const handlePresetClick = (presetColor: string) => {
    onChange(presetColor)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn("h-10 w-10 rounded-md border border-input flex items-center justify-center", className)}
          onClick={handleClick}
          id={id}
        >
          <div className="h-8 w-8 rounded-sm" style={{ backgroundColor: color }} />
          <input
            ref={inputRef}
            type="color"
            value={color}
            onChange={handleChange}
            className="sr-only"
            aria-label="Seleccionar color"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Colores predefinidos</h4>
          <div className="flex flex-wrap gap-2">
            {presetColors.map((presetColor) => (
              <button
                key={presetColor}
                className={cn(
                  "h-6 w-6 rounded-md border",
                  color === presetColor && "ring-2 ring-primary ring-offset-2",
                )}
                style={{ backgroundColor: presetColor }}
                onClick={() => handlePresetClick(presetColor)}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
