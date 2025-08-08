const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise((resolve) => rl.question(query, resolve))

async function createSuperuser() {
  try {
    console.log('🛡️  Creating Superuser Account...\n')

    // Get superuser details
    const email = await question('Enter superuser email: ')
    const name = await question('Enter superuser name: ')
    const password = await question('Enter superuser password (min 8 characters): ')

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create or find default tenant
    const defaultTenant = await prisma.tenant.upsert({
      where: { slug: 'system' },
      update: {},
      create: {
        name: 'System',
        slug: 'system',
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        metadata: {
          isSystemTenant: true
        }
      }
    })

    console.log('\n✅ System tenant ready')

    // Create superuser
    const superuser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'OWNER',
        status: 'ACTIVE',
        isSuperuser: true,
        tenantId: defaultTenant.id
      }
    })

    console.log('\n✅ Superuser created successfully!')
    console.log('\nSuperuser Details:')
    console.log('Email:', superuser.email)
    console.log('Name:', superuser.name)
    console.log('Role: OWNER')
    console.log('Superuser: true')
    console.log('\n🔐 You can now log in at /admin with these credentials.')

  } catch (error) {
    console.error('\n❌ Error creating superuser:', error.message)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

// Run the script
createSuperuser()
