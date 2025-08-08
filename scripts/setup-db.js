const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupDatabase() {
  try {
    console.log('Setting up database...')
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    
    // Check if demo tenant exists
    const existingDemoTenant = await prisma.tenant.findFirst({
      where: { slug: 'demo' }
    })
    
    if (!existingDemoTenant) {
      console.log('Creating demo tenant...')
      await prisma.tenant.create({
        data: {
          name: 'Demo Company',
          slug: 'demo',
          plan: 'FREE',
          status: 'ACTIVE',
          settings: {},
          metadata: {}
        }
      })
      console.log('✅ Demo tenant created')
    } else {
      console.log('✅ Demo tenant already exists')
    }
    
    // Check if we have any knowledge bases
    const knowledgeBases = await prisma.knowledgeBase.findMany({
      where: { tenantId: existingDemoTenant?.id || 'demo' }
    })
    
    if (knowledgeBases.length === 0) {
      console.log('Creating demo knowledge base...')
      await prisma.knowledgeBase.create({
        data: {
          name: 'Demo Knowledge Base',
          description: 'Default knowledge base for demo tenant',
          isActive: true,
          tenantId: existingDemoTenant?.id || 'demo',
          vectorStoreType: 'PINECONE'
        }
      })
      console.log('✅ Demo knowledge base created')
    } else {
      console.log('✅ Knowledge base already exists')
    }
    
    console.log('🎉 Database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupDatabase()
