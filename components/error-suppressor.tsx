"use client"

import { useEffect, useState } from "react"

interface ErrorSuppressorProps {
  selector: string
  hideErrors?: boolean
}

export function ErrorSuppressor({ selector, hideErrors = true }: ErrorSuppressorProps) {
  const [hasRun, setHasRun] = useState(false)

  useEffect(() => {
    if (hasRun) return

    const suppressErrors = () => {
      const errorElements = document.querySelectorAll(selector)

      if (errorElements.length > 0) {
        errorElements.forEach((element) => {
          if (hideErrors) {
            // Ocultar el elemento de error
            ;(element as HTMLElement).style.display = "none"
          } else {
            // Añadir una clase para estilizar el elemento de error
            element.classList.add("suppressed-error")
          }
        })

        setHasRun(true)
      }
    }

    // Ejecutar inmediatamente
    suppressErrors()

    // Configurar un intervalo para seguir comprobando
    const interval = setInterval(suppressErrors, 1000)

    return () => clearInterval(interval)
  }, [selector, hideErrors, hasRun])

  return null
}
