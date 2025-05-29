import { NextResponse } from "next/server"
import { fetchDashboardStats } from "@/lib/api/dashboard"

export async function GET() {
  try {
    const dashboardData = await fetchDashboardStats()
    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error)
    return NextResponse.json({ error: "Error al obtener datos del dashboard" }, { status: 500 })
  }
}
