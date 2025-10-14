import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export async function GET() {
  try {
    // Check if user is admin
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all data
    const { data: users } = await supabase
      .from('user_info')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: reportCards } = await supabase
      .from('report_cards')
      .select('*')
      .order('created_at', { ascending: false })

    // Combine data
    const combinedData = users?.map((user) => {
      const userSession = sessions?.find((s) => s.user_email === user.email)
      const userReport = reportCards?.find((r) => r.session_id === userSession?.id)

      const answers = userSession?.answers || []
      const answersText = answers.map((a: any, i: number) =>
        `Q${i + 1}: ${a.questionText} | A: ${a.value}`
      ).join(' | ')

      return {
        Name: user.name || '',
        Email: user.email || '',
        Phone: user.phone || '',
        'Session ID': userSession?.id || '',
        'Commitment Level': userSession?.commitment_score?.level || '',
        'Final Score': userSession?.commitment_score?.finalScore || 0,
        'Action Velocity': userSession?.commitment_score?.actionVelocity || 0,
        'Resource Allocation': userSession?.commitment_score?.resourceAllocation || 0,
        'Influence Radius': userSession?.commitment_score?.influenceRadius || 0,
        'Commitment Intensity': userSession?.commitment_score?.commitmentIntensity || 0,
        'Behavioral Consistency': userSession?.commitment_score?.behavioralConsistency || 0,
        'Date Taken': user.created_at ? new Date(user.created_at).toLocaleString() : '',
        'All Answers': answersText
      }
    }) || []

    // Create CSV
    const headers = Object.keys(combinedData[0] || {})
    const csvRows = [
      headers.join(','),
      ...combinedData.map((row) =>
        headers.map((header) => escapeCSV(row[header as keyof typeof row])).join(',')
      )
    ]

    const csv = csvRows.join('\n')
    const filename = `sustainability-users-${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error exporting CSV:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
