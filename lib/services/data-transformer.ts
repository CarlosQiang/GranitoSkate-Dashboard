/**
 * Transforma un producto de Shopify al formato de la base de datos
 * @param shopifyProduct Producto de Shopify
 * @returns Producto transformado para la base de datos
 */
export function transformShopifyProduct(shopifyProduct: any): any {
  try {
    // Extraer el ID numérico
    const shopifyId = extractShopifyId(shopifyProduct.id)

    // Extraer la primera variante (si existe)
    const firstVariant = shopifyProduct.variants?.edges?.[0]?.node || {}

    // Extraer la imagen destacada (si existe)
    const featuredImage = shopifyProduct.featuredImage || {}

    // Extraer todas las imágenes
    const images =
      shopifyProduct.images?.edges?.map((edge: any) => ({
        id: extractShopifyId(edge.node.id),
        url: edge.node.url,
        alt: edge.node.altText || "",
      })) || []

    // Extraer todas las variantes
    const variants =
      shopifyProduct.variants?.edges?.map((edge: any) => ({
        id: extractShopifyId(edge.node.id),
        title: edge.node.title,
        price: Number.parseFloat(edge.node.price || "0"),
        compareAtPrice: edge.node.compareAtPrice ? Number.parseFloat(edge.node.compareAtPrice) : null,
        sku: edge.node.sku || "",
        barcode: edge.node.barcode || "",
        inventoryQuantity: edge.node.inventoryQuantity || 0,
        inventoryPolicy: edge.node.inventoryPolicy || "DENY",
        weight: edge.node.weight || 0,
        weightUnit: edge.node.weightUnit || "KILOGRAMS",
      })) || []

    // Extraer metafields
    const metafields =
      shopifyProduct.metafields?.edges?.map((edge: any) => ({
        namespace: edge.node.namespace,
        key: edge.node.key,
        value: edge.node.value,
      })) || []

    // Construir el objeto transformado
    return {
      shopify_id: shopifyId,
      title: shopifyProduct.title || "",
      description: shopifyProduct.description || "",
      product_type: shopifyProduct.productType || "",
      vendor: shopifyProduct.vendor || "",
      status: shopifyProduct.status || "DRAFT",
      published_at: shopifyProduct.publishedAt || null,
      handle: shopifyProduct.handle || "",
      tags: shopifyProduct.tags || [],
      featured_image: featuredImage.url || null,
      featured_image_alt: featuredImage.altText || "",
      images: images,
      variants: variants,
      metafields: metafields,
      price: Number.parseFloat(firstVariant.price || "0"),
      compare_at_price: firstVariant.compareAtPrice ? Number.parseFloat(firstVariant.compareAtPrice) : null,
      inventory_quantity: firstVariant.inventoryQuantity || 0,
      sku: firstVariant.sku || "",
      barcode: firstVariant.barcode || "",
    }
  } catch (error) {
    console.error("Error al transformar producto de Shopify:", error)
    // Devolver un objeto mínimo para evitar errores
    return {
      shopify_id: extractShopifyId(shopifyProduct.id),
      title: shopifyProduct.title || "Error en transformación",
      status: "ERROR",
    }
  }
}

/**
 * Transforma una colección de Shopify al formato de la base de datos
 * @param shopifyCollection Colección de Shopify
 * @returns Colección transformada para la base de datos
 */
export function transformShopifyCollection(shopifyCollection: any): any {
  try {
    // Extraer el ID numérico
    const shopifyId = extractShopifyId(shopifyCollection.id)

    // Extraer la imagen (si existe)
    const image = shopifyCollection.image || {}

    // Extraer productos asociados
    const products =
      shopifyCollection.products?.edges?.map((edge: any) => ({
        id: extractShopifyId(edge.node.id),
        title: edge.node.title,
      })) || []

    // Extraer metafields
    const metafields =
      shopifyCollection.metafields?.edges?.map((edge: any) => ({
        namespace: edge.node.namespace,
        key: edge.node.key,
        value: edge.node.value,
      })) || []

    // Construir el objeto transformado
    return {
      shopify_id: shopifyId,
      title: shopifyCollection.title || "",
      description: shopifyCollection.description || "",
      handle: shopifyCollection.handle || "",
      products_count: shopifyCollection.productsCount || 0,
      image_url: image.url || null,
      image_alt: image.altText || "",
      products: products,
      metafields: metafields,
    }
  } catch (error) {
    console.error("Error al transformar colección de Shopify:", error)
    // Devolver un objeto mínimo para evitar errores
    return {
      shopify_id: extractShopifyId(shopifyCollection.id),
      title: shopifyCollection.title || "Error en transformación",
    }
  }
}

/**
 * Transforma un cliente de Shopify al formato de la base de datos
 * @param shopifyCustomer Cliente de Shopify
 * @returns Cliente transformado para la base de datos
 */
