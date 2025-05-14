import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { username } = params

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { profileLink: username },
      select: {
        id: true,
        username: true,
        role: true,
        plan: true,
        shopName: true,
        storeImage: true,
        description: true,
        portfolioColor: true,
        profileLink: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}