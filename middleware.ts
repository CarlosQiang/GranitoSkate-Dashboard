import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar si el usuario está autenticado
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Rutas protegidas (requieren autenticación)
  const protectedPaths = ["/dashboard"]

  // Comprobar si la ruta actual es protegida
  const isProtectedPath = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  // Si es una ruta protegida y no hay token, redirigir a login
  if (isProtectedPath && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // Si el usuario está autenticado y va a login, redirigir a dashboard
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard/overview", request.url))
  }

  return NextResponse.next()
}

// Configurar las rutas que deben ser manejadas por el middleware
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)"],
}