export function transformShopifyCustomer(shopifyCustomer: any): any {
  try {
    // Extraer el ID numérico
    const shopifyId = extractShopifyId(shopifyCustomer.id)

    // Extraer direcciones
    const addresses =
      shopifyCustomer.addresses?.edges?.map((edge: any) => ({
        id: extractShopifyId(edge.node.id),
        address1: edge.node.address1 || "",
        address2: edge.node.address2 || "",
        city: edge.node.city || "",
        province: edge.node.province || "",
        zip: edge.node.zip || "",
        country: edge.node.country || "",
        firstName: edge.node.firstName || "",
        lastName: edge.node.lastName || "",
        phone: edge.node.phone || "",
        company: edge.node.company || "",
        isDefault: shopifyCustomer.defaultAddress?.id === edge.node.id,
      })) || []

    // Extraer pedidos recientes
    const orders =
      shopifyCustomer.orders?.edges?.map((edge: any) => ({
        id: extractShopifyId(edge.node.id),
        name: edge.node.name,
        totalPrice: edge.node.totalPriceSet?.shopMoney?.amount || "0",
        currency: edge.node.totalPriceSet?.shopMoney?.currencyCode || "USD",
      })) || []

    // Construir el objeto transformado
    return {
      shopify_id: shopifyId,
      first_name: shopifyCustomer.firstName || "",
      last_name: shopifyCustomer.lastName || "",
      email: shopifyCustomer.email || "",
      phone: shopifyCustomer.phone || "",
      accepts_marketing: shopifyCustomer.acceptsMarketing || false,
      note: shopifyCustomer.note || "",
      tags: shopifyCustomer.tags || [],
      addresses: addresses,
      orders: orders,
    }
  } catch (error) {
    console.error("Error al transformar cliente de Shopify:", error)
    // Devolver un objeto mínimo para evitar errores
    return {
      shopify_id: extractShopifyId(shopifyCustomer.id),
      email: shopifyCustomer.email || "Error en transformación",
    }
  }
}

/**
 * Transforma un pedido de Shopify al formato de la base de datos
 * @param shopifyOrder Pedido de Shopify
 * @returns Pedido transformado para la base de datos
 */
export function transformShopifyOrder(shopifyOrder: any): any {
  try {
    // Extraer el ID numérico
    const shopifyId = extractShopifyId(shopifyOrder.id)

    // Extraer cliente
    const customer = shopifyOrder.customer
      ? {
          id: extractShopifyId(shopifyOrder.customer.id),
          firstName: shopifyOrder.customer.firstName || "",
          lastName: shopifyOrder.customer.lastName || "",
          email: shopifyOrder.customer.email || "",
        }
      : null

    // Extraer líneas de pedido
    const lineItems =
      shopifyOrder.lineItems?.edges?.map((edge: any) => {
        const variant = edge.node.variant || {}
        return {
          id: extractShopifyId(edge.node.id),
          title: edge.node.title || "",
          quantity: edge.node.quantity || 0,
          price: edge.node.originalTotalSet?.shopMoney?.amount || "0",
          currency: edge.node.originalTotalSet?.shopMoney?.currencyCode || "USD",
          sku: variant.sku || "",
          variantId: variant.id ? extractShopifyId(variant.id) : null,
          variantTitle: variant.title || "",
          productId: variant.product?.id ? extractShopifyId(variant.product.id) : null,
        }
      }) || []

    // Extraer transacciones
    const transactions =
      shopifyOrder.transactions?.edges?.map((edge: any) => ({
        id: extractShopifyId(edge.node.id),
        kind: edge.node.kind || "",
        status: edge.node.status || "",
        gateway: edge.node.gateway || "",
        amount: edge.node.amountSet?.shopMoney?.amount || "0",
        currency: edge.node.amountSet?.shopMoney?.currencyCode || "USD",
        errorCode: edge.node.errorCode || null,
        createdAt: edge.node.createdAt || null,
      })) || []

    // Extraer dirección de envío
    const shippingAddress = shopifyOrder.shippingAddress
      ? {
          firstName: shopifyOrder.shippingAddress.firstName || "",
          lastName: shopifyOrder.shippingAddress.lastName || "",
          address1: shopifyOrder.shippingAddress.address1 || "",
          address2: shopifyOrder.shippingAddress.address2 || "",
          city: shopifyOrder.shippingAddress.city || "",
          province: shopifyOrder.shippingAddress.province || "",
          zip: shopifyOrder.shippingAddress.zip || "",
          country: shopifyOrder.shippingAddress.country || "",
          phone: shopifyOrder.shippingAddress.phone || "",
        }
      : null

    // Construir el objeto transformado
    return {
      shopify_id: shopifyId,
      name: shopifyOrder.name || "",
      email: shopifyOrder.email || "",
      phone: shopifyOrder.phone || "",
      processed_at: shopifyOrder.processedAt || null,
      financial_status: shopifyOrder.financialStatus || "",
      fulfillment_status: shopifyOrder.fulfillmentStatus || null,
      total_price: shopifyOrder.totalPriceSet?.shopMoney?.amount || "0",
      subtotal_price: shopifyOrder.subtotalPriceSet?.shopMoney?.amount || "0",
      total_shipping: shopifyOrder.totalShippingPriceSet?.shopMoney?.amount || "0",
      total_tax: shopifyOrder.totalTaxSet?.shopMoney?.amount || "0",
      currency: shopifyOrder.totalPriceSet?.shopMoney?.currencyCode || "USD",
      customer: customer,
      line_items: lineItems,
      shipping_address: shippingAddress,
      transactions: transactions,
      tags: shopifyOrder.tags || [],
    }
  } catch (error) {
    console.error("Error al transformar pedido de Shopify:", error)
    // Devolver un objeto mínimo para evitar errores
    return {
      shopify_id: extractShopifyId(shopifyOrder.id),
      name: shopifyOrder.name || "Error en transformación",
    }
  }
}

/**
 * Extrae el ID numérico de un ID completo de Shopify
 * @param fullId ID completo de Shopify (gid://shopify/Product/123456789)
 * @returns ID numérico
 */
function extractShopifyId(fullId: string): string {
  if (!fullId) return ""
  const parts = fullId.split("/")
  return parts[parts.length - 1]
}
