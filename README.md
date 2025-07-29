# Solveur - World-Class Multitenant SaaS

Solveur is an AI-powered business problem solver built with a world-class multitenant architecture. This application demonstrates enterprise-grade SaaS patterns including tenant isolation, subscription management, usage tracking, and scalable infrastructure.

## 🏗️ Architecture Overview

### Multitenant Patterns Implemented

1. **Database-per-Tenant Isolation**: Each tenant's data is isolated at the database level
2. **Subdomain Routing**: Tenants access via `tenant-slug.yourdomain.com`
3. **Custom Domain Support**: Tenants can use their own domains
4. **Usage-Based Billing**: Track and limit usage per tenant
5. **Role-Based Access Control**: Different user roles within tenants
6. **Audit Logging**: Complete audit trail for compliance

### Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with multitenant schema
- **Authentication**: NextAuth.js with custom tenant-aware provider
- **Billing**: Stripe integration with subscription management
- **Vector Search**: Pinecone for RAG capabilities
- **AI**: OpenAI GPT-4 for intelligent responses
- **Monitoring**: Sentry for error tracking
- **Queue**: Redis + Bull for background jobs

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (for job queues)
- Stripe account
- OpenAI API key
- Pinecone account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd solveur
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/solveur"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   
   # OpenAI
   OPENAI_API_KEY="your-openai-api-key"
   
   # Pinecone
   PINECONE_API_KEY="your-pinecone-api-key"
   PINECONE_ENVIRONMENT="your-pinecone-environment"
   
   # Stripe
   STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"
   STRIPE_PUBLISHABLE_KEY="pk_test_your-stripe-publishable-key"
   STRIPE_WEBHOOK_SECRET="whsec_your-stripe-webhook-secret"
   
   # Stripe Price IDs
   STRIPE_STARTER_PRICE_ID="price_your-starter-plan-id"
   STRIPE_PROFESSIONAL_PRICE_ID="price_your-professional-plan-id"
   STRIPE_ENTERPRISE_PRICE_ID="price_your-enterprise-plan-id"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏢 Multitenant Features

### Tenant Isolation

- **Database Level**: Each tenant's data is isolated using tenant IDs
- **API Level**: All API routes validate tenant context
- **Middleware**: Automatic tenant detection and routing
- **Security**: Cross-tenant data access is prevented

### Tenant Routing

The application supports multiple routing strategies:

1. **Subdomain Routing**: `tenant-slug.yourdomain.com`
2. **Custom Domains**: `tenant.com` → maps to tenant
3. **Path-based**: `/tenant-slug/dashboard`

### Subscription Plans

| Plan | Price | Users | Conversations | Documents | API Calls | Storage |
|------|-------|-------|---------------|-----------|-----------|---------|
| Free | $0 | 1 | 100 | 10 | 1,000 | 100MB |
| Starter | $29 | 5 | 1,000 | 100 | 10,000 | 1GB |
| Professional | $99 | 25 | 10,000 | 1,000 | 100,000 | 10GB |
| Enterprise | $299 | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |

### Usage Tracking

- **Real-time Monitoring**: Track API calls, conversations, documents
- **Daily Limits**: Enforce plan limits per day
- **Analytics Dashboard**: Usage statistics and trends
- **Billing Integration**: Automatic billing based on usage

## 🔐 Security Features

### Authentication & Authorization

- **Multi-tenant Auth**: Users belong to specific tenants
- **Role-Based Access**: Owner, Admin, Member, Viewer roles
- **API Key Management**: Secure API access for integrations
- **Session Management**: JWT-based sessions with tenant context

### Data Protection

- **Tenant Isolation**: Complete data separation
- **Audit Logging**: All actions logged for compliance
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

## 📊 Monitoring & Observability

### Error Tracking

- **Sentry Integration**: Real-time error monitoring
- **Structured Logging**: Winston for application logs
- **Performance Monitoring**: Track response times and errors

### Usage Analytics

- **Tenant Metrics**: Usage per tenant and plan
- **Feature Adoption**: Track which features are used most
- **Performance Insights**: Database query performance
- **Business Intelligence**: Revenue and growth metrics

## 🚀 Deployment

### Production Checklist

1. **Database Setup**
   - PostgreSQL with connection pooling
   - Database backups and replication
   - Performance monitoring

2. **Infrastructure**
   - Vercel or AWS deployment
   - CDN for static assets
   - Redis for caching and queues

3. **Security**
   - SSL certificates for all domains
   - Rate limiting and DDoS protection
   - Security headers and CSP

4. **Monitoring**
   - Application performance monitoring
   - Database monitoring
   - Uptime monitoring

### Environment Variables for Production

```env
# Production Database
DATABASE_URL="postgresql://user:pass@prod-db:5432/solveur"

# Production URLs
NEXTAUTH_URL="https://yourdomain.com"

# Production Stripe Keys
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Monitoring
SENTRY_DSN="https://..."
```

## 🔧 Development

### Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name add_new_feature

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### API Development

All API routes follow the multitenant pattern:

```typescript
// Example API route
export async function GET(request: NextRequest) {
  const tenant = await getTenantFromHeaders()
  const user = await getUserFromHeaders()
  
  if (!tenant || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Tenant-specific logic here
}
```

### Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📈 Scaling Considerations

### Database Scaling

- **Connection Pooling**: Use PgBouncer for connection management
- **Read Replicas**: Separate read/write operations
- **Sharding**: Consider database sharding for large scale
- **Caching**: Redis for frequently accessed data

### Application Scaling

- **Horizontal Scaling**: Multiple application instances
- **Load Balancing**: Distribute traffic across instances
- **CDN**: Cache static assets globally
- **Microservices**: Consider breaking into smaller services

### Tenant Scaling

- **Resource Limits**: Enforce tenant resource limits
- **Rate Limiting**: Prevent abuse per tenant
- **Quotas**: Monitor and limit tenant usage
- **Isolation**: Ensure tenant data never leaks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@solveur.com or create an issue in this repository.

---

**Built with ❤️ for enterprise-grade multitenant SaaS applications** 