import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware simplificado para evitar errores
export function middleware(request: NextRequest) {
  // Obtener la ruta actual
  const { pathname } = request.nextUrl

  // Si es la ruta raíz, redirigir a login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Para todas las demás rutas, continuar
  return NextResponse.next()
}

// Configurar las rutas que deben ser procesadas por el middleware
export const config = {
  matcher: ["/"],
}
