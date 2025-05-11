# GestionGranito App

Aplicación de gestión para tiendas Shopify, desarrollada con Next.js, TypeScript y Tailwind CSS.

## Requisitos previos

- Node.js 18.x o superior
- Una cuenta de Shopify con acceso a la API Admin
- Token de acceso a la API de Shopify con permisos para leer y escribir productos, colecciones, clientes y pedidos

## Instalación

1. Clona este repositorio:
\`\`\`bash
git clone https://github.com/tu-usuario/GestionGranito-App.git
cd GestionGranito-App
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
\`\`\`

3. Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:
\`\`\`
NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN=tu-tienda.myshopify.com
SHOPIFY_ACCESS_TOKEN=tu-token-de-acceso
NEXTAUTH_SECRET=un-secreto-aleatorio-para-nextauth
ADMIN_EMAIL=tu-email@ejemplo.com
ADMIN_PASSWORD=tu-contraseña-segura
SHOPIFY_API_URL=https://tu-tienda.myshopify.com/admin/api/2023-07/graphql.json
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_VERCEL_URL=localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
\`\`\`

## Desarrollo

Para iniciar el servidor de desarrollo:

\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Construcción y despliegue

### Construcción local

Para construir la aplicación para producción:

\`\`\`bash
npm run build
\`\`\`

Para iniciar la aplicación en modo producción:

\`\`\`bash
npm start
\`\`\`

### Despliegue en Vercel

La forma más sencilla de desplegar esta aplicación es utilizando [Vercel](https://vercel.com):

1. Crea una cuenta en Vercel si aún no tienes una
2. Importa tu repositorio de GitHub/GitLab/Bitbucket
3. Configura las variables de entorno en la interfaz de Vercel
4. Despliega la aplicación

### Despliegue manual

También puedes desplegar la aplicación en cualquier proveedor que soporte aplicaciones Node.js:

1. Construye la aplicación:
\`\`\`bash
npm run build
\`\`\`

2. Transfiere los archivos a tu servidor:
   - `.next/`
   - `public/`
   - `package.json`
   - `next.config.mjs`

3. Instala las dependencias de producción:
\`\`\`bash
npm install --production
\`\`\`

4. Inicia la aplicación:
\`\`\`bash
npm start
\`\`\`

### Script de despliegue automatizado

Para facilitar el despliegue, puedes utilizar el script `deploy.sh` incluido en el repositorio:

\`\`\`bash
chmod +x deploy.sh
./deploy.sh
\`\`\`

Este script verificará que todas las dependencias y variables de entorno estén configuradas correctamente antes de construir y desplegar la aplicación.

## Estructura del proyecto

- `app/`: Rutas y páginas de la aplicación (Next.js App Router)
- `components/`: Componentes reutilizables
- `lib/`: Utilidades, API y funciones auxiliares
- `public/`: Archivos estáticos
- `types/`: Definiciones de tipos TypeScript

## Características principales

- Autenticación con NextAuth.js
- Integración con Shopify Admin API
- Gestión de productos, colecciones, clientes y pedidos
- Gestión de promociones y marketing
- SEO y optimización para mercados
- Diagnósticos del sistema

## Solución de problemas

### Error de conexión con Shopify

Si experimentas errores de conexión con la API de Shopify:

1. Verifica que tu token de acceso sea válido y tenga los permisos necesarios
2. Asegúrate de que la URL de la API sea correcta
3. Comprueba los logs para ver mensajes de error específicos
4. Utiliza la herramienta de diagnóstico en `/dashboard/diagnostics` para verificar el estado de la conexión

### Problemas con la autenticación

Si tienes problemas para iniciar sesión:

1. Verifica que las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` estén configuradas correctamente
2. Asegúrate de que `NEXTAUTH_SECRET` y `NEXTAUTH_URL` estén configurados
3. Comprueba que la URL de la aplicación coincida con la configurada en `NEXTAUTH_URL`

### Verificación de despliegue

Puedes verificar si tu aplicación está lista para ser desplegada accediendo a la ruta `/api/deployment/check`. Esta ruta verificará:

1. Que todas las variables de entorno necesarias estén configuradas
2. Que la conexión con Shopify funcione correctamente

## Contribución

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para sugerir cambios o mejoras.

## Licencia

Este proyecto está licenciado bajo la licencia MIT.
\`\`\`

Finalmente, vamos a crear un archivo de comprobación de estado para verificar que la aplicación esté funcionando correctamente:
