import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(req) {
  try {
    const { username, password, expiresAt, adminSlug, packageType, createdBy } = await req.json()

    // Validate input
    if (!username || !password || !expiresAt || !adminSlug) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { adminSlug }
        ]
      }
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Username or slug already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create admin with expiration
    const admin = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        expiresAt: new Date(expiresAt),
        adminSlug,
        packageType,
        role: 'ADMIN',
        createdBy
      },
      select: {
        id: true,
        username: true,
        adminSlug: true,
        expiresAt: true,
        packageType: true
      }
    })

    return NextResponse.json({
      ...admin,
      slug: admin.adminSlug,
      expiresAt: admin.expiresAt.toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    )
  }
}