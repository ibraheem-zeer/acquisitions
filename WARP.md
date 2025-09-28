# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common Development Commands

### Development Server

```bash
npm run dev          # Start development server with auto-reload using Node.js --watch
```

### Database Operations

```bash
npm run db:generate  # Generate Drizzle schema migrations
npm run db:migrate   # Apply database migrations
npm run db:studio    # Open Drizzle Studio for database management
```

### Code Quality

```bash
npm run lint         # Run ESLint to check code quality
npm run lint:fix     # Run ESLint with automatic fixes
npm run format       # Format code with Prettier
npm run format:check # Check if code is properly formatted
```

## Architecture Overview

This is a Node.js REST API built with Express.js following a layered architecture pattern:

### Core Technology Stack

- **Framework**: Express.js v5 with ES modules
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT with secure HTTP-only cookies
- **Validation**: Zod for request validation
- **Logging**: Winston with file and console transports
- **Security**: Helmet, CORS, bcrypt for password hashing

### Directory Structure & Layers

```
src/
├── config/          # Configuration files
│   ├── database.js  # Neon PostgreSQL connection setup
│   └── logger.js    # Winston logging configuration
├── controllers/     # Request handlers and business logic coordination
├── middleware/      # Express middleware (authentication, validation, etc.)
├── models/         # Drizzle ORM schema definitions
├── routes/         # Express route definitions
├── services/       # Business logic and data access layer
├── utils/          # Shared utilities (JWT, cookies, formatting)
├── validations/    # Zod validation schemas
├── app.js          # Express application setup and middleware configuration
├── server.js       # Server startup and port binding
└── index.js        # Application entry point
```

### Path Aliases

The project uses Node.js import maps for clean imports:

- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#middleware/*` → `./src/middleware/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`

### Data Flow Pattern

1. **Routes** (`src/routes/`) define API endpoints
2. **Controllers** (`src/controllers/`) handle HTTP requests/responses
3. **Validations** (`src/validations/`) validate request data with Zod schemas
4. **Services** (`src/services/`) contain business logic and database operations
5. **Models** (`src/models/`) define database schema with Drizzle ORM
6. **Utils** (`src/utils/`) provide shared functionality (JWT, cookies, formatting)

### Authentication System

- JWT-based authentication with secure HTTP-only cookies
- Password hashing with bcrypt (10 rounds)
- Role-based access control (user/admin roles)
- Cookie configuration varies by environment (secure in production)

### Database Layer

- Uses Drizzle ORM with Neon PostgreSQL serverless driver
- Schema migrations managed through `drizzle-kit`
- Type-safe database operations with full TypeScript support

### Logging Strategy

- Winston logger with structured JSON format
- File-based logging: `logs/error.log` and `logs/combined.log`
- Console logging in development with colorized output
- Request logging via Morgan middleware integrated with Winston

### Code Standards

- ES2022 modules with import/export syntax
- ESLint configuration enforcing:
  - 2-space indentation with switch case indentation
  - Single quotes for strings
  - Semicolons required
  - Prefer const over let, arrow functions over regular functions
  - No unused variables (except those prefixed with underscore)
- Prettier for consistent code formatting
- Unix line endings enforced
