const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await hash('master123', 10)
  
  // Generate unique profile link for master admin
  const profileLink = `master-admin-${Math.random().toString(36).substring(2, 8)}`
  
  await prisma.user.upsert({
    where: { username: 'master' },
    update: {},
    create: {
      username: 'master',
      password: hashedPassword,
      role: 'MASTER',
      plan: 'ENTERPRISE', // Add this line to set the plan
      profileLink: profileLink,
      passwordExpires: new Date('2030-12-31')
    }
  })
  
  console.log('Database seeded successfully')
  console.log(`Master admin profile link: ${profileLink}`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })