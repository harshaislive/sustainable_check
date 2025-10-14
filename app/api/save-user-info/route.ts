import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { name, email, phone } = await request.json()

    // Validate input
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      )
    }

    // Insert user info into Supabase
    const { data, error } = await supabase
      .from('user_info')
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save user information' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      userInfoId: data.id
    })
  } catch (error) {
    console.error('Error saving user info:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
