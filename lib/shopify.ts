console.log("Inicializando cliente de Shopify...")
console.log("NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN está definido:", !!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN)
console.log("SHOPIFY_ACCESS_TOKEN está definido:", !!process.env.SHOPIFY_ACCESS_TOKEN)

if (!process.env.NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN) {
  console.error("ERROR: NEXT_PUBLIC_SHOPIFY_SHOP_DOMAIN no está definido")
}

if (!process.env.SHOPIFY_ACCESS_TOKEN) {
  console.error("ERROR: SHOPIFY_ACCESS_TOKEN no está definido")
}
