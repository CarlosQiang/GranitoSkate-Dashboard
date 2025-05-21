/**
 * Servicio de caché en memoria para datos de Shopify
 * Almacena temporalmente los datos obtenidos de Shopify para reducir llamadas a la API
 * y proporcionar acceso a los datos incluso cuando la base de datos falla
 */
export class ShopifyDataCache {
  private static instance: ShopifyDataCache
  private productCache: Map<string, any> = new Map()
  private collectionCache: Map<string, any> = new Map()
  private customerCache: Map<string, any> = new Map()
  private orderCache: Map<string, any> = new Map()
  private lastUpdated: Record<string, number> = {
    products: 0,
    collections: 0,
    customers: 0,
    orders: 0,
  }
  private cacheTTL = 5 * 60 * 1000 // 5 minutos en milisegundos

  private constructor() {
    console.log("Inicializando caché de datos de Shopify")
  }

  public static getInstance(): ShopifyDataCache {
    if (!ShopifyDataCache.instance) {
      ShopifyDataCache.instance = new ShopifyDataCache()
    }
    return ShopifyDataCache.instance
  }

  // ===== PRODUCTOS =====

  public cacheProducts(products: any[]): void {
    if (!products || !Array.isArray(products)) {
      console.error("Intento de cachear productos con datos inválidos:", products)
      return
    }

    try {
      products.forEach((product) => {
        if (product && product.id) {
          const id = this.extractShopifyId(product.id)
          this.productCache.set(id, product)
        }
      })
      this.lastUpdated.products = Date.now()
      console.log(`Caché: ${products.length} productos almacenados en caché`)
    } catch (error) {
      console.error("Error al cachear productos:", error)
    }
  }

  public getProduct(id: string): any | undefined {
    return this.productCache.get(id)
  }

  public getAllProducts(): any[] {
    return Array.from(this.productCache.values())
  }

  public isProductCacheValid(): boolean {
    return Date.now() - this.lastUpdated.products < this.cacheTTL
  }

  public getProductCacheSize(): number {
    return this.productCache.size
  }

  // ===== COLECCIONES =====

  public cacheCollections(collections: any[]): void {
    if (!collections || !Array.isArray(collections)) {
      console.error("Intento de cachear colecciones con datos inválidos:", collections)
      return
    }

    try {
      collections.forEach((collection) => {
        if (collection && collection.id) {
          const id = this.extractShopifyId(collection.id)
          this.collectionCache.set(id, collection)
        }
      })
      this.lastUpdated.collections = Date.now()
      console.log(`Caché: ${collections.length} colecciones almacenadas en caché`)
    } catch (error) {
      console.error("Error al cachear colecciones:", error)
    }
  }

  public getCollection(id: string): any | undefined {
    return this.collectionCache.get(id)
  }

  public getAllCollections(): any[] {
    return Array.from(this.collectionCache.values())
  }

  public isCollectionCacheValid(): boolean {
    return Date.now() - this.lastUpdated.collections < this.cacheTTL
  }

  public getCollectionCacheSize(): number {
    return this.collectionCache.size
  }

  // ===== CLIENTES =====

  public cacheCustomers(customers: any[]): void {
    if (!customers || !Array.isArray(customers)) {
      console.error("Intento de cachear clientes con datos inválidos:", customers)
      return
    }

    try {
      customers.forEach((customer) => {
        if (customer && customer.id) {
          const id = this.extractShopifyId(customer.id)
          this.customerCache.set(id, customer)
        }
      })
      this.lastUpdated.customers = Date.now()
      console.log(`Caché: ${customers.length} clientes almacenados en caché`)
    } catch (error) {
      console.error("Error al cachear clientes:", error)
    }
  }

  public getCustomer(id: string): any | undefined {
    return this.customerCache.get(id)
  }

  public getAllCustomers(): any[] {
    return Array.from(this.customerCache.values())
  }

  public isCustomerCacheValid(): boolean {
    return Date.now() - this.lastUpdated.customers < this.cacheTTL
  }

  public getCustomerCacheSize(): number {
    return this.customerCache.size
  }

  // ===== PEDIDOS =====

  public cacheOrders(orders: any[]): void {
    if (!orders || !Array.isArray(orders)) {
      console.error("Intento de cachear pedidos con datos inválidos:", orders)
      return
    }

    try {
      orders.forEach((order) => {
        if (order && order.id) {
          const id = this.extractShopifyId(order.id)
          this.orderCache.set(id, order)
        }
      })
      this.lastUpdated.orders = Date.now()
      console.log(`Caché: ${orders.length} pedidos almacenados en caché`)
    } catch (error) {
      console.error("Error al cachear pedidos:", error)
    }
  }

  public getOrder(id: string): any | undefined {
    return this.orderCache.get(id)
  }

  public getAllOrders(): any[] {
    return Array.from(this.orderCache.values())
  }

  public isOrderCacheValid(): boolean {
    return Date.now() - this.lastUpdated.orders < this.cacheTTL
  }

  public getOrderCacheSize(): number {
    return this.orderCache.size
  }

  // ===== UTILIDADES =====

  public clearCache(): void {
    this.productCache.clear()
    this.collectionCache.clear()
    this.customerCache.clear()
    this.orderCache.clear()

    this.lastUpdated = {
      products: 0,
      collections: 0,
      customers: 0,
      orders: 0,
    }

    console.log("Caché limpiada completamente")
  }

  public getCacheStats(): Record<string, any> {
    return {
      products: {
        count: this.productCache.size,
        lastUpdated: new Date(this.lastUpdated.products).toISOString(),
        isValid: this.isProductCacheValid(),
      },
      collections: {
        count: this.collectionCache.size,
        lastUpdated: new Date(this.lastUpdated.collections).toISOString(),
        isValid: this.isCollectionCacheValid(),
      },
      customers: {
        count: this.customerCache.size,
        lastUpdated: new Date(this.lastUpdated.customers).toISOString(),
        isValid: this.isCustomerCacheValid(),
      },
      orders: {
        count: this.orderCache.size,
        lastUpdated: new Date(this.lastUpdated.orders).toISOString(),
        isValid: this.isOrderCacheValid(),
      },
    }
  }

  private extractShopifyId(fullId: string): string {
    try {
      // Extraer el ID numérico de un ID completo de Shopify (gid://shopify/Product/123456789)
      if (!fullId) return ""
      const parts = fullId.split("/")
      return parts[parts.length - 1]
    } catch (error) {
      console.error("Error al extraer ID de Shopify:", error, "ID original:", fullId)
      return fullId || ""
    }
  }
}

// Exportar una instancia singleton para uso global
export const shopifyCache = ShopifyDataCache.getInstance()
