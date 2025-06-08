import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const pathname = req.nextUrl.pathname

    console.log(`🔍 Middleware: ${pathname}, Auth: ${isAuth}`)

    // Rutas que no requieren autenticación
    const publicPaths = [
      "/",
      "/login",
      "/api/auth/signin",
      "/api/auth/callback",
      "/api/auth/session",
      "/api/auth/providers",
      "/api/auth/csrf",
      "/docs",
      "/health",
    ]

    // Permitir todas las rutas de API de NextAuth
    if (pathname.startsWith("/api/auth/")) {
      return NextResponse.next()
    }

    // Permitir rutas públicas
    if (publicPaths.some((path) => pathname === path || pathname.startsWith(path))) {
      return NextResponse.next()
    }

    // Si está en login y ya autenticado, redirigir al dashboard
    if (pathname === "/login" && isAuth) {
      console.log("🔄 Redirigiendo usuario autenticado al dashboard")
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Si no está autenticado y trata de acceder a rutas protegidas, redirigir a login
    if (!isAuth && pathname.startsWith("/dashboard")) {
      console.log("🔄 Redirigiendo usuario no autenticado al login")
      return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Permitir todas las rutas de API de NextAuth
        if (pathname.startsWith("/api/auth/")) {
          return true
        }

        // Permitir rutas públicas
        const publicPaths = ["/", "/login", "/docs", "/health"]
        if (publicPaths.some((path) => pathname === path || pathname.startsWith(path))) {
          return true
        }

        // Para rutas protegidas, requerir token
        return !!token
      },
    },
  },
)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)"],
}
