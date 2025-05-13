import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware simplificado para evitar errores
export function middleware(request: NextRequest) {
  // Obtener la ruta actual
  const { pathname } = request.nextUrl

  // Si es la ruta raíz, permitir acceso (ahora será nuestra landing page)
  if (pathname === "/") {
    return NextResponse.next()
  }

  // Si es la ruta de login, permitir acceso
  if (pathname === "/login") {
    return NextResponse.next()
  }

  // Si es una ruta de API, permitir acceso
  if (pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Para rutas del dashboard, verificar la cookie de sesión
  if (pathname.startsWith("/dashboard")) {
    const authCookie =
      request.cookies.get("next-auth.session-token")?.value ||
      request.cookies.get("__Secure-next-auth.session-token")?.value

    // Si no hay cookie de sesión, redirigir a login
    if (!authCookie) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Para todas las demás rutas, continuar
  return NextResponse.next()
}

// Configurar las rutas que deben ser procesadas por el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
