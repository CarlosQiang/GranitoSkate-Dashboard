export interface CustomerAddress {
  id?: string
  address1?: string
  address2?: string
  city?: string
  company?: string
  country?: string
  countryCode?: string
  firstName?: string
  lastName?: string
  phone?: string
  province?: string
  provinceCode?: string
  zip?: string
  formattedArea?: string
  latitude?: number
  longitude?: number
  name?: string
}

export interface CustomerDefaultAddress extends CustomerAddress {
  formattedArea?: string
}

export interface CustomerImage {
  src?: string
  alt?: string
}

export interface CustomerAmountSpent {
  amount?: string
  currencyCode?: string
}

export interface Customer {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  tags?: string[]
  note?: string
  verifiedEmail?: boolean
  validEmailAddress?: boolean
  addresses?: CustomerAddress[]
  defaultAddress?: CustomerDefaultAddress
  image?: CustomerImage
  createdAt?: string
  updatedAt?: string
  numberOfOrders?: number
  amountSpent?: CustomerAmountSpent
  lifetimeDuration?: string
  canDelete?: boolean
}

export interface CustomerInput {
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  note?: string
  tags?: string[]
  addresses?: Omit<CustomerAddress, "id">[]
  password?: string
  acceptsMarketing?: boolean
}

export interface CustomerUpdateInput extends Partial<CustomerInput> {
  id: string
}

export interface CustomerFilters {
  query?: string
  first?: number
  after?: string
  before?: string
  last?: number
  sortKey?: "CREATED_AT" | "UPDATED_AT" | "LAST_ORDER_DATE" | "NAME" | "TOTAL_SPENT"
  reverse?: boolean
}

export interface CustomersResponse {
  customers: Customer[]
  pageInfo: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor?: string
    endCursor?: string
  }
}
