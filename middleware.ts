import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname

    // Rutas que siempre deben ser accesibles
    const publicPaths = [
      "/",
      "/login",
      "/docs",
      "/health",
      "/api/auth",
      "/api/health",
      "/_next",
      "/favicon.ico",
      "/public",
    ]

    // Permitir todas las rutas de API de NextAuth
    if (pathname.startsWith("/api/auth/")) {
      return NextResponse.next()
    }

    // Permitir rutas públicas
    if (publicPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.next()
    }

    // Para rutas del dashboard, verificar autenticación
    if (pathname.startsWith("/dashboard")) {
      try {
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        })

        if (!token) {
          console.log("🔄 Redirigiendo usuario no autenticado al login")
          return NextResponse.redirect(new URL("/login", request.url))
        }

        console.log("✅ Usuario autenticado accediendo a:", pathname)
        return NextResponse.next()
      } catch (authError) {
        console.error("❌ Error verificando token:", authError)
        return NextResponse.redirect(new URL("/login", request.url))
      }
    }

    // Si está en login y tiene token, redirigir al dashboard
    if (pathname === "/login") {
      try {
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        })

        if (token) {
          console.log("🔄 Redirigiendo usuario autenticado al dashboard")
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      } catch (authError) {
        console.error("❌ Error verificando token en login:", authError)
        // Continuar al login si hay error
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error("❌ Error en middleware:", error)
    // En caso de error, permitir el acceso para evitar bloqueos
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/dashboard/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
