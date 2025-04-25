# GestionGranito-App

Panel de administración para la tienda GranitoSkate en Shopify.

## Características

- Autenticación de usuario único
- Dashboard con estadísticas generales
- Gestión de productos (CRUD)
- Gestión de colecciones (CRUD)
- Gestión de clientes
- Gestión de pedidos
- Gestión de contenido
- Estadísticas y análisis
- Configuración de la tienda

## Tecnologías

- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui
- NextAuth.js
- Shopify Admin GraphQL API

## Requisitos

- Node.js 18.x o superior
- NPM 9.x o superior
- Cuenta de Shopify con acceso a la API Admin

## Configuración

1. Clona este repositorio
2. Copia el archivo `.env.example` a `.env.local` y completa las variables de entorno
3. Instala las dependencias:

\`\`\`bash
npm install --legacy-peer-deps
\`\`\`

4. Ejecuta el servidor de desarrollo:

\`\`\`bash
npm run dev
\`\`\`

## Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el panel de Vercel
3. Despliega la aplicación

## Variables de entorno

- `NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN`: Dominio de tu tienda Shopify
- `SHOPIFY_ACCESS_TOKEN`: Token de acceso a la API de Shopify
- `NEXTAUTH_SECRET`: Clave secreta para NextAuth
- `NEXTAUTH_URL`: URL de tu aplicación (en producción, Vercel la configura automáticamente)
- `ADMIN_EMAIL`: Email del administrador
- `ADMIN_PASSWORD`: Contraseña del administrador
\`\`\`

Vamos a crear un archivo `robots.txt` para controlar el acceso de los buscadores:

```plaintext file="public/robots.txt"
User-agent: *
Disallow: /
