import { PnwKit } from 'pnwkit'

export function createPnwClient(apiKey: string) {
  return new PnwKit({ apiKey })
}

export async function fetchNationData(apiKey: string, nationId?: number) {
  const kit = createPnwClient(apiKey)

  try {
    const query = nationId
      ? { id: [nationId] }
      : { first: 1 } // Get first nation if no ID specified (for API key validation)

    const result = await kit.query({
      nations: {
        __args: query,
        data: {
          id: true,
          nation_name: true,
          leader_name: true,
          continent: true,
          war_policy: true,
          domestic_policy: true,
          color: true,
          alliance_id: true,
          alliance_position: true,
          cities: true,
          score: true,
          soldiers: true,
          tanks: true,
          aircraft: true,
          ships: true,
          missiles: true,
          nukes: true,
          vmode: true,
        }
      }
    })

    return result.nations?.data?.[0] || null
  } catch (error) {
    console.error('Error fetching nation data:', error)
    throw new Error('Failed to fetch nation data')
  }
}

export async function fetchAllianceData(apiKey: string, allianceId: number) {
  const kit = createPnwClient(apiKey)

  try {
    const result = await kit.query({
      alliances: {
        __args: {
          id: [allianceId]
        },
        data: {
          id: true,
          name: true,
          acronym: true,
          score: true,
          color: true,
          date: true,
        }
      }
    })

    return result.alliances?.data?.[0] || null
  } catch (error) {
    console.error('Error fetching alliance data:', error)
    throw new Error('Failed to fetch alliance data')
  }
}

export async function fetchAllianceMembers(apiKey: string, allianceId: number) {
  const kit = createPnwClient(apiKey)

  try {
    const result = await kit.query({
      nations: {
        __args: {
          alliance_id: [allianceId],
          first: 500, // Get up to 500 members
        },
        data: {
          id: true,
          nation_name: true,
          leader_name: true,
          alliance_position: true,
          cities: true,
          score: true,
          soldiers: true,
          tanks: true,
          aircraft: true,
          ships: true,
          missiles: true,
          nukes: true,
          vmode: true,
          color: true,
          continent: true,
        }
      }
    })

    return result.nations?.data || []
  } catch (error) {
    console.error('Error fetching alliance members:', error)
    throw new Error('Failed to fetch alliance members')
  }
}
