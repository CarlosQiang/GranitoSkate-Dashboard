"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface FallbackDataContextProps {
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
}

const FallbackDataContext = createContext<FallbackDataContextProps>({
  isLoading: false,
  setIsLoading: () => {},
})

export const FallbackDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false)

  return <FallbackDataContext.Provider value={{ isLoading, setIsLoading }}>{children}</FallbackDataContext.Provider>
}

export const useFallbackData = () => useContext(FallbackDataContext)
