import { NextResponse } from "next/server"
import { runDeploymentChecks } from "@/lib/deployment-check"

export async function GET() {
  try {
    const checks = await runDeploymentChecks()

    return NextResponse.json({
      ready: checks.ready,
      checks,
    })
  } catch (error) {
    console.error("Error al ejecutar las verificaciones de despliegue:", error)
    return NextResponse.json(
      {
        ready: false,
        error: error.message || "Error al ejecutar las verificaciones de despliegue",
      },
      { status: 500 },
    )
  }
}
