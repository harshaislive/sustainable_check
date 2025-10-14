import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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

    // Fetch all user info
    const { data: users, error: usersError } = await supabase
      .from('user_info')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersError) {
      throw usersError
    }

    // Fetch all sessions with reports
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (sessionsError) {
      throw sessionsError
    }

    // Fetch all report cards
    const { data: reportCards, error: reportsError } = await supabase
      .from('report_cards')
      .select('*')
      .order('created_at', { ascending: false })

    if (reportsError) {
      throw reportsError
    }

    // Combine the data
    const combinedData = users?.map((user) => {
      const userSession = sessions?.find((s) => s.user_email === user.email)
      const userReport = reportCards?.find((r) => r.session_id === userSession?.id)

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'N/A',
        sessionId: userSession?.id || 'N/A',
        commitmentLevel: userSession?.commitment_score?.level || 'N/A',
        finalScore: userSession?.commitment_score?.finalScore || 0,
        actionVelocity: userSession?.commitment_score?.actionVelocity || 0,
        resourceAllocation: userSession?.commitment_score?.resourceAllocation || 0,
        influenceRadius: userSession?.commitment_score?.influenceRadius || 0,
        commitmentIntensity: userSession?.commitment_score?.commitmentIntensity || 0,
        answers: userSession?.answers || [],
        createdAt: user.created_at,
        reportData: userReport || null,
      }
    }) || []

    return NextResponse.json({
      success: true,
      users: combinedData,
      total: combinedData.length
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
