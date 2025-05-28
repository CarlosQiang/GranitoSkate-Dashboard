# ✅ Checklist de Despliegue - GestionGranito App

## 🗄️ Base de Datos
- [ ] Base de datos Neon configurada
- [ ] Esquema SQL ejecutado completamente
- [ ] Usuario administrador creado (admin@gmail.com)
- [ ] Todas las tablas creadas correctamente
- [ ] Índices y triggers funcionando

## 🔐 Variables de Entorno Requeridas
- [ ] `DATABASE_URL` o `POSTGRES_URL` - URL de conexión a Neon
- [ ] `NEXTAUTH_SECRET` - Secreto para NextAuth
- [ ] `NEXTAUTH_URL` - URL de la aplicación
- [ ] `NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN` - Dominio de la tienda Shopify
- [ ] `SHOPIFY_ACCESS_TOKEN` - Token de acceso a Shopify
- [ ] `SHOPIFY_API_URL` - URL de la API de Shopify

## 🚀 Configuración de Vercel
- [ ] Proyecto conectado a repositorio Git
- [ ] Variables de entorno configuradas en Vercel
- [ ] Build commands configurados correctamente
- [ ] Dominio personalizado (opcional)

## 🧪 Verificaciones Post-Despliegue
- [ ] Acceso a `/api/health/check` retorna status 200
- [ ] Login funciona con admin@gmail.com / GranitoSkate
- [ ] Dashboard carga correctamente
- [ ] Conexión con Shopify establecida
- [ ] Sincronización de productos funciona
- [ ] Todas las páginas cargan sin errores

## 📱 Funcionalidades Principales
- [ ] Gestión de productos
- [ ] Gestión de colecciones
- [ ] Gestión de clientes
- [ ] Gestión de pedidos
- [ ] Gestión de promociones
- [ ] Configuración de SEO
- [ ] Sincronización con Shopify
- [ ] Sistema de autenticación

## 🔧 Comandos de Verificación

### Verificar salud del sistema:
\`\`\`bash
curl https://tu-dominio.vercel.app/api/health/check
\`\`\`

### Verificar base de datos:
\`\`\`bash
curl https://tu-dominio.vercel.app/api/db/verificar
\`\`\`

### Verificar Shopify:
\`\`\`bash
curl https://tu-dominio.vercel.app/api/shopify/check
\`\`\`

## 🎯 URLs Importantes Post-Despliegue
- `/` - Página principal
- `/login` - Página de login
- `/dashboard` - Dashboard principal
- `/dashboard/diagnostics` - Diagnósticos del sistema
- `/api/health/check` - Verificación de salud
- `/docs` - Documentación

## 🚨 Solución de Problemas Comunes

### Error de conexión a base de datos:
1. Verificar `DATABASE_URL` en variables de entorno
2. Comprobar que la base de datos Neon esté activa
3. Ejecutar `/api/init-db` para inicializar

### Error de autenticación:
1. Verificar `NEXTAUTH_SECRET` y `NEXTAUTH_URL`
2. Comprobar que la tabla administradores existe
3. Verificar credenciales: admin@gmail.com / GranitoSkate

### Error de Shopify:
1. Verificar variables de entorno de Shopify
2. Comprobar permisos de la aplicación en Shopify
3. Verificar que la tienda esté activa

## ✅ Estado: LISTO PARA DESPLIEGUE
La aplicación está completamente preparada para desplegarse en Vercel.
