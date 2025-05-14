import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

// Define allowed plans
const ALLOWED_PLANS = ['BASIC', 'PROFESSIONAL', 'ENTERPRISE'];

// GET all admins
export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        plan: {
          in: ALLOWED_PLANS,
        },
      },
      select: {
        id: true,
        username: true,
        role: true,
        plan: true,
        profileLink: true,
        passwordExpires: true,
        createdAt: true,
        themeColor: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admins' },
      { status: 500 }
    );
  }
}

// POST create a new admin
export async function POST(request) {
  try {
    const body = await request.json();
    let { username, password, passwordExpires, plan, portfolioUrl } = body;

    // Validate required fields
    if (!username || !password || !passwordExpires) {
      return NextResponse.json(
        { error: 'Username, password, and expiration date are required' },
        { status: 400 }
      );
    }

    // Validate and normalize plan
    plan = (plan || 'BASIC').toUpperCase();
    if (!ALLOWED_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: `Invalid plan. Must be one of: ${ALLOWED_PLANS.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate clean portfolio URL
    const generateProfileLink = (username) => {
      return username
        .toLowerCase()
        .replace(/\s+/g, '-')         // Replace spaces with hyphens
        .replace(/[^\w-]+/g, '')      // Remove all non-word chars
        .replace(/--+/g, '-')         // Replace multiple hyphens with single
        .replace(/^-+/, '')           // Trim hyphens from start
        .replace(/-+$/, '');          // Trim hyphens from end
    };

    const profileLink = portfolioUrl || generateProfileLink(username);

    // Check if URL is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        profileLink: profileLink
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Portfolio URL already in use' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create admin
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'ADMIN',
        plan,
        profileLink,
        passwordExpires: new Date(passwordExpires),
        themeColor: '#ffffff', // default color
      },
    });

    return NextResponse.json({
      id: user.id,
      username: user.username,
      plan: user.plan,
      profileLink: user.profileLink,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}