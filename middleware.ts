import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    const isAuthenticated = request.cookies.has("session")

    // Rutas públicas que no requieren autenticación
    const publicRoutes = ["/login", "/api/auth/login"]
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route))

    // Ignorar rutas de recursos estáticos
    if (
      pathname.includes("_next") ||
      pathname.includes("favicon.ico") ||
      pathname.includes("logo.svg") ||
      pathname.includes(".png") ||
      pathname.includes(".jpg") ||
      pathname.includes(".svg")
    ) {
      return NextResponse.next()
    }

    // Redirigir a login si no está autenticado y no es una ruta pública
    if (!isAuthenticated && !isPublicRoute) {
      console.log(`Redirigiendo a /login desde ${pathname} (no autenticado)`)
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }

    // Redirigir al dashboard si ya está autenticado e intenta acceder a login
    if (isAuthenticated && pathname === "/login") {
      console.log("Redirigiendo a /dashboard desde /login (ya autenticado)")
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

export const config = {
  matcher: ["/((?!api/auth/login|_next/static|_next/image|favicon.ico).*)"],
}
