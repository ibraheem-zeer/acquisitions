# =============================================
# Base stage: common setup for dev & prod
# =============================================
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package.json and package-lock.json
COPY package*.json ./

# =============================================
# Development stage
# =============================================
FROM base AS development

# Install all dependencies (dev + prod)
RUN npm install

# Copy all source code
COPY --chown=nodejs:nodejs . .

# إنشاء مجلد logs مع صلاحيات الكتابة
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app/logs


# Switch to non-root user
USER nodejs

# Expose development port
EXPOSE 5173

# Health check for development
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.request({hostname:'localhost',port:5173,path:'/health'}, (res)=>process.exit(res.statusCode===200?0:1)); req.on('error',()=>process.exit(1)); req.end();"

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start dev server with hot reload
CMD ["npm", "run", "dev"]

# =============================================
# Production stage
# =============================================
FROM base AS production

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy all source code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose production port
EXPOSE 3000

# Health check for production
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.request({hostname:'localhost',port:3000,path:'/health'}, (res)=>process.exit(res.statusCode===200?0:1)); req.on('error',()=>process.exit(1)); req.end();"

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["node", "start"]
