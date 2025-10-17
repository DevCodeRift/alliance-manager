'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface NationData {
  id: number
  nation_name: string
  leader_name: string
  alliance_position?: string
  cities: number
  score: number
  soldiers: number
  tanks: number
  aircraft: number
  ships: number
  missiles: number
  nukes: number
  vmode: boolean
  color?: string
  continent?: string
}

interface AllianceData {
  id: number
  name: string
  acronym?: string
  score: number
  color?: string
}

type SortField = 'cities' | 'alliance_position' | 'score' | 'nation_name'
type SortDirection = 'asc' | 'desc'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [alliance, setAlliance] = useState<AllianceData | null>(null)
  const [members, setMembers] = useState<NationData[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('cities')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated' && !session?.user?.hasApiKey) {
      router.push('/auth/link-account')
      return
    }

    if (status === 'authenticated' && session?.user?.hasApiKey) {
      loadAllianceData()
    }
  }, [status, session, router])

  const loadAllianceData = async () => {
    try {
      const response = await fetch('/api/alliance/members')
      const data = await response.json()

      if (data.success) {
        setAlliance(data.alliance)
        setMembers(data.members)
      }
    } catch (error) {
      console.error('Error loading alliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedMembers = [...members].sort((a, b) => {
    let compareValue = 0

    switch (sortField) {
      case 'cities':
        compareValue = a.cities - b.cities
        break
      case 'score':
        compareValue = a.score - b.score
        break
      case 'nation_name':
        compareValue = a.nation_name.localeCompare(b.nation_name)
        break
      case 'alliance_position':
        const positions = ['LEADER', 'HEIR', 'OFFICER', 'MEMBER', 'APPLICANT']
        const aPos = positions.indexOf(a.alliance_position || 'MEMBER')
        const bPos = positions.indexOf(b.alliance_position || 'MEMBER')
        compareValue = aPos - bPos
        break
    }

    return sortDirection === 'asc' ? compareValue : -compareValue
  })

  const getRoleColor = (position?: string) => {
    switch (position) {
      case 'LEADER':
        return 'bg-red-100 text-red-800'
      case 'HEIR':
        return 'bg-orange-100 text-orange-800'
      case 'OFFICER':
        return 'bg-blue-100 text-blue-800'
      case 'MEMBER':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alliance Manager</h1>
            <p className="text-sm text-gray-600">
              {session?.user?.nation?.nationName} - {session?.user?.nation?.leaderName}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alliance Info */}
        {alliance && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {alliance.name} {alliance.acronym && `[${alliance.acronym}]`}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Alliance Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alliance.score.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">
                  {members.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Cities</p>
                <p className="text-2xl font-bold text-gray-900">
                  {members.reduce((sum, m) => sum + m.cities, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Members Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Alliance Members</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    onClick={() => handleSort('nation_name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Nation {sortField === 'nation_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('alliance_position')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Role {sortField === 'alliance_position' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('cities')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Cities {sortField === 'cities' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    onClick={() => handleSort('score')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    Score {sortField === 'score' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Military
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.nation_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.leader_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(member.alliance_position)}`}>
                        {member.alliance_position || 'MEMBER'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.cities}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.score.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div>🪖 {member.soldiers.toLocaleString()}</div>
                        <div>🚙 {member.tanks.toLocaleString()}</div>
                        <div>✈️ {member.aircraft.toLocaleString()}</div>
                        <div>🚢 {member.ships.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.vmode && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Vacation Mode
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
