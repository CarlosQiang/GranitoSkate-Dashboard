import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Permitir acceso a páginas públicas
    if (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/login") {
      return NextResponse.next()
    }

    // Verificar autenticación para rutas protegidas
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      if (!req.nextauth.token) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Permitir acceso a páginas públicas sin token
        if (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/login") {
          return true
        }

        // Requerir token para rutas del dashboard
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token
        }

        return true
      },
    },
  },
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
