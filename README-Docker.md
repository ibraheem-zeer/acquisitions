# Acquisitions App - Docker & Neon Database Setup

This guide explains how to run the Acquisitions application using Docker with different database configurations for development and production environments.

## 📋 Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Neon Account](https://neon.tech) with a project set up
- Neon API Key (get from [Neon Console](https://console.neon.tech) → Account → API Keys)

## 🏗️ Architecture Overview

### Development Environment
- **Database**: Neon Local proxy running in Docker
- **Features**: 
  - Ephemeral database branches (auto-created/deleted)
  - Local development with cloud data
  - Hot reload support
  - Debug logging enabled

### Production Environment
- **Database**: Direct connection to Neon Cloud
- **Features**:
  - Optimized for performance
  - Resource limits and security hardening
  - Production logging and monitoring

## 🚀 Quick Start

### Development Setup

1. **Clone and navigate to the project**
   ```bash
   git clone <your-repo>
   cd acquisitions
   ```

2. **Configure environment variables**
   ```bash
   cp .env.development .env.development.local
   ```
   
   Edit `.env.development.local` with your Neon credentials:
   ```env
   NEON_API_KEY=your_actual_neon_api_key
   NEON_PROJECT_ID=your_actual_project_id
   PARENT_BRANCH_ID=your_main_branch_id
   ```

3. **Start development environment**
   ```bash
   docker-compose -f docker-compose.dev.yml --env-file .env.development.local up --build
   ```

4. **Access the application**
   - Application: http://localhost:3000
   - Health Check: http://localhost:3000/health
   - Database: localhost:5432 (via Neon Local proxy)

### Production Setup

1. **Configure production environment**
   ```bash
   cp .env.production .env.production.local
   ```
   
   Edit `.env.production.local` with your production Neon URL:
   ```env
   DATABASE_URL=postgresql://username:password@your-endpoint.neon.tech/dbname?sslmode=require
   ARCJET_KEY=your_production_arcjet_key
   ```

2. **Deploy production environment**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production.local up --build -d
   ```

## 📁 Project Structure

```
acquisitions/
├── src/                          # Application source code
├── Dockerfile                    # Multi-stage production Dockerfile
├── docker-compose.dev.yml        # Development with Neon Local
├── docker-compose.prod.yml       # Production with Neon Cloud
├── .env.development              # Development environment template
├── .env.production               # Production environment template
├── .dockerignore                 # Docker build exclusions
└── README-Docker.md              # This documentation
```

## 🔧 Environment Variables

### Development (.env.development)
| Variable | Description | Example |
|----------|-------------|---------|
| `NEON_API_KEY` | Your Neon API key | `neon_api_key_...` |
| `NEON_PROJECT_ID` | Your Neon project ID | `project_id_123` |
| `PARENT_BRANCH_ID` | Parent branch for ephemeral branches | `br_main_456` |
| `DATABASE_URL` | Local connection to Neon proxy | `postgres://neon:npg@neon-local:5432/neondb` |

### Production (.env.production)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Direct Neon Cloud connection | `postgresql://user:pass@ep-....neon.tech/db` |
| `ARCJET_KEY` | Production Arcjet key | `ajkey_prod_...` |

## 🔍 Docker Services

### Development Services
- **neon-local**: Neon Local proxy container
  - Creates ephemeral database branches
  - Provides local Postgres interface
  - Automatically cleans up branches on shutdown
- **app**: Your application container
  - Hot reload enabled
  - Debug logging
  - Connected to neon-local service

### Production Services
- **app**: Optimized application container
  - Resource limits (512MB RAM, 1 CPU)
  - Read-only filesystem
  - Direct Neon Cloud connection
  - Production logging

## 📝 Available Commands

### Development
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start with custom env file
docker-compose -f docker-compose.dev.yml --env-file .env.dev.local up

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build

# Run in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Production
```bash
# Deploy production
docker-compose -f docker-compose.prod.yml up -d

# Scale application (if using Docker Swarm)
docker-compose -f docker-compose.prod.yml up --scale app=3 -d

# Update production deployment
docker-compose -f docker-compose.prod.yml up --build -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f app
```

### Database Operations
```bash
# Run database migrations (development)
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Generate database schema
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Access Drizzle Studio
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

## 🔐 Security Considerations

### Development
- Uses ephemeral branches (data is temporary)
- Debug logging enabled
- Source code mounted for hot reload

### Production
- Read-only filesystem
- Non-root user execution
- Resource limits enforced
- Secrets via environment variables only
- Comprehensive logging with rotation

## 🧪 Testing the Setup

### Health Checks
```bash
# Test application health
curl http://localhost:3000/health

# Test API endpoint
curl http://localhost:3000/api

# Test database connection (check app logs)
docker-compose logs app | grep -i database
```

### Database Connection Testing
```bash
# Connect to Neon Local (development)
psql "postgres://neon:npg@localhost:5432/neondb?sslmode=require"

# Check database in app container
docker-compose exec app node -e "
import { sql } from './src/config/database.js';
const result = await sql\`SELECT version()\`;
console.log('Database version:', result[0]);
"
```

## 🐛 Troubleshooting

### Common Issues

1. **Neon Local Connection Failed**
   ```bash
   # Check if Neon Local is healthy
   docker-compose ps
   
   # View Neon Local logs
   docker-compose logs neon-local
   
   # Verify environment variables
   docker-compose config
   ```

2. **Application Won't Start**
   ```bash
   # Check application logs
   docker-compose logs app
   
   # Verify database connection
   docker-compose exec app npm run db:generate
   ```

3. **Port Already in Use**
   ```bash
   # Change ports in docker-compose.yml
   # Or kill existing process
   lsof -ti:3000 | xargs kill -9  # macOS/Linux
   netstat -ano | findstr :3000   # Windows
   ```

### Environment Issues
- Ensure `.env.development.local` has correct Neon credentials
- Verify `PARENT_BRANCH_ID` exists in your Neon project
- Check that `NEON_API_KEY` has sufficient permissions

### Performance Issues
- Monitor container resources: `docker stats`
- Check database query performance in Neon Console
- Review application logs for slow queries

## 📚 Additional Resources

- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🤝 Contributing

When contributing:
1. Test both development and production setups
2. Update environment variable documentation
3. Verify Docker builds are optimized
4. Test database migrations work in both environments

---

For questions or issues with this setup, please check the troubleshooting section or create an issue in the repository.