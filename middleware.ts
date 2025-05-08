import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthenticated = request.cookies.has("session")

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ["/login", "/api/auth/login"]
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

  // Redirigir a login si no está autenticado y no es una ruta pública
  if (!isAuthenticated && !isPublicRoute && !pathname.includes("_next")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Redirigir al dashboard si ya está autenticado e intenta acceder a login
  if (isAuthenticated && pathname === "/login") {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api/auth/login|_next/static|_next/image|favicon.ico).*)"],
}
