import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Solo proteger rutas del dashboard
  if (pathname.startsWith("/dashboard")) {
    // Verificar si hay una cookie de sesión
    const sessionToken =
      request.cookies.get("next-auth.session-token") || request.cookies.get("__Secure-next-auth.session-token")

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Si está en login y tiene sesión, redirigir al dashboard
  if (pathname === "/login") {
    const sessionToken =
      request.cookies.get("next-auth.session-token") || request.cookies.get("__Secure-next-auth.session-token")

    if (sessionToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
