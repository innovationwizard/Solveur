# Environment Setup Guide for Solveur

This guide will help you configure the environment variables needed for Solveur to work properly in production.

## Required Environment Variables

### 1. Database Configuration
```bash
DATABASE_URL="postgresql://username:password@host:port/database"
```
- **Required**: Yes
- **Description**: PostgreSQL connection string
- **Example**: `postgresql://solveur_user:password123@localhost:5432/solveur_db`

### 2. OpenAI Configuration
```bash
OPENAI_API_KEY="sk-..."
```
- **Required**: Yes
- **Description**: Your OpenAI API key
- **Get it from**: https://platform.openai.com/api-keys

### 3. Pinecone Configuration (Optional)
```bash
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_HOST="your-pinecone-host"
PINECONE_INDEX_NAME="solveur-index"
```
- **Required**: No (app will work without vector search)
- **Description**: Pinecone vector database configuration
- **Get it from**: https://app.pinecone.io/

### 4. NextAuth Configuration (Optional)
```bash
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
```
- **Required**: No (for basic functionality)
- **Description**: Authentication configuration

## Production Deployment Steps

### 1. Database Setup
1. Create a PostgreSQL database
2. Run database migrations:
   ```bash
   npm run db:generate
   npm run db:push
   ```

### 2. Environment Variables
1. Set all required environment variables in your hosting platform
2. For Vercel: Add them in the project settings
3. For other platforms: Follow their environment variable configuration

### 3. Health Check
After deployment, check the health endpoint:
```
GET /api/health
```

This will show you the status of all services and help identify any configuration issues.

## Troubleshooting

### Common Issues

1. **"I apologize, but I encountered an error processing your request"**
   - Check if `OPENAI_API_KEY` is set correctly
   - Verify the API key has sufficient credits
   - Check the health endpoint for detailed status

2. **Database connection errors**
   - Verify `DATABASE_URL` is correct
   - Ensure database is accessible from your hosting platform
   - Check if database migrations have been run

3. **Vector search not working**
   - Pinecone is optional - the app will work without it
   - If you want vector search, configure all Pinecone variables
   - Check Pinecone index exists and is accessible

### Health Check Response
The health endpoint will return something like:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "services": {
    "database": "healthy",
    "openai": "healthy",
    "pinecone": "not_configured"
  },
  "environment": {
    "nodeEnv": "production",
    "hasOpenAIKey": true,
    "hasDatabaseUrl": true,
    "hasPineconeKey": false,
    "hasPineconeHost": false,
    "hasPineconeIndex": false
  }
}
```

## Demo Mode
If no tenant headers are provided, the app will automatically create a demo tenant and use demo knowledge base content. This allows the app to work immediately without complex setup.

## Support
If you're still experiencing issues:
1. Check the health endpoint first
2. Review server logs for detailed error messages
3. Ensure all required environment variables are set
4. Verify database connectivity and migrations
