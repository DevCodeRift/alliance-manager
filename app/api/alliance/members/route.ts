import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fetchAllianceMembers } from '@/lib/pnwkit'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's API key and nation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        nation: {
          include: {
            alliance: true
          }
        }
      }
    })

    if (!user?.pnwApiKey || !user.nation?.allianceId) {
      return NextResponse.json(
        { error: 'User must link API key and be in an alliance' },
        { status: 400 }
      )
    }

    // Fetch fresh data from P&W API
    const members = await fetchAllianceMembers(user.pnwApiKey, user.nation.allianceId)

    // Update database with fresh member data
    for (const member of members) {
      await prisma.nation.upsert({
        where: { id: member.id },
        update: {
          nationName: member.nation_name,
          leaderName: member.leader_name,
          alliancePosition: member.alliance_position,
          cities: member.cities,
          score: member.score,
          soldiers: member.soldiers,
          tanks: member.tanks,
          aircraft: member.aircraft,
          ships: member.ships,
          missiles: member.missiles,
          nukes: member.nukes,
          vmode: member.vmode,
          color: member.color,
          continent: member.continent,
          lastUpdated: new Date(),
        },
        create: {
          id: member.id,
          nationName: member.nation_name,
          leaderName: member.leader_name,
          allianceId: user.nation.allianceId,
          alliancePosition: member.alliance_position,
          cities: member.cities,
          score: member.score,
          soldiers: member.soldiers,
          tanks: member.tanks,
          aircraft: member.aircraft,
          ships: member.ships,
          missiles: member.missiles,
          nukes: member.nukes,
          vmode: member.vmode,
          color: member.color,
          continent: member.continent,
        },
      })
    }

    return NextResponse.json({
      success: true,
      alliance: user.nation.alliance,
      members: members,
    })
  } catch (error) {
    console.error('Error fetching alliance members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alliance members' },
      { status: 500 }
    )
  }
}
