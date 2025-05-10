export interface Market {
  id: string
  name: string
  enabled: boolean
  primary: boolean
  web: {
    domain: string
    url: string
  }
}
