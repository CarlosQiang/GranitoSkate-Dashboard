export type PromotionType = "PERCENTAGE_DISCOUNT" | "FIXED_AMOUNT_DISCOUNT" | "BUY_X_GET_Y" | "FREE_SHIPPING"

export type PromotionTarget = "CART" | "COLLECTION" | "PRODUCT"

export type PromotionStatus = "active" | "expired" | "scheduled" | "UNKNOWN"

export interface Promotion {
  id: string
  title: string
  code: string | null
  isAutomatic: boolean
  startsAt: string
  endsAt: string | null
  status: PromotionStatus
  valueType: PromotionValueType
  value: string | number
  currencyCode?: string
  summary?: string | null
  error?: boolean
  prices?: any[]
  conditions?: any[]
  usageCount?: number
  usageLimit?: number
  target?: string
}

export type PromotionValueType = "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y"
