import type { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { ActivityLogger } from "@/lib/services/activity-logger"

export async function withActivityLogging(request: NextRequest, handler: (req: NextRequest) => Promise<NextResponse>) {
  const startTime = Date.now()
  const token = await getToken({ req: request })

  try {
    // Ejecutar el handler
    const response = await handler(request)
    const duration = Date.now() - startTime

    // Registrar la actividad exitosa
    if (token) {
      await ActivityLogger.log({
        usuarioId: token.sub ? Number.parseInt(token.sub) : undefined,
        usuarioNombre: token.name || "Usuario desconocido",
        accion: "API_REQUEST",
        entidad: "API",
        entidadId: request.nextUrl.pathname,
        descripcion: `${request.method} ${request.nextUrl.pathname}`,
        metadatos: {
          method: request.method,
          url: request.nextUrl.toString(),
          status: response.status,
        },
        ipAddress: request.ip || request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
        resultado: response.status < 400 ? "SUCCESS" : "ERROR",
        duracionMs: duration,
      })
    }

    return response
  } catch (error) {
    const duration = Date.now() - startTime

    // Registrar el error
    if (token) {
      await ActivityLogger.log({
        usuarioId: token.sub ? Number.parseInt(token.sub) : undefined,
        usuarioNombre: token.name || "Usuario desconocido",
        accion: "API_REQUEST",
        entidad: "API",
        entidadId: request.nextUrl.pathname,
        descripcion: `${request.method} ${request.nextUrl.pathname}`,
        metadatos: {
          method: request.method,
          url: request.nextUrl.toString(),
        },
        ipAddress: request.ip || request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
        resultado: "ERROR",
        errorMensaje: error instanceof Error ? error.message : "Error desconocido",
        duracionMs: duration,
      })
    }

    throw error
  }
}
