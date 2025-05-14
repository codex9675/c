import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create admin user with only valid fields
    const newAdmin = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        passwordExpires: new Date('3022-02-20'),
        role: 'ADMIN',
        // Only include if added to schema:
        // profileLink: username.toLowerCase(),
        // packageType: 'basic'
      },
      select: {
        id: true,
        username: true,
        role: true,
        passwordExpires: true
        // profileLink: true // Only if field exists
      }
    })

    return new Response(JSON.stringify(newAdmin), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Admin creation error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create admin' }),
      { status: 500 }
    )
  }
}