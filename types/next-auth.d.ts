import "next-auth"
import { Nation, Alliance } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      nationId?: number | null
      hasApiKey?: boolean
      nation?: (Nation & { alliance: Alliance | null }) | null
    }
  }

  interface User {
    nationId?: number | null
    pnwApiKey?: string | null
  }
}
