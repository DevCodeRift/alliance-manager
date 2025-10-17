import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import DiscordProvider from "next-auth/providers/discord"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Add custom user data to session
        const userData = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            nation: {
              include: {
                alliance: true
              }
            }
          }
        })

        if (userData) {
          session.user.nationId = userData.nationId
          session.user.hasApiKey = !!userData.pnwApiKey
          session.user.nation = userData.nation
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/link-account",
  },
  session: {
    strategy: "database",
  },
}
