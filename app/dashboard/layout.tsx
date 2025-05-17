import type React from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardNav />
      <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
        <Suspense fallback={<div>Cargando...</div>}>{children}</Suspense>
      </main>
    </div>
  )
}
