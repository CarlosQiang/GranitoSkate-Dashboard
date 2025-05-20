// Re-exportar las funciones del servicio de sincronización
import {
  obtenerProductosDeShopify,
  sincronizarProductos,
  obtenerColeccionesDeShopify,
  sincronizarColecciones,
  obtenerClientesDeShopify,
  sincronizarClientes,
  obtenerPedidosDeShopify,
  sincronizarPedidos,
} from "./sync-service"

// Exportar como un objeto para mantener la compatibilidad con el código existente
const syncService = {
  obtenerProductosDeShopify,
  sincronizarProductos,
  obtenerColeccionesDeShopify,
  sincronizarColecciones,
  obtenerClientesDeShopify,
  sincronizarClientes,
  obtenerPedidosDeShopify,
  sincronizarPedidos,
}

export default syncService

// También exportar individualmente para permitir importaciones específicas
export {
  obtenerProductosDeShopify,
  sincronizarProductos,
  obtenerColeccionesDeShopify,
  sincronizarColecciones,
  obtenerClientesDeShopify,
  sincronizarClientes,
  obtenerPedidosDeShopify,
  sincronizarPedidos,
}
