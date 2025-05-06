export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  ordersCount: number
  totalSpent: {
    amount: string
    currencyCode: string
  }
  createdAt: string
  updatedAt?: string
  note?: string
  tags: string[]
  verifiedEmail: boolean
  acceptsMarketing: boolean
  addresses: CustomerAddress[]
  defaultAddress?: CustomerAddress
}

export interface CustomersResponse {
  customers: Customer[]
  pageInfo: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    endCursor: string | null
    startCursor: string | null
  }
}

export interface CustomerInput {
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  note?: string
  acceptsMarketing?: boolean
  tags?: string[]
}

export interface CustomerUpdateInput {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  note?: string
  acceptsMarketing?: boolean
  tags?: string[]
}

export interface CustomerAddress {
  id: string
  address1: string
  address2?: string
  city: string
  company?: string
  country: string
  firstName?: string
  lastName?: string
  phone?: string
  province: string
  zip: string
}

export interface CustomerOrder {
  id: string
  name: string
  processedAt: string
  fulfillmentStatus: string
  financialStatus: string
  totalPrice: {
    amount: string
    currencyCode: string
  }
  lineItems: {
    title: string
    quantity: number
    variant?: {
      title: string
      price: {
        amount: string
        currencyCode: string
      }
    }
  }[]
}
