import "next-auth"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    username?: string
    id?: string
  }

  interface Session {
    user: {
      id?: string
      role?: string
      username?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    username?: string
    id?: string
  }
}
