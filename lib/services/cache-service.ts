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
    products.forEach((product) => {
      const id = this.extractShopifyId(product.id)
      this.productCache.set(id, product)
    })
    this.lastUpdated.products = Date.now()
    console.log(`Caché: ${products.length} productos almacenados en caché`)
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
    collections.forEach((collection) => {
      const id = this.extractShopifyId(collection.id)
      this.collectionCache.set(id, collection)
    })
    this.lastUpdated.collections = Date.now()
    console.log(`Caché: ${collections.length} colecciones almacenadas en caché`)
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
    customers.forEach((customer) => {
      const id = this.extractShopifyId(customer.id)
      this.customerCache.set(id, customer)
    })
    this.lastUpdated.customers = Date.now()
    console.log(`Caché: ${customers.length} clientes almacenados en caché`)
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
    orders.forEach((order) => {
      const id = this.extractShopifyId(order.id)
      this.orderCache.set(id, order)
    })
    this.lastUpdated.orders = Date.now()
    console.log(`Caché: ${orders.length} pedidos almacenados en caché`)
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
    // Extraer el ID numérico de un ID completo de Shopify (gid://shopify/Product/123456789)
    const parts = fullId.split("/")
    return parts[parts.length - 1]
  }
}

// Exportar una instancia singleton para uso global
export const shopifyCache = ShopifyDataCache.getInstance()
