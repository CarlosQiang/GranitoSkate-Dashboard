"use client"

import { useState, useEffect } from "react"

export function useMobileView(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Función para verificar si la vista es móvil
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Verificar inicialmente
    checkMobile()

    // Agregar listener para cambios de tamaño
    window.addEventListener("resize", checkMobile)

    // Limpiar listener al desmontar
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [breakpoint])

  return isMobile
}
