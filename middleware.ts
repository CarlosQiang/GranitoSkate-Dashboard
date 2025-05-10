import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Esta función se ejecuta antes de cada solicitud
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Definimos las rutas públicas (que no requieren autenticación)
  const isPublicPath = path === "/login" || path === "/"

  // Obtenemos el token de la cookie (si existe)
  const token = request.cookies.get("next-auth.session-token")?.value || ""

  // Si el usuario intenta acceder a una ruta protegida sin token, redirigimos al login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si el usuario ya está autenticado e intenta acceder al login, redirigimos al dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // En cualquier otro caso, continuamos con la solicitud
  return NextResponse.next()
}

// Configuramos las rutas a las que se aplicará el middleware
export const config = {
  matcher: ["/", "/login", "/dashboard/:path*"],
}
