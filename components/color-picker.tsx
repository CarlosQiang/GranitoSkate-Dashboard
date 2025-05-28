"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  presets?: string[]
}

const defaultPresets = {
  "Brand Colors": [
    "#007bff", // Blue
    "#28a745", // Green
    "#dc3545", // Red
    "#ffc107", // Yellow
    "#17a2b8", // Cyan
    "#fd7e14", // Orange
  ],
  "Cool Palettes": ["#e0f2f1", "#a5d8d3", "#52b69a", "#168aad", "#1a759f"],
  "Warm Palettes": ["#fff3b0", "#ffc857", "#ff9f0a", "#ff7000", "#ff5100"],
  "Neutral Colors": [
    "#ffffff", // White
    "#f8f9fa", // Light Gray
    "#e9ecef", // Gray
    "#adb5bd", // Medium Gray
    "#495057", // Dark Gray
    "#000000", // Black
  ],
  "Seasonal Colors": {
    Spring: ["#E9D8A6", "#95B8D1", "#8CB369", "#F2D7D9", "#6B486B"],
    Summer: ["#F7DAD9", "#D6E8DB", "#BBDED6", "#FAE3D5", "#F0E68C"],
    Autumn: ["#E0BBE4", "#957DAD", "#D291BC", "#FEC8D8", "#FFDFD3"],
    Winter: ["#A7D1AB", "#A7D1CD", "#ADBAC7", "#B48E92", "#898AA6"],
  },
}

