const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPersonalitySystem() {
  try {
    console.log('🧪 Testing Personality System...\n')

    // Create a test tenant
    const testTenant = await prisma.tenant.create({
      data: {
        name: 'Test Company',
        slug: 'test-company',
        plan: 'FREE',
        status: 'ACTIVE'
      }
    })

    console.log('✅ Created test tenant:', testTenant.name)

    // Create different personality types
    const personalities = [
      {
        name: 'Technology Professional',
        description: 'AI personality optimized for technology industry',
        tone: 'enthusiastic',
        style: 'technical',
        expertise: ['technical', 'strategic', 'innovative'],
        philosophy: {
          innovation: 'We believe in pushing technological boundaries and creating solutions that transform industries.',
          userCentric: 'Technology should serve human needs and enhance human capabilities.',
          continuousLearning: 'We embrace rapid iteration and continuous improvement.'
        },
        values: {
          innovation: 'Pioneering new solutions',
          excellence: 'Technical excellence and quality',
          collaboration: 'Cross-functional teamwork',
          impact: 'Creating meaningful change'
        },
        brandVoice: 'Test Company is a technology company that believes in the power of innovation to solve complex problems and create positive impact.',
        responseLength: 'medium',
        language: 'en',
        isActive: true
      },
      {
        name: 'Healthcare Professional',
        description: 'AI personality optimized for healthcare industry',
        tone: 'professional',
        style: 'detailed',
        expertise: ['technical', 'customer-support', 'strategic'],
        philosophy: {
          patientFirst: 'Every decision we make prioritizes patient safety and well-being.',
          evidenceBased: 'We rely on scientific evidence and clinical best practices.',
          compassionate: 'We approach healthcare with empathy and understanding.'
        },
        values: {
          safety: 'Patient safety above all',
          quality: 'Clinical excellence',
          compassion: 'Empathetic care',
          integrity: 'Ethical practices'
        },
        brandVoice: 'Test Company is a healthcare company committed to improving patient outcomes through innovative, evidence-based solutions.',
        responseLength: 'detailed',
        language: 'en',
        isActive: false
      }
    ]

    for (const personalityData of personalities) {
      const personality = await prisma.personality.create({
        data: {
          ...personalityData,
          tenantId: testTenant.id
        }
      })

      console.log(`✅ Created personality: ${personality.name}`)
      console.log(`   - Tone: ${personality.tone}`)
      console.log(`   - Style: ${personality.style}`)
      console.log(`   - Expertise: ${personality.expertise.join(', ')}`)
      console.log(`   - Active: ${personality.isActive}`)
      console.log('')
    }

    // Test retrieving active personality
    const activePersonality = await prisma.personality.findFirst({
      where: {
        tenantId: testTenant.id,
        isActive: true
      }
    })

    console.log('🎯 Active Personality:')
    console.log(`   Name: ${activePersonality.name}`)
    console.log(`   Philosophy: ${Object.keys(activePersonality.philosophy).length} entries`)
    console.log(`   Values: ${Object.keys(activePersonality.values).length} entries`)
    console.log(`   Brand Voice: ${activePersonality.brandVoice}`)
    console.log('')

    // Test system prompt generation
    const { buildSystemPrompt } = require('../src/lib/personalityService')
    
    const systemPrompt = buildSystemPrompt(
      'How do you handle customer support?',
      'Our company provides excellent customer support through multiple channels.',
      activePersonality,
      testTenant.name
    )

    console.log('📝 Generated System Prompt:')
    console.log('=' .repeat(50))
    console.log(systemPrompt)
    console.log('=' .repeat(50))

    // Cleanup
    await prisma.personality.deleteMany({
      where: { tenantId: testTenant.id }
    })
    await prisma.tenant.delete({
      where: { id: testTenant.id }
    })

    console.log('\n🧹 Cleaned up test data')
    console.log('✅ Personality system test completed successfully!')

  } catch (error) {
    console.error('❌ Error testing personality system:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testPersonalitySystem()
