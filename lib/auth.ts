import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { Adapter } from "next-auth/adapters"
import DiscordProvider from "next-auth/providers/discord"
import { prisma } from "./prisma"
import { redis } from "./redis"
import { getServerSession } from "next-auth"

export const authOptions: NextAuthOptions = {
  // Use hybrid approach: Prisma for user data, Redis for sessions
  adapter: PrismaAdapter(prisma) as Adapter,
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

        // Try to get user data from Redis cache first
        const cacheKey = `user:${user.id}`
        let userData = await redis.get(cacheKey)

        if (!userData) {
          // If not in cache, fetch from database
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
              nation: {
                include: {
                  alliance: true
                }
              }
            }
          })

          if (dbUser) {
            // Cache for 5 minutes
            await redis.setex(cacheKey, 300, JSON.stringify(dbUser))
            userData = dbUser
          }
        } else if (typeof userData === 'string') {
          userData = JSON.parse(userData)
        }

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

export const auth = () => getServerSession(authOptions)
