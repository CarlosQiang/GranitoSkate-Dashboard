import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Esta función se ejecuta antes de cada solicitud
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Definimos las rutas públicas (que no requieren autenticación)
  const isPublicPath = path === "/login" || path === "/" || path.startsWith("/_next") || path.startsWith("/api/auth")

  // Obtenemos el token de la cookie (si existe)
  const token =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value ||
    ""

  // Si el usuario intenta acceder a una ruta protegida sin token, redirigimos al login
  if (!isPublicPath && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Si el usuario ya está autenticado e intenta acceder al login, redirigimos al dashboard
  if (isPublicPath && token && path !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // En cualquier otro caso, continuamos con la solicitud
  return NextResponse.next()
}

// Configuramos las rutas a las que se aplicará el middleware
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas de solicitud excepto:
     * 1. Todas las rutas que comienzan con api/auth (autenticación de NextAuth)
     * 2. Todas las rutas que comienzan con _next/static (archivos estáticos)
     * 3. Todas las rutas que comienzan con _next/image (optimización de imágenes)
     * 4. Todas las rutas que comienzan con favicon.ico (icono del sitio)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
