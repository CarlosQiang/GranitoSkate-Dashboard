import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Ignorar rutas de recursos estáticos
    if (
      pathname.includes("/_next") ||
      pathname.includes("/favicon.ico") ||
      pathname.includes("/logo.svg") ||
      pathname.includes(".png") ||
      pathname.includes(".jpg") ||
      pathname.includes(".svg") ||
      pathname.startsWith("/api/")
    ) {
      return NextResponse.next()
    }

    const isAuthenticated = request.cookies.has("session")

    // Rutas públicas que no requieren autenticación
    const publicRoutes = ["/login"]
    const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname === route + "/")

    // Redirigir a login si no está autenticado y no es una ruta pública
    if (!isAuthenticated && !isPublicRoute && pathname !== "/") {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }

    // Redirigir al dashboard si ya está autenticado e intenta acceder a login
    if (isAuthenticated && (pathname === "/login" || pathname === "/")) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Error en middleware:", error)
    // En caso de error, permitir que la solicitud continúe
    return NextResponse.next()
  }
}

// Modificamos el matcher para excluir correctamente los recursos estáticos
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
}
