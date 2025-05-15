"use server"

import shopifyClient from "@/lib/shopify"
import { gql } from "graphql-request"

export async function inicializarShopify() {
  try {
    // Verificar la conexión con Shopify
    const query = gql`
      query {
        shop {
          name
        }
      }
    `

    const data = await shopifyClient.request(query)

    if (data && data.shop && data.shop.name) {
      return {
        success: true,
        message: `Conexión exitosa a la tienda: ${data.shop.name}`,
      }
    } else {
      return {
        success: false,
        message: "No se pudo obtener información de la tienda",
      }
    }
  } catch (error) {
    console.error("Error al inicializar Shopify:", error)
    return {
      success: false,
      message: `Error al inicializar Shopify: ${(error as Error).message}`,
    }
  }
}
