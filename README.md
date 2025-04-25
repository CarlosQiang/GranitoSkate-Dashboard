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
2. Configura las variables de entorno en el panel de Vercel:
   - `NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN`: Dominio de tu tienda Shopify
   - `SHOPIFY_ACCESS_TOKEN`: Token de acceso a la API de Shopify
   - `NEXTAUTH_SECRET`: Clave secreta para NextAuth
   - `ADMIN_EMAIL`: Email del administrador
   - `ADMIN_PASSWORD`: Contraseña del administrador
3. Despliega la aplicación

## Solución de problemas

Si encuentras problemas con la aplicación, puedes verificar el estado de la misma visitando la ruta `/api/health`. Esta ruta te mostrará si todas las variables de entorno están configuradas correctamente.

Si tienes problemas con la API de Shopify, asegúrate de que:
1. El token de acceso es válido y tiene los permisos necesarios
2. El dominio de la tienda es correcto
3. Las variables de entorno están configuradas correctamente en Vercel

## Mantenimiento

Para mantener la aplicación actualizada:
1. Actualiza regularmente las dependencias
2. Verifica periódicamente la validez del token de Shopify
3. Mantén seguras las credenciales de administrador
