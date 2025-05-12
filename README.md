# GestionGranito-App

Aplicación de gestión para tiendas Shopify, con funcionalidades de SEO, gestión de productos, colecciones y promociones.

## Requisitos previos

- Node.js 18.x o superior
- Una cuenta de Shopify con acceso a la API Admin
- Token de acceso a la API de Shopify

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

3. Copia el archivo `.env.example` a `.env.local` y configura las variables de entorno:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Edita el archivo `.env.local` con tus credenciales:
\`\`\`
NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN=tu-tienda.myshopify.com
SHOPIFY_ACCESS_TOKEN=tu-token-de-acceso
SHOPIFY_API_URL=https://tu-tienda.myshopify.com/admin/api/2023-07/graphql.json
NEXTAUTH_SECRET=un-secreto-aleatorio-largo
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=tu-email@ejemplo.com
ADMIN_PASSWORD=tu-contraseña-segura
\`\`\`

5. Inicia el servidor de desarrollo:
\`\`\`bash
npm run dev
\`\`\`

6. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Despliegue en Vercel

La forma más sencilla de desplegar esta aplicación es utilizando [Vercel](https://vercel.com):

1. Crea una cuenta en Vercel si aún no tienes una
2. Importa este repositorio a Vercel
3. Configura las variables de entorno en la configuración del proyecto
4. ¡Listo! Tu aplicación estará desplegada automáticamente

## Características principales

- Gestión de productos y colecciones de Shopify
- Optimización SEO automática
- Gestión de promociones
- Monitorización de la tienda
- Diagnósticos del sistema

## Solución de problemas

Si encuentras algún problema durante la instalación o el uso de la aplicación, consulta la sección de diagnósticos en `/dashboard/diagnostics` para verificar el estado de la conexión con Shopify y otros componentes del sistema.
