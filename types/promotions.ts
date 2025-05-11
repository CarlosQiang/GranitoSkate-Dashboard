export type PromotionType =
  | "PERCENTAGE_DISCOUNT"
  | "FIXED_AMOUNT_DISCOUNT"
  | "BUY_X_GET_Y"
  | "FREE_SHIPPING"
  | "AUTOMATIC_DISCOUNT"
  | "CODE_DISCOUNT"

export type PromotionTarget = "CART" | "COLLECTION" | "PRODUCT" | "VARIANT" | "CUSTOMER_SEGMENT"

export type PromotionConditionType =
  | "MINIMUM_AMOUNT"
  | "FIRST_PURCHASE"
  | "SPECIFIC_CUSTOMER_GROUP"
  | "MINIMUM_QUANTITY"
  | "DATE_RANGE"
  | "CUSTOMER_SEGMENT"
  | "USAGE_LIMIT"

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
  shortSummary?: string
  customerSegments?: string[]
  marketingChannel?: string
}

export type MarketingActivity = {
  id: string
  title: string
  status: string
  type: string
  channel: string
  startDate: string
  endDate?: string
  budget?: {
    amount: number
    currencyCode: string
  }
  targetAudience?: string
  metrics?: {
    impressions?: number
    clicks?: number
    conversions?: number
  }
}

export type DiscountCode = {
  id: string
  code: string
  discountId: string
  usageCount: number
  createdAt: string
}
