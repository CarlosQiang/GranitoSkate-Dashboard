"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Contexto para los datos de fallback
const FallbackDataContext = createContext({
  useFallbackData: false,
  toggleFallbackData: () => {},
})

// Hook para usar el contexto
export const useFallbackData = () => useContext(FallbackDataContext)

// Proveedor del contexto
export function FallbackDataProvider({ children }: { children: ReactNode }) {
  const [useFallbackData, setUseFallbackData] = useState(false)

  // Comprobar si hay errores de API al cargar
  useEffect(() => {
    const checkForApiErrors = () => {
      const errors = document.querySelectorAll(".error-message")
      if (errors.length > 0) {
        console.log("Detectados errores de API, activando datos de fallback")
        setUseFallbackData(true)
      }
    }

    // Comprobar después de que la página se haya cargado completamente
    window.addEventListener("load", checkForApiErrors)

    // También comprobar después de un tiempo para capturar errores de carga asíncrona
    const timeout = setTimeout(checkForApiErrors, 3000)

    return () => {
      window.removeEventListener("load", checkForApiErrors)
      clearTimeout(timeout)
    }
  }, [])

  const toggleFallbackData = () => {
    setUseFallbackData((prev) => !prev)
  }

  return (
    <FallbackDataContext.Provider value={{ useFallbackData, toggleFallbackData }}>
      {children}
    </FallbackDataContext.Provider>
  )
}

// Datos de ejemplo para promociones
export const fallbackPromotions = [
  {
    id: "fallback-1",
    title: "Descuento de verano",
    code: "VERANO2023",
    isAutomatic: false,
    startsAt: "2023-06-01T00:00:00Z",
    endsAt: "2023-08-31T23:59:59Z",
    status: "ACTIVE",
    valueType: "percentage",
    value: "15",
    currencyCode: "EUR",
    summary: "15% de descuento en todos los productos",
  },
  {
    id: "fallback-2",
    title: "Envío gratis",
    code: null,
    isAutomatic: true,
    startsAt: "2023-01-01T00:00:00Z",
    endsAt: null,
    status: "ACTIVE",
    valueType: "fixed_amount",
    value: "5",
    currencyCode: "EUR",
    summary: "Envío gratis en compras superiores a 50€",
  },
]

// Datos de ejemplo para clientes
export const fallbackCustomers = [
  {
    id: "fallback-1",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@example.com",
    phone: "+34600000000",
    ordersCount: 5,
    totalSpent: {
      amount: "350.75",
      currencyCode: "EUR",
    },
    createdAt: "2022-03-15T10:30:00Z",
  },
  {
    id: "fallback-2",
    firstName: "María",
    lastName: "García",
    email: "maria.garcia@example.com",
    phone: "+34611111111",
    ordersCount: 3,
    totalSpent: {
      amount: "210.50",
      currencyCode: "EUR",
    },
    createdAt: "2022-05-20T14:45:00Z",
  },
  {
    id: "fallback-3",
    firstName: "Carlos",
    lastName: "Rodríguez",
    email: "carlos.rodriguez@example.com",
    phone: "+34622222222",
    ordersCount: 1,
    totalSpent: {
      amount: "75.25",
      currencyCode: "EUR",
    },
    createdAt: "2022-08-10T09:15:00Z",
  },
]
