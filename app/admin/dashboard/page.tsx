'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Download, LogOut, Search, Users, TrendingUp, Award, ChevronDown, ChevronUp } from 'lucide-react'

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  sessionId: string
  commitmentLevel: string
  finalScore: number
  actionVelocity: number
  resourceAllocation: number
  influenceRadius: number
  commitmentIntensity: number
  answers: any[]
  createdAt: string
  reportData: any
}

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.commitmentLevel.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchTerm, users])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.status === 401) {
        router.push('/admin/login')
        return
      }
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
        setFilteredUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/admin/export-csv')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sustainability-users-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting CSV:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Visionary': return 'bg-accent-gold text-forest-900'
      case 'Catalyst': return 'bg-forest-700 text-white'
      case 'Advocate': return 'bg-earth-clay text-white'
      case 'Explorer': return 'bg-forest-600 text-white'
      default: return 'bg-earth-stone text-white'
    }
  }

  const getLevelEmoji = (level: string) => {
    switch (level) {
      case 'Visionary': return '👑'
      case 'Catalyst': return '⚡'
      case 'Advocate': return '🎯'
      case 'Explorer': return '🌱'
      default: return '📊'
    }
  }

  const stats = {
    total: users.length,
    avgScore: users.length > 0 ? Math.round(users.reduce((sum, u) => sum + u.finalScore, 0) / users.length) : 0,
    visionaries: users.filter(u => u.commitmentLevel === 'Visionary').length,
    catalysts: users.filter(u => u.commitmentLevel === 'Catalyst').length,
    advocates: users.filter(u => u.commitmentLevel === 'Advocate').length,
    explorers: users.filter(u => u.commitmentLevel === 'Explorer').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent-pearl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-700 mx-auto mb-4"></div>
          <p className="text-earth-stone font-arizona">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-accent-pearl">
      {/* Header */}
      <header className="bg-white border-b border-earth-stone/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-arizona font-bold text-forest-900">Admin Dashboard</h1>
              <p className="text-sm text-earth-stone mt-1">Sustainability Assessment Analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-forest-700 text-white rounded-lg hover:bg-forest-800 transition-colors disabled:opacity-50 font-arizona text-sm"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-earth-stone/20 text-forest-900 rounded-lg hover:bg-earth-stone/30 transition-colors font-arizona text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-forest-700" />
              <div>
                <p className="text-sm text-earth-stone font-arizona">Total Users</p>
                <p className="text-2xl font-arizona font-bold text-forest-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-forest-700" />
              <div>
                <p className="text-sm text-earth-stone font-arizona">Avg Score</p>
                <p className="text-2xl font-arizona font-bold text-forest-900">{stats.avgScore}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-2xl">👑</div>
              <div>
                <p className="text-sm text-earth-stone font-arizona">Visionaries</p>
                <p className="text-2xl font-arizona font-bold text-forest-900">{stats.visionaries}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚡</div>
              <div>
                <p className="text-sm text-earth-stone font-arizona">Catalysts</p>
                <p className="text-2xl font-arizona font-bold text-forest-900">{stats.catalysts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <p className="text-sm text-earth-stone font-arizona">Advocates</p>
                <p className="text-2xl font-arizona font-bold text-forest-900">{stats.advocates}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🌱</div>
              <div>
                <p className="text-sm text-earth-stone font-arizona">Explorers</p>
                <p className="text-2xl font-arizona font-bold text-forest-900">{stats.explorers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-stone" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or level..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-earth-stone/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-700 focus:border-transparent font-arizona"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-forest-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-arizona font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-arizona font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-arizona font-semibold">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-arizona font-semibold">Level</th>
                  <th className="px-6 py-4 text-left text-sm font-arizona font-semibold">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-arizona font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-arizona font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-stone/20">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-earth-stone font-arizona">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <React.Fragment key={user.id}>
                      <tr className="hover:bg-accent-mist transition-colors">
                        <td className="px-6 py-4 text-sm font-arizona text-forest-900">{user.name}</td>
                        <td className="px-6 py-4 text-sm font-arizona text-earth-stone">{user.email}</td>
                        <td className="px-6 py-4 text-sm font-arizona text-earth-stone">{user.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-arizona font-semibold ${getLevelColor(user.commitmentLevel)}`}>
                            <span>{getLevelEmoji(user.commitmentLevel)}</span>
                            {user.commitmentLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-arizona font-bold text-forest-900">{user.finalScore}</td>
                        <td className="px-6 py-4 text-sm font-arizona text-earth-stone">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setExpandedRow(expandedRow === user.id ? null : user.id)}
                            className="text-forest-700 hover:text-forest-900 transition-colors"
                          >
                            {expandedRow === user.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </td>
                      </tr>
                      {expandedRow === user.id && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-accent-mist">
                            <div className="space-y-4">
                              <div className="grid grid-cols-4 gap-4">
                                <div>
                                  <p className="text-xs text-earth-stone font-arizona mb-1">Action Velocity</p>
                                  <p className="text-lg font-arizona font-bold text-forest-900">{user.actionVelocity}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-earth-stone font-arizona mb-1">Resource Allocation</p>
                                  <p className="text-lg font-arizona font-bold text-forest-900">{user.resourceAllocation}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-earth-stone font-arizona mb-1">Influence Radius</p>
                                  <p className="text-lg font-arizona font-bold text-forest-900">{user.influenceRadius}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-earth-stone font-arizona mb-1">Commitment Intensity</p>
                                  <p className="text-lg font-arizona font-bold text-forest-900">{user.commitmentIntensity}</p>
                                </div>
                              </div>
                              {user.answers && user.answers.length > 0 && (
                                <div>
                                  <p className="text-sm font-arizona font-semibold text-forest-900 mb-2">Assessment Answers:</p>
                                  <div className="space-y-2">
                                    {user.answers.map((answer: any, index: number) => (
                                      <div key={index} className="text-sm font-arizona">
                                        <p className="text-forest-900 font-semibold">Q{index + 1}: {answer.questionText}</p>
                                        <p className="text-earth-stone ml-4">A: {answer.value}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
