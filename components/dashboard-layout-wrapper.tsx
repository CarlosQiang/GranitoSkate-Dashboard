"use client"

import type React from "react"

import { ErrorSuppressor } from "./error-suppressor"

export function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ErrorSuppressor selector=".shopify-error-message" />
      {children}
    </>
  )
}
