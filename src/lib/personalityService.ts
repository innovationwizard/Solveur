import { prisma } from './prisma'

export interface PersonalityConfig {
  id: string
  name: string
  description?: string
  tone: string
  style: string
  expertise: string[]
  philosophy: Record<string, any>
  values: Record<string, any>
  brandVoice?: string
  customPrompt?: string
  context: Record<string, any>
  responseLength: string
  language: string
}

export interface IndustryDefaults {
  [key: string]: {
    tone: string
    style: string
    expertise: string[]
    philosophy: Record<string, any>
    values: Record<string, any>
    brandVoice: string
  }
}

// Industry-based personality defaults
const INDUSTRY_DEFAULTS: IndustryDefaults = {
  'technology': {
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
    brandVoice: 'We are a technology company that believes in the power of innovation to solve complex problems and create positive impact.'
  },
  'healthcare': {
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
    brandVoice: 'We are a healthcare company committed to improving patient outcomes through innovative, evidence-based solutions.'
  },
  'finance': {
    tone: 'formal',
    style: 'concise',
    expertise: ['strategic', 'technical', 'customer-support'],
    philosophy: {
      trust: 'Trust is the foundation of all financial relationships.',
      transparency: 'Clear, honest communication builds lasting partnerships.',
      security: 'Protecting client assets and data is paramount.'
    },
    values: {
      trust: 'Building lasting relationships',
      security: 'Protecting client assets',
      transparency: 'Clear communication',
      excellence: 'Financial expertise'
    },
    brandVoice: 'We are a financial services company that prioritizes trust, security, and transparent communication in all client relationships.'
  },
  'education': {
    tone: 'friendly',
    style: 'conversational',
    expertise: ['customer-support', 'strategic', 'creative'],
    philosophy: {
      lifelongLearning: 'Education is a journey that never ends.',
      accessibility: 'Knowledge should be available to everyone.',
      empowerment: 'Education empowers individuals to reach their potential.'
    },
    values: {
      learning: 'Continuous growth',
      accessibility: 'Inclusive education',
      empowerment: 'Student success',
      innovation: 'Modern learning methods'
    },
    brandVoice: 'We are an education company dedicated to making learning accessible, engaging, and empowering for all students.'
  },
  'retail': {
    tone: 'friendly',
    style: 'conversational',
    expertise: ['customer-support', 'sales', 'creative'],
    philosophy: {
      customerCentric: 'The customer is at the heart of everything we do.',
      experience: 'We create memorable shopping experiences.',
      convenience: 'We make shopping easy and enjoyable.'
    },
    values: {
      service: 'Exceptional customer service',
      quality: 'Premium products',
      convenience: 'Easy shopping experience',
      innovation: 'Modern retail solutions'
    },
    brandVoice: 'We are a retail company focused on creating exceptional customer experiences through quality products and outstanding service.'
  },
  'consulting': {
    tone: 'professional',
    style: 'detailed',
    expertise: ['strategic', 'technical', 'customer-support'],
    philosophy: {
      expertise: 'Deep knowledge and experience drive successful outcomes.',
      partnership: 'We work as trusted partners with our clients.',
      results: 'We deliver measurable, lasting results.'
    },
    values: {
      expertise: 'Deep knowledge',
      partnership: 'Trusted collaboration',
      results: 'Measurable outcomes',
      integrity: 'Ethical consulting'
    },
    brandVoice: 'We are a consulting firm that partners with clients to deliver strategic solutions and measurable results through deep expertise.'
  }
}

export async function createPersonality(
  tenantId: string,
  data: Partial<PersonalityConfig>
): Promise<PersonalityConfig | null> {
  try {
    const personality = await prisma.personality.create({
      data: {
        tenantId,
        name: data.name || 'Default',
        description: data.description,
        tone: data.tone || 'professional',
        style: data.style || 'balanced',
        expertise: data.expertise || ['general'],
        philosophy: data.philosophy || {},
        values: data.values || {},
        brandVoice: data.brandVoice,
        customPrompt: data.customPrompt,
        context: data.context || {},
        responseLength: data.responseLength || 'medium',
        language: data.language || 'en'
      }
    })

    return personality as PersonalityConfig
  } catch (error) {
    console.error('Error creating personality:', error)
    return null
  }
}

export async function getPersonality(tenantId: string): Promise<PersonalityConfig | null> {
  try {
    const personality = await prisma.personality.findFirst({
      where: {
        tenantId,
        isActive: true
      }
    })

    return personality as PersonalityConfig | null
  } catch (error) {
    console.error('Error getting personality:', error)
    return null
  }
}

export async function createIndustryBasedPersonality(
  tenantId: string,
  industry: string,
  companyName: string
): Promise<PersonalityConfig | null> {
  const defaults = INDUSTRY_DEFAULTS[industry.toLowerCase()] || INDUSTRY_DEFAULTS['technology']
  
  const personalityData: Partial<PersonalityConfig> = {
    name: `${industry.charAt(0).toUpperCase() + industry.slice(1)} Professional`,
    description: `AI personality optimized for ${industry} industry`,
    tone: defaults.tone,
    style: defaults.style,
    expertise: defaults.expertise,
    philosophy: defaults.philosophy,
    values: defaults.values,
    brandVoice: defaults.brandVoice.replace('We are a', `${companyName} is a`),
    context: {
      industry,
      companyName,
      defaultIndustry: industry
    }
  }

  return await createPersonality(tenantId, personalityData)
}

export function buildSystemPrompt(
  query: string,
  context: string,
  personality: PersonalityConfig,
  companyName: string
): string {
  const philosophyText = Object.entries(personality.philosophy)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')

  const valuesText = Object.entries(personality.values)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')

  let systemPrompt = `You are Solveur, an AI business assistant for ${companyName}.

PERSONALITY:
- Tone: ${personality.tone}
- Style: ${personality.style}
- Expertise: ${personality.expertise.join(', ')}

PHILOSOPHICAL FOUNDATIONS:
${philosophyText}

CORE VALUES:
${valuesText}

BRAND VOICE:
${personality.brandVoice || `${companyName} is committed to excellence and customer satisfaction.`}

INSTRUCTIONS:
- Use the provided context to answer questions accurately and helpfully
- Maintain the specified tone and style in your responses
- If the context doesn't contain relevant information, say so politely and offer to help in other ways
- Keep responses ${personality.responseLength} in length
- Respond in ${personality.language}

${personality.customPrompt ? `ADDITIONAL INSTRUCTIONS: ${personality.customPrompt}` : ''}

Context: ${context}`

  return systemPrompt
}

export async function updatePersonality(
  personalityId: string,
  data: Partial<PersonalityConfig>
): Promise<PersonalityConfig | null> {
  try {
    const personality = await prisma.personality.update({
      where: { id: personalityId },
      data: {
        name: data.name,
        description: data.description,
        tone: data.tone,
        style: data.style,
        expertise: data.expertise,
        philosophy: data.philosophy,
        values: data.values,
        brandVoice: data.brandVoice,
        customPrompt: data.customPrompt,
        context: data.context,
        responseLength: data.responseLength,
        language: data.language
      }
    })

    return personality as PersonalityConfig
  } catch (error) {
    console.error('Error updating personality:', error)
    return null
  }
}

export async function listPersonalities(tenantId: string): Promise<PersonalityConfig[]> {
  try {
    const personalities = await prisma.personality.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    })

    return personalities as PersonalityConfig[]
  } catch (error) {
    console.error('Error listing personalities:', error)
    return []
  }
}
