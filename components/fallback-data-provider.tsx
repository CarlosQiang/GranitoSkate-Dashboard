"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Contexto para el proveedor de datos de fallback
const FallbackDataContext = createContext({
  useFallbackData: false,
  setUseFallbackData: (value: boolean) => {},
})

// Hook para usar el contexto
export function useFallbackData() {
  return useContext(FallbackDataContext)
}

// Proveedor de datos de fallback
export function FallbackDataProvider({ children }) {
  const [useFallbackData, setUseFallbackData] = useState(false)

  // Comprobar si hay problemas con la API al cargar
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch("/api/shopify/check")
        const data = await response.json()

        if (!data.success) {
          console.warn("API check failed, using fallback data:", data.message)
          setUseFallbackData(true)
        }
      } catch (error) {
        console.error("Error checking API status:", error)
        setUseFallbackData(true)
      }
    }

    checkApiStatus()
  }, [])

  return (
    <FallbackDataContext.Provider value={{ useFallbackData, setUseFallbackData }}>
      {children}
    </FallbackDataContext.Provider>
  )
}

// Datos de fallback para clientes
export const fallbackCustomers = [
  {
    id: "gid://shopify/Customer/1",
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@example.com",
    phone: "+34612345678",
    ordersCount: 5,
    totalSpent: {
      amount: "450.00",
      currencyCode: "EUR",
    },
    createdAt: "2023-01-15T10:00:00Z",
  },
  {
    id: "gid://shopify/Customer/2",
    firstName: "María",
    lastName: "García",
    email: "maria.garcia@example.com",
    phone: "+34623456789",
    ordersCount: 3,
    totalSpent: {
      amount: "320.50",
      currencyCode: "EUR",
    },
    createdAt: "2023-02-20T15:30:00Z",
  },
  {
    id: "gid://shopify/Customer/3",
    firstName: "Carlos",
    lastName: "Rodríguez",
    email: "carlos.rodriguez@example.com",
    phone: "+34634567890",
    ordersCount: 8,
    totalSpent: {
      amount: "780.25",
      currencyCode: "EUR",
    },
    createdAt: "2022-11-05T09:15:00Z",
  },
  {
    id: "gid://shopify/Customer/4",
    firstName: "Laura",
    lastName: "Martínez",
    email: "laura.martinez@example.com",
    phone: "+34645678901",
    ordersCount: 2,
    totalSpent: {
      amount: "150.75",
      currencyCode: "EUR",
    },
    createdAt: "2023-03-10T12:45:00Z",
  },
  {
    id: "gid://shopify/Customer/5",
    firstName: "David",
    lastName: "López",
    email: "david.lopez@example.com",
    phone: "+34656789012",
    ordersCount: 6,
    totalSpent: {
      amount: "520.00",
      currencyCode: "EUR",
    },
    createdAt: "2022-12-18T14:20:00Z",
  },
]

// Datos de fallback para promociones
export const fallbackPromotions = [
  {
    id: "gid://shopify/PriceRule/1",
    title: "Descuento de verano",
    summary: "20% de descuento en todos los productos",
    startsAt: "2023-06-01T00:00:00Z",
    endsAt: "2023-08-31T23:59:59Z",
    status: "ACTIVE",
    target: "ALL",
    valueType: "percentage",
    value: "20.0",
    usageLimit: 100,
    usageCount: 45,
    code: "VERANO20",
    createdAt: "2023-05-15T10:00:00Z",
    updatedAt: "2023-05-15T10:00:00Z",
  },
  {
    id: "gid://shopify/PriceRule/2",
    title: "Envío gratis",
    summary: "Envío gratis en compras superiores a 50€",
    startsAt: "2023-01-01T00:00:00Z",
    endsAt: null,
    status: "ACTIVE",
    target: "SHIPPING_LINE",
    valueType: "fixed_amount",
    value: "0.0",
    usageLimit: null,
    usageCount: 120,
    code: "ENVIOGRATIS",
    createdAt: "2022-12-20T09:30:00Z",
    updatedAt: "2022-12-20T09:30:00Z",
  },
  {
    id: "gid://shopify/PriceRule/3",
    title: "Descuento primera compra",
    summary: "10€ de descuento en tu primera compra",
    startsAt: "2023-03-01T00:00:00Z",
    endsAt: "2023-12-31T23:59:59Z",
    status: "ACTIVE",
    target: "LINE_ITEM",
    valueType: "fixed_amount",
    value: "10.0",
    usageLimit: 1,
    usageCount: 87,
    code: "BIENVENIDO10",
    createdAt: "2023-02-15T14:45:00Z",
    updatedAt: "2023-02-15T14:45:00Z",
  },
]
