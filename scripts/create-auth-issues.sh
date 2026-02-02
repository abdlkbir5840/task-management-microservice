#!/bin/bash

# Script to create all auth-service GitHub issues
# Usage: chmod +x scripts/create-auth-issues.sh && ./scripts/create-auth-issues.sh

set -e

echo "🚀 Creating Auth Service Issues..."
echo "=================================="
echo ""

# Counter for progress
ISSUE_NUM=1
TOTAL_ISSUES=24

create_issue() {
    echo "[$ISSUE_NUM/$TOTAL_ISSUES] Creating: $1"
    ((ISSUE_NUM++))
}

# ============================================
# PHASE 1: PROJECT SETUP
# ============================================

create_issue "Initialize auth-service"
gh issue create --title "Initialize auth-service" --label "auth,backend,setup,high-priority" --body - <<'EOF'
Create the auth-service project structure using NestJS framework.

**Tasks:**
- [ ] Create `services/auth-service` directory
- [ ] Initialize NestJS project
- [ ] Install core dependencies
- [ ] Service runs on port 3001

**Commands:**
```bash
cd services
nest new auth-service --skip-git --package-manager npm
cd auth-service
npm install
```
EOF

create_issue "Add health endpoint"
gh issue create --title "Add health endpoint" --label "auth,backend,devops,high-priority" --body - <<'EOF'
Expose `/health` endpoint for monitoring and health checks.

**Tasks:**
- [ ] Create `HealthController` with GET `/health` endpoint
- [ ] Return service status JSON
- [ ] No authentication required

**API:**
```http
GET /health
Response: { "status": "ok", "service": "auth-service", "timestamp": "..." }
```
EOF

create_issue "Install Prisma and setup database"
gh issue create --title "Install Prisma and setup database" --label "auth,backend,prisma,database,high-priority" --body - <<'EOF'
Setup Prisma ORM and connect to PostgreSQL `auth_db` database.

**Tasks:**
- [ ] Install Prisma: `npm install prisma @prisma/client`
- [ ] Initialize: `npx prisma init`
- [ ] Configure `DATABASE_URL` in `.env`
- [ ] Create `PrismaService` and `PrismaModule`
- [ ] Test database connection

**Environment:**
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db
```
EOF

create_issue "Define Account and Session models"
gh issue create --title "Define Account and Session models in Prisma" --label "auth,backend,prisma,database,high-priority" --body - <<'EOF'
Define Prisma schema for `Account` and `Session` models.

**Models:**
- **Account**: id, email (unique), password (hashed), isActive, createdAt, updatedAt
- **Session**: id, accountId, refreshToken (unique), expiresAt, createdAt

**Requirements:**
- [ ] Email must be unique
- [ ] Sessions have cascade delete on account
- [ ] Use proper naming conventions (@map)
EOF

create_issue "Run first migration"
gh issue create --title "Run first migration" --label "auth,backend,prisma,database,high-priority" --body - <<'EOF'
Create and apply first Prisma migration for Account and Session tables.

**Commands:**
```bash
npx prisma migrate dev --name init
npx prisma generate
```

**Verify:**
- [ ] Migration files created in `prisma/migrations/`
- [ ] Tables exist in `auth_db`
- [ ] Prisma Client generated
EOF

create_issue "Verify schema in database"
gh issue create --title "Verify schema in pgAdmin" --label "auth,devops,postgres,medium-priority" --body - <<'EOF'
Verify database tables and columns using psql or pgAdmin.

**Verification:**
```bash
docker exec postgres psql -U postgres -d auth_db -c '\dt'
docker exec postgres psql -U postgres -d auth_db -c '\d accounts'
docker exec postgres psql -U postgres -d auth_db -c '\d sessions'
```

**Check:**
- [ ] Tables exist with correct columns
- [ ] Foreign key constraint (sessions -> accounts)
- [ ] Unique constraints on email and refreshToken
EOF

create_issue "Document Prisma setup"
gh issue create --title "Document Prisma setup" --label "auth,docs,prisma,low-priority" --body - <<'EOF'
Create documentation for Prisma setup, schema, and migration commands.

**Location:** `services/auth-service/docs/DATABASE.md`

**Include:**
- Schema overview (accounts, sessions)
- Environment variables
- Migration commands
- Prisma Studio usage
EOF

create_issue "Add environment configuration"
gh issue create --title "Add environment configuration" --label "auth,backend,config,high-priority" --body - <<'EOF'
Setup environment variables for database, JWT, RabbitMQ, and service port.

**Variables:**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
REFRESH_TOKEN_EXPIRATION=30d
RABBITMQ_URL=amqp://admin:admin@localhost:5672
PORT=3001
NODE_ENV=development
```

