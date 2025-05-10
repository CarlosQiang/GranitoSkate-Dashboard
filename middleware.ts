import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware extremadamente simplificado para diagnosticar el problema
export function middleware(request: NextRequest) {
  // Solo verificamos si es una ruta de API o un recurso estático
  const { pathname } = request.nextUrl

  // Permitir todas las solicitudes a recursos estáticos y APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // Cualquier archivo con extensión
  ) {
    return NextResponse.next()
  }

  // Para rutas de páginas, simplemente permitimos todo por ahora
  return NextResponse.next()
}

// Matcher simplificado
export const config = {
  matcher: [
    // Excluir explícitamente rutas estáticas y API
    "/((?!_next/|api/|.*\\.[^/]*$).*)",
  ],
}