export function ColorPicker({ color, onChange, presets = [] }: ColorPickerProps) {
  const [localColor, setLocalColor] = useState(color)
  const [isOpen, setIsOpen] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sliderRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [sliderValue, setSliderValue] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [recentColors, setRecentColors] = useState<string[]>([])

  // Inicializar el color local cuando cambia el color prop
  useEffect(() => {
    setLocalColor(color)
    const hsv = hexToHsv(color)
    setSliderValue(hsv.h)
    // Calcular la posición basada en S y V
    if (canvasRef.current) {
      const width = canvasRef.current.width
      const height = canvasRef.current.height
      setPosition({
        x: hsv.s * width,
        y: (1 - hsv.v) * height,
      })
    }
  }, [color])

  // Dibujar el selector de color cuando cambia el valor del slider
  useEffect(() => {
    if (canvasRef.current && sliderRef.current && isOpen) {
      drawColorPicker(canvasRef.current, sliderValue)
      drawHueSlider(sliderRef.current)
    }
  }, [sliderValue, isOpen])

  // Convertir de HSV a RGB
  const hsvToRgb = (h: number, s: number, v: number) => {
    let r = 0,
      g = 0,
      b = 0
    const i = Math.floor(h * 6)
    const f = h * 6 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)

    switch (i % 6) {
      case 0:
        r = v
        g = t
        b = p
        break
      case 1:
        r = q
        g = v
        b = p
        break
      case 2:
        r = p
        g = v
        b = t
        break
      case 3:
        r = p
        g = q
        b = v
        break
      case 4:
        r = t
        g = p
        b = v
        break
      case 5:
        r = v
        g = p
        b = q
        break
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    }
  }

  // Convertir de RGB a Hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${[r, g, b]
      .map((x) => {
        const hex = x.toString(16)
        return hex.length === 1 ? "0" + hex : hex
      })
      .join("")}`
  }

  // Convertir de Hex a HSV
  const hexToHsv = (hex: string) => {
    // Eliminar el # si existe
    hex = hex.replace(/^#/, "")

    // Convertir a RGB
    let r = 0,
      g = 0,
      b = 0
    if (hex.length === 3) {
      r = Number.parseInt(hex[0] + hex[0], 16)
      g = Number.parseInt(hex[1] + hex[1], 16)
      b = Number.parseInt(hex[2] + hex[2], 16)
    } else if (hex.length === 6) {
      r = Number.parseInt(hex.substring(0, 2), 16)
      g = Number.parseInt(hex.substring(2, 4), 16)
      b = Number.parseInt(hex.substring(4, 6), 16)
    }

    // Convertir RGB a HSV
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0,
      s = 0,
      v = max

    const d = max - min
    s = max === 0 ? 0 : d / max

    if (max === min) {
      h = 0 // achromatic
    } else {
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
      h /= 6
    }

    return { h, s, v }
  }

  // Dibujar el selector de color
  const drawColorPicker = (canvas: HTMLCanvasElement, hue: number) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Dibujar el gradiente de saturación (eje x)
    for (let x = 0; x < width; x++) {
      // Dibujar el gradiente de valor (eje y)
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      const s = x / width

      const rgb = hsvToRgb(hue, s, 1)
      gradient.addColorStop(0, `rgb(255, 255, 255)`) // Blanco en la parte superior
      gradient.addColorStop(1, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`) // Color en la parte inferior

      ctx.fillStyle = gradient
      ctx.fillRect(x, 0, 1, height)
    }

    // Dibujar el indicador de posición
    ctx.beginPath()
    ctx.arc(position.x, position.y, 5, 0, Math.PI * 2)
    ctx.strokeStyle = "white"
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Dibujar el slider de tono
  const drawHueSlider = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Dibujar el gradiente de tono
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    for (let i = 0; i <= 1; i += 1 / 6) {
      const rgb = hsvToRgb(i, 1, 1)
      gradient.addColorStop(i, `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Dibujar el indicador de posición
    const sliderPos = sliderValue * width
    ctx.beginPath()
    ctx.rect(sliderPos - 2, 0, 4, height)
    ctx.strokeStyle = "white"
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Manejar el clic en el selector de color
  const handleColorPickerClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(canvasRef.current.width, e.clientX - rect.left))
    const y = Math.max(0, Math.min(canvasRef.current.height, e.clientY - rect.top))

    setPosition({ x, y })
    updateColorFromPosition(x, y)
    setIsDragging(true)
  }

  // Manejar el movimiento del ratón
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(canvasRef.current.width, e.clientX - rect.left))
    const y = Math.max(0, Math.min(canvasRef.current.height, e.clientY - rect.top))

    setPosition({ x, y })
    updateColorFromPosition(x, y)
  }

  // Manejar el final del arrastre
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Actualizar el color basado en la posición
  const updateColorFromPosition = (x: number, y: number) => {
    if (!canvasRef.current) return

    const width = canvasRef.current.width
    const height = canvasRef.current.height

    const s = x / width
    const v = 1 - y / height

    const rgb = hsvToRgb(sliderValue, s, v)
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)

    setLocalColor(hex)
  }

  // Manejar el clic en el slider de tono
  const handleHueSliderClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(sliderRef.current.width, e.clientX - rect.left))

    const hue = x / sliderRef.current.width
    setSliderValue(hue)

    // Actualizar el color basado en la nueva tonalidad
    updateColorFromPosition(position.x, position.y)
  }

  // Configurar los event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  // Validar el formato hexadecimal del color
  const isValidHexColor = (hex: string): boolean => {
    return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex)
  }

  // Manejar el cambio de color
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    if (isValidHexColor(newColor) || newColor === "") {
      setLocalColor(newColor)
    }
  }

  const addRecentColor = useCallback(
    (newColor: string) => {
      setRecentColors((prevColors) => {
        // Si el color ya está en el historial, no lo agregamos de nuevo
        if (prevColors.includes(newColor)) {
          return prevColors
        }
        // Agregamos el nuevo color al principio del array
        const updatedColors = [newColor, ...prevColors]
        // Limitamos el historial a un máximo de 10 colores
        return updatedColors.slice(0, 10)
      })
    },
    [setRecentColors],
  )

  // Aplicar el color
  const applyColor = () => {
    if (isValidHexColor(localColor)) {
      onChange(localColor)
      addRecentColor(localColor)
      setIsOpen(false)
    } else {
      alert("Please enter a valid hex color.")
    }
  }

  // Cancelar el cambio de color
  const cancelColorChange = () => {
    setLocalColor(color)
    setIsOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-10 h-10 rounded-md border overflow-hidden"
            style={{ backgroundColor: localColor }}
            aria-label="Seleccionar color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-3">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={200}
                height={200}
                className="w-full h-40 rounded-md cursor-crosshair"
                onMouseDown={handleColorPickerClick}
                aria-label="Color Picker"
                role="button"
                tabIndex={0}
              />
            </div>

            <div className="relative">
              <canvas
                ref={sliderRef}
                width={200}
                height={20}
                className="w-full h-5 rounded-md cursor-pointer"
                onMouseDown={handleHueSliderClick}
                aria-label="Hue Slider"
                role="slider"
                tabIndex={0}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: localColor }} />
              <Input value={localColor} onChange={handleColorChange} className="font-mono" aria-label="Color Input" />
            </div>

            {/* Recent Colors */}
            {recentColors.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                <p className="w-full text-sm font-medium">Recent Colors:</p>
                {recentColors.map((recentColor) => (
                  <button
                    key={recentColor}
                    type="button"
                    className="w-6 h-6 rounded-md border overflow-hidden"
                    style={{ backgroundColor: recentColor }}
                    onClick={() => {
                      setLocalColor(recentColor)
                    }}
                    aria-label={`Recent color ${recentColor}`}
                  />
                ))}
              </div>
            )}

            {/* Organized Presets */}
            {Object.entries(defaultPresets).map(([category, colors]) => (
              <div key={category} className="pt-2">
                <p className="w-full text-sm font-medium">{category}:</p>
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(colors) ? colors : Object.values(colors).flat()).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="w-6 h-6 rounded-md border overflow-hidden"
                      style={{ backgroundColor: preset }}
                      onClick={() => {
                        setLocalColor(preset)
                        onChange(preset)
                        setIsOpen(false)
                      }}
                      aria-label={`Preset color ${preset}`}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" onClick={cancelColorChange}>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button size="sm" onClick={applyColor}>
                <Check className="h-4 w-4 mr-1" />
                Aplicar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Input
        value={localColor}
        onChange={(e) => {
          const newColor = e.target.value
          if (isValidHexColor(newColor) || newColor === "") {
            setLocalColor(newColor)
            onChange(newColor)
          }
        }}
        className="font-mono"
      />
    </div>
  )
}
