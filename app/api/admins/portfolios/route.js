import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$connect();

    // Fetch all portfolios with their first product's image as cover
    const portfolios = await prisma.user.findMany({
      where: {
        products: {
          some: {}
        }
      },
      select: {
        username: true,
        shopName: true,
        portfolioColor: true,
        products: {
          take: 1,
          orderBy: {
            id: 'asc'
          },
          select: {
            image: true
          }
        }
      }
    });

    // Format the response
    const formattedPortfolios = portfolios.map(portfolio => ({
      username: portfolio.username,
      shopName: portfolio.shopName,
      portfolioColor: portfolio.portfolioColor,
      coverImage: portfolio.products[0]?.image.startsWith('/uploads') 
        ? portfolio.products[0].image 
        : `/uploads/${portfolio.products[0]?.image}`
    }));

    return NextResponse.json(formattedPortfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}