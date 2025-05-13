import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar si la ruta requiere autenticación
  const isAuthRoute = pathname.startsWith("/dashboard")

  // Verificar si la ruta es de autenticación
  const isLoginPage = pathname.startsWith("/login")

  // Obtener el token de autenticación
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Si es una ruta protegida y no hay token, redirigir a login
  if (isAuthRoute && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Si es la página de login y hay token, redirigir al dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Si es la raíz y hay token, redirigir al dashboard
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configurar las rutas que deben ser procesadas por el middleware
export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
}
