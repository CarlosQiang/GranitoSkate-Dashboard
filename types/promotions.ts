export type PromotionType = "PERCENTAGE_DISCOUNT" | "FIXED_AMOUNT_DISCOUNT" | "BUY_X_GET_Y" | "FREE_SHIPPING"

export type PromotionTarget = "CART" | "COLLECTION" | "PRODUCT" | "VARIANT"

export type PromotionConditionType =
  | "MINIMUM_AMOUNT"
  | "FIRST_PURCHASE"
  | "SPECIFIC_CUSTOMER_GROUP"
  | "MINIMUM_QUANTITY"
  | "DATE_RANGE"

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

export type PromotionStatus = "ACTIVE" | "EXPIRED" | "SCHEDULED" | "INACTIVE"

export type PromotionMinimumRequirement = {
  type: "MINIMUM_AMOUNT" | "MINIMUM_QUANTITY"
  value: number
}

export type Promotion = {
  id: string
  title: string
  summary?: string
  type: PromotionType
  value: number
  status: PromotionStatus
  startsAt: string
  endsAt?: string
  code?: string
  usageCount?: number
  usageLimit?: number
  createdAt?: string
  updatedAt?: string
  target: PromotionTarget
  targetId?: string
  minimumRequirement?: PromotionMinimumRequirement
  conditions?: PromotionCondition[]
  prices?: PromotionPrice[]
  active?: boolean
  valueType?: string
  discountClass?: string
}