**Tasks:**
- [ ] Create `.env` file
- [ ] Create `.env.example` template
- [ ] Install `@nestjs/config`
- [ ] Setup ConfigModule with validation
EOF

create_issue "Setup RabbitMQ client"
gh issue create --title "Setup RabbitMQ client" --label "auth,backend,rabbitmq,microservices,high-priority" --body - <<'EOF'
Configure RabbitMQ connection for publishing authentication events.

**Installation:**
```bash
npm install @nestjs/microservices amqplib amqp-connection-manager
```

**Tasks:**
- [ ] Create `EventsModule` for RabbitMQ
- [ ] Create `EventEmitterService` for publishing
- [ ] Configure connection to `auth.events` exchange
- [ ] Test connection
EOF

# ============================================
# PHASE 2: CORE FEATURES
# ============================================

create_issue "Password hashing and validation"
gh issue create --title "Password hashing and validation" --label "auth,backend,security,high-priority" --body - <<'EOF'
Implement secure password hashing using bcrypt.

**Installation:**
```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

**Tasks:**
- [ ] Create `PasswordService`
- [ ] Implement hash() method with salt rounds = 10
- [ ] Implement compare() method
- [ ] Never log plain text passwords
EOF

create_issue "Add input validation with DTOs"
gh issue create --title "Add input validation with DTOs" --label "auth,backend,validation,high-priority" --body - <<'EOF'
Implement request validation using class-validator and DTOs.

**Installation:**
```bash
npm install class-validator class-transformer
```

**DTOs to create:**
- [ ] `RegisterDto` (email, password with min 8 chars)
- [ ] `LoginDto` (email, password)
- [ ] `RefreshTokenDto` (refreshToken)

**Global Validation:**
Enable ValidationPipe globally with whitelist and transform options.
EOF

create_issue "Implement JWT token generation"
gh issue create --title "Implement JWT token generation" --label "auth,backend,security,high-priority" --body - <<'EOF'
Setup JWT token generation for authentication.

**Installation:**
```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install --save-dev @types/passport-jwt
```

**Tasks:**
- [ ] Configure JwtModule with secret and expiration
- [ ] Create `TokenService`
- [ ] Implement generateAccessToken() method
- [ ] Implement generateRefreshToken() method (UUID)
EOF

create_issue "Implement JWT Strategy and Guards"
gh issue create --title "Implement JWT Strategy and Guards" --label "auth,backend,security,high-priority" --body - <<'EOF'
Implement Passport JWT strategy and authentication guards.

**Tasks:**
- [ ] Create `JwtStrategy` extending PassportStrategy
- [ ] Extract JWT from Authorization header
- [ ] Validate token and return user payload
- [ ] Create `JwtAuthGuard` extending AuthGuard('jwt')
- [ ] Test with protected endpoint
EOF

create_issue "Implement register endpoint"
gh issue create --title "Implement register endpoint with RabbitMQ event" --label "auth,backend,feature,microservices,high-priority" --body - <<'EOF'
Create user registration endpoint that publishes event to RabbitMQ.

**Endpoint:** `POST /auth/register`

**Flow:**
1. Check if email exists (return 409 if duplicate)
2. Hash password using bcrypt
3. Create account in database
4. Generate JWT access token and refresh token
5. Create session with refresh token
6. Emit `user.registered` event to RabbitMQ
7. Return tokens and user info

**RabbitMQ Event:**
```json
{
  "pattern": "user.registered",
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "timestamp": "2026-02-02T10:00:00Z"
  }
}
```
EOF

create_issue "Implement login endpoint"
gh issue create --title "Implement login endpoint" --label "auth,backend,feature,high-priority" --body - <<'EOF'
Create login endpoint with credential validation.

**Endpoint:** `POST /auth/login`

**Flow:**
1. Find account by email
2. Verify password using bcrypt (return 401 if invalid)
3. Check if account is active (return 403 if inactive)
4. Generate JWT and refresh token
5. Create session
6. Return tokens and user info

**Error Codes:**
- 401 Unauthorized: Invalid credentials
- 403 Forbidden: Account inactive
EOF

# ============================================
# PHASE 3: SESSION MANAGEMENT
# ============================================

create_issue "Implement token refresh"
gh issue create --title "Implement token refresh endpoint" --label "auth,backend,feature,medium-priority" --body - <<'EOF'
Allow users to refresh access tokens using refresh token.

**Endpoint:** `POST /auth/refresh`

**Flow:**
1. Find session by refresh token
2. Check expiration (delete and return 401 if expired)
3. Generate new access token
4. Optionally rotate refresh token
5. Update session in database
6. Return new tokens
EOF

create_issue "Implement logout"
gh issue create --title "Implement logout endpoint" --label "auth,backend,feature,medium-priority" --body - <<'EOF'
Allow users to logout and invalidate refresh token.

**Endpoints:**
- `POST /auth/logout` - Logout from current session
- `POST /auth/logout-all` - Logout from all sessions (requires JWT)

**Tasks:**
- [ ] Delete session by refresh token
- [ ] Delete all sessions for user (logout-all)
- [ ] Return success message
EOF

create_issue "Implement GET /auth/me"
gh issue create --title "Implement GET /auth/me endpoint" --label "auth,backend,feature,medium-priority" --body - <<'EOF'
Protected endpoint to get current authenticated user information.

**Endpoint:** `GET /auth/me`

**Requirements:**
- [ ] Requires valid JWT token (use JwtAuthGuard)
- [ ] Returns user info (id, email, isActive, createdAt, updatedAt)
- [ ] Never return password field
- [ ] Return 401 if no token or invalid token
EOF

# ============================================
# PHASE 4: INFRASTRUCTURE
# ============================================

create_issue "Create Dockerfile"
gh issue create --title "Create Dockerfile" --label "auth,devops,docker,medium-priority" --body - <<'EOF'
Create multi-stage Dockerfile for production builds.

**Requirements:**
- [ ] Use multi-stage build (builder + production)
- [ ] Node 18 Alpine base image
- [ ] Generate Prisma Client in build stage
- [ ] Run `prisma migrate deploy` on startup
- [ ] Expose port 3001
- [ ] Create `.dockerignore` file

**Exclude from Docker:**
- node_modules
- dist
- .env
- .git
- coverage
EOF

create_issue "Add to docker-compose"
gh issue create --title "Add auth-service to docker-compose" --label "auth,devops,docker,high-priority" --body - <<'EOF'
Integrate auth-service into root docker-compose.yml.

**Configuration:**
- [ ] Build from `./services/auth-service`
- [ ] Map port 3001:3001
- [ ] Connect to `task_management_network`
- [ ] Depend on postgres and rabbitmq (wait for healthy)
- [ ] Add health check using `/health` endpoint
- [ ] Use environment variables from root `.env`
EOF

create_issue "Add global exception filter"
gh issue create --title "Add global exception filter" --label "auth,backend,error-handling,medium-priority" --body - <<'EOF'
Implement global exception filter for standardized error responses.

**Tasks:**
- [ ] Create `AllExceptionsFilter` implementing ExceptionFilter
- [ ] Catch all exceptions
- [ ] Return standardized JSON format
- [ ] Log errors appropriately
- [ ] Handle validation errors from class-validator

**Error Format:**
```json
{
  "statusCode": 400,
  "message": ["error1", "error2"],
  "timestamp": "2026-02-02T10:00:00Z",
  "path": "/auth/register"
}
```
EOF

# ============================================
# PHASE 5: QUALITY & TESTING
# ============================================

create_issue "Write unit tests"
gh issue create --title "Write unit tests" --label "auth,testing,medium-priority" --body - <<'EOF'
Write unit tests for auth service components.

**Test Coverage:**
- AuthService (register, login, refresh, logout)
- PasswordService (hash, compare)
- TokenService (generate tokens)

**Requirements:**
- [ ] Mock database connections
- [ ] Mock RabbitMQ connections
- [ ] Test coverage > 80%
- [ ] Run with: `npm run test` and `npm run test:cov`
EOF

create_issue "Write integration tests"
gh issue create --title "Write integration tests" --label "auth,testing,low-priority" --body - <<'EOF'
Write E2E integration tests for API endpoints.

**Test All Endpoints:**
- GET /health
- POST /auth/register (success, duplicate, validation)
- POST /auth/login (success, invalid, inactive)
- POST /auth/refresh (valid, expired, invalid)
- POST /auth/logout
- GET /auth/me

**Requirements:**
- [ ] Test database setup/teardown
- [ ] All tests pass
- [ ] Run with: `npm run test:e2e`
EOF

create_issue "Service documentation"
gh issue create --title "Service documentation and README" --label "auth,docs,low-priority" --body - <<'EOF'
Create comprehensive README for auth-service.

**Include:**
- Overview and features
- All API endpoints documented
- Environment variables list
- Setup and installation instructions
- Development and production commands
- Testing instructions
- Docker build and run
- Database schema overview
- RabbitMQ events published

**Location:** `services/auth-service/README.md`
EOF

echo ""
echo "=================================="
echo "✅ All $TOTAL_ISSUES auth-service issues created!"
echo ""
echo "View at: https://github.com/abdlkbir5840/task-management-microservice/issues"
echo ""
