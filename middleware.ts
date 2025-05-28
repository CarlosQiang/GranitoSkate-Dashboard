import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith("/login")
    const isApiRoute = req.nextUrl.pathname.startsWith("/api")
    const isPublicRoute =
      req.nextUrl.pathname === "/" ||
      req.nextUrl.pathname.startsWith("/docs") ||
      req.nextUrl.pathname.startsWith("/health")

    // Permitir rutas públicas y de API sin autenticación
    if (isPublicRoute || isApiRoute) {
      return NextResponse.next()
    }

    // Redirigir a dashboard si ya está autenticado y trata de acceder a login
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Redirigir a login si no está autenticado y trata de acceder a rutas protegidas
    if (!isAuthPage && !isAuth) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a rutas públicas sin token
        const isPublicRoute =
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname.startsWith("/docs") ||
          req.nextUrl.pathname.startsWith("/api") ||
          req.nextUrl.pathname.startsWith("/health")

        if (isPublicRoute) return true

        // Para rutas protegidas, requerir token
        return !!token
      },
    },
  },
)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)"],
}
