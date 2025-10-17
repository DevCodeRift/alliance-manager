import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fetchNationData, fetchAllianceData } from '@/lib/pnwkit'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { apiKey } = await req.json()

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 })
    }

    // Validate API key by fetching nation data
    const nationData = await fetchNationData(apiKey)

    if (!nationData) {
      return NextResponse.json(
        { error: 'Invalid API key or unable to fetch nation data' },
        { status: 400 }
      )
    }

    // Store or update nation data
    await prisma.nation.upsert({
      where: { id: nationData.id },
      update: {
        nationName: nationData.nation_name,
        leaderName: nationData.leader_name,
        continent: nationData.continent,
        warPolicy: nationData.war_policy,
        domesticPolicy: nationData.domestic_policy,
        color: nationData.color,
        allianceId: nationData.alliance_id,
        alliancePosition: nationData.alliance_position,
        cities: nationData.cities,
        score: nationData.score,
        soldiers: nationData.soldiers,
        tanks: nationData.tanks,
        aircraft: nationData.aircraft,
        ships: nationData.ships,
        missiles: nationData.missiles,
        nukes: nationData.nukes,
        vmode: nationData.vmode,
        lastUpdated: new Date(),
      },
      create: {
        id: nationData.id,
        nationName: nationData.nation_name,
        leaderName: nationData.leader_name,
        continent: nationData.continent,
        warPolicy: nationData.war_policy,
        domesticPolicy: nationData.domestic_policy,
        color: nationData.color,
        allianceId: nationData.alliance_id,
        alliancePosition: nationData.alliance_position,
        cities: nationData.cities,
        score: nationData.score,
        soldiers: nationData.soldiers,
        tanks: nationData.tanks,
        aircraft: nationData.aircraft,
        ships: nationData.ships,
        missiles: nationData.missiles,
        nukes: nationData.nukes,
        vmode: nationData.vmode,
      },
    })

    // If nation has an alliance, fetch and store alliance data
    if (nationData.alliance_id) {
      const allianceData = await fetchAllianceData(apiKey, nationData.alliance_id)

      if (allianceData) {
        await prisma.alliance.upsert({
          where: { id: allianceData.id },
          update: {
            name: allianceData.name,
            acronym: allianceData.acronym,
            score: allianceData.score,
            color: allianceData.color,
            dateCreated: allianceData.date,
            lastUpdated: new Date(),
          },
          create: {
            id: allianceData.id,
            name: allianceData.name,
            acronym: allianceData.acronym,
            score: allianceData.score,
            color: allianceData.color,
            dateCreated: allianceData.date,
          },
        })
      }
    }

    // Update user with API key and nation ID
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        pnwApiKey: apiKey,
        nationId: nationData.id,
      },
    })

    return NextResponse.json({
      success: true,
      nation: nationData,
    })
  } catch (error) {
    console.error('Error linking API key:', error)
    return NextResponse.json(
      { error: 'Failed to link API key' },
      { status: 500 }
    )
  }
}
