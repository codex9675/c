import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        username: true,
        profileLink: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(admins)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch admins' },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  try {
    const { username, password, profileLink } = await req.json()

    // Validate input
    if (!username || !password || !profileLink) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if username or profile link exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { profileLink }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username or profile link already exists' },
        { status: 400 }
      )
    }

    // Create admin user
    const hashedPassword = await hash(password, 10)
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'ADMIN',
        profileLink
      },
      select: {
        id: true,
        username: true,
        profileLink: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create admin user' },
      { status: 500 }
    )
  }
}