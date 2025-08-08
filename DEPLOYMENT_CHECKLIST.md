# Production Deployment Checklist

Use this checklist to ensure Solveur is properly configured for production.

## ✅ Pre-Deployment

- [ ] **Environment Variables Set**
  - [ ] `DATABASE_URL` - PostgreSQL connection string
  - [ ] `OPENAI_API_KEY` - OpenAI API key
  - [ ] `NEXTAUTH_SECRET` - Random secret for authentication
  - [ ] `NEXTAUTH_URL` - Your production domain
  - [ ] `PINECONE_API_KEY` - (Optional) Pinecone API key
  - [ ] `PINECONE_HOST` - (Optional) Pinecone host
  - [ ] `PINECONE_INDEX_NAME` - (Optional) Pinecone index name

- [ ] **Database Setup**
  - [ ] PostgreSQL database created and accessible
  - [ ] Database migrations run: `npm run db:generate && npm run db:push`
  - [ ] Demo tenant created: `npm run db:setup`

- [ ] **External Services**
  - [ ] OpenAI API key has sufficient credits
  - [ ] Pinecone index exists (if using vector search)
  - [ ] Stripe webhooks configured (if using billing)

## ✅ Post-Deployment

- [ ] **Health Check**
  - [ ] Visit `/api/health` and verify all services are healthy
  - [ ] Check database connection status
  - [ ] Verify OpenAI API is working
  - [ ] Confirm Pinecone is configured (if applicable)

- [ ] **Functionality Test**
  - [ ] Chat interface loads without errors
  - [ ] Can send a message and receive a response
  - [ ] Error handling works properly
  - [ ] Demo tenant is accessible

- [ ] **Error Monitoring**
  - [ ] Check server logs for any errors
  - [ ] Monitor application performance
  - [ ] Set up error tracking (Sentry recommended)

## 🔧 Troubleshooting

### If the app shows "I apologize, but I encountered an error processing your request":

1. **Check the health endpoint** (`/api/health`)
2. **Verify environment variables** are set correctly
3. **Check OpenAI API key** has credits and is valid
4. **Review server logs** for detailed error messages
5. **Test database connection** manually

### If database connection fails:

1. **Verify `DATABASE_URL`** is correct and accessible
2. **Check database permissions** for the connection user
3. **Ensure database exists** and is running
4. **Run migrations** if schema is out of date

### If vector search doesn't work:

1. **Pinecone is optional** - the app will work without it
2. **Check Pinecone configuration** if you want vector search
3. **Verify Pinecone index** exists and is accessible
4. **Test Pinecone API** manually

## 📞 Support

If you're still experiencing issues:

1. Check the health endpoint first
2. Review the detailed logs
3. Verify all environment variables are set
4. Test each service individually
5. Contact support with the health endpoint response

## 🎯 Quick Fix Commands

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Setup demo tenant
npm run db:setup

# Check health
curl https://yourdomain.com/api/health
```
