import type React from "react"
import { DashboardLayoutWrapper } from "@/components/dashboard-layout-wrapper"
import { DynamicHead } from "@/components/dynamic-head"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <DynamicHead />
      <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>
    </>
  )
}
