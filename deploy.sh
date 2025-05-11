#!/bin/bash

# Script de despliegue para GestionGranito App
# Este script verifica que todo esté listo para el despliegue y luego despliega la aplicación

echo "🚀 Iniciando verificación de despliegue para GestionGranito App..."

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instálalo antes de continuar."
    exit 1
fi

# Verificar que npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor, instálalo antes de continuar."
    exit 1
fi

# Verificar que el archivo .env.local existe
if [ ! -f .env.local ]; then
    echo "⚠️ No se encontró el archivo .env.local"
    echo "Creando archivo .env.local a partir de .env.example..."
    cp .env.example .env.local
    echo "⚠️ Por favor, edita el archivo .env.local con tus credenciales antes de continuar."
    exit 1
fi

# Verificar variables de entorno requeridas
echo "📋 Verificando variables de entorno..."
REQUIRED_VARS=("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN" "SHOPIFY_ACCESS_TOKEN" "NEXTAUTH_SECRET" "ADMIN_EMAIL" "ADMIN_PASSWORD" "SHOPIFY_API_URL" "NEXTAUTH_URL")
MISSING_VARS=()

for VAR in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$VAR=" .env.local; then
        MISSING_VARS+=("$VAR")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Faltan las siguientes variables de entorno en .env.local:"
    for VAR in "${MISSING_VARS[@]}"; do
        echo "   - $VAR"
    done
    echo "Por favor, añade estas variables a tu archivo .env.local antes de continuar."
    exit 1
fi

echo "✅ Variables de entorno verificadas correctamente."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar si la instalación fue exitosa
if [ $? -ne 0 ]; then
    echo "❌ Error durante la instalación de dependencias. Por favor, revisa los errores y vuelve a intentarlo."
    exit 1
fi

echo "✅ Dependencias instaladas correctamente."

# Construir la aplicación
echo "🔨 Construyendo la aplicación..."
npm run build

# Verificar si la construcción fue exitosa
if [ $? -ne 0 ]; then
    echo "❌ Error durante la construcción. Por favor, revisa los errores y vuelve a intentarlo."
    exit 1
fi

echo "✅ Construcción exitosa."

# Preguntar si se desea iniciar la aplicación
read -p "¿Deseas iniciar la aplicación ahora? (s/n): " START_APP

if [[ $START_APP == "s" || $START_APP == "S" ]]; then
    echo "🚀 Iniciando la aplicación..."
    npm start
else
    echo "✅ Todo está listo para el despliegue."
    echo "Para iniciar la aplicación, ejecuta: npm start"
fi
