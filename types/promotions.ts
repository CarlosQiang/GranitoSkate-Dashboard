export type PromotionType = "PERCENTAGE_DISCOUNT" | "FIXED_AMOUNT_DISCOUNT" | "BUY_X_GET_Y" | "FREE_SHIPPING"

export type PromotionTarget = "CART" | "COLLECTION" | "PRODUCT" | "VARIANT"

export type PromotionConditionType =
  | "MINIMUM_AMOUNT"
  | "FIRST_PURCHASE"
  | "SPECIFIC_CUSTOMER_GROUP"
  | "MINIMUM_QUANTITY"

export type PromotionCondition = {
  type: PromotionConditionType
  value: any
}

export type PromotionPrice = {
  price: {
    amount: string
    currencyCode: string
  }
  productTitle: string
  variantId: string
}

export type Promotion = {
  id: string
  title: string
  type: PromotionType
  value: number
  active: boolean
  startDate: string
  endDate?: string
  conditions: PromotionCondition[]
  usageCount: number
  createdAt: string
  updatedAt: string
  target: PromotionTarget
  prices?: PromotionPrice[]
}
