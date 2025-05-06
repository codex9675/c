const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function test() {
  // Test database connection
  await prisma.$connect()
  console.log('✅ Database connected successfully')

  // Test creating a user
  const testUser = await prisma.user.upsert({
    where: { username: 'testuser' },
    update: {},
    create: {
      username: 'testuser',
      password: await hash('test123', 10),
      role: 'USER',
      passwordExpires: new Date('2030-12-31')
    }
  })
  console.log('✅ Test user created:', testUser)

  // Test finding the user
  const foundUser = await prisma.user.findUnique({
    where: { username: 'testuser' }
  })
  console.log('✅ User lookup works:', !!foundUser)

  await prisma.$disconnect()
}

test().catch(e => {
  console.error('❌ Test failed:', e)
  process.exit(1)
})