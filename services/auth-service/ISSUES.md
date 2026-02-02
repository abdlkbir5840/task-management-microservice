# Auth Service - GitHub Issues

**Epic:** Authentication Microservice  
**Service:** auth-service  
**Database:** auth_db  
**Port:** 3001

---

## 📋 Issue Index

### Phase 1: Project Setup (Week 1)
- [Issue #1: Initialize auth-service](#issue-1-initialize-auth-service)
- [Issue #2: Add health endpoint](#issue-2-add-health-endpoint)
- [Issue #3: Install Prisma and setup database](#issue-3-install-prisma-and-setup-database)
- [Issue #4: Define Account and Session models in Prisma](#issue-4-define-account-and-session-models-in-prisma)
- [Issue #5: Run first migration](#issue-5-run-first-migration)
- [Issue #6: Verify schema in pgAdmin](#issue-6-verify-schema-in-pgadmin)
- [Issue #7: Document Prisma setup](#issue-7-document-prisma-setup)
- [Issue #8: Add environment configuration](#issue-8-add-environment-configuration)
- [Issue #9: Setup RabbitMQ client](#issue-9-setup-rabbitmq-client)

### Phase 2: Core Features (Week 1-2)
- [Issue #10: Password hashing and validation](#issue-10-password-hashing-and-validation)
- [Issue #11: Add input validation with DTOs](#issue-11-add-input-validation-with-dtos)
- [Issue #12: Implement JWT token generation](#issue-12-implement-jwt-token-generation)
- [Issue #13: Implement JWT Strategy and Guards](#issue-13-implement-jwt-strategy-and-guards)
- [Issue #14: Implement register endpoint with RabbitMQ event](#issue-14-implement-register-endpoint-with-rabbitmq-event)
- [Issue #15: Implement login endpoint](#issue-15-implement-login-endpoint)

### Phase 3: Session Management (Week 2)
- [Issue #16: Implement token refresh endpoint](#issue-16-implement-token-refresh-endpoint)
- [Issue #17: Implement logout endpoint](#issue-17-implement-logout-endpoint)
- [Issue #18: Implement GET /auth/me endpoint](#issue-18-implement-get-authme-endpoint)

### Phase 4: Infrastructure (Week 2-3)
- [Issue #19: Create Dockerfile](#issue-19-create-dockerfile)
- [Issue #20: Add auth-service to docker-compose](#issue-20-add-auth-service-to-docker-compose)
- [Issue #21: Add global exception filter](#issue-21-add-global-exception-filter)

### Phase 5: Quality & Testing (Week 3)
- [Issue #22: Write unit tests](#issue-22-write-unit-tests)
- [Issue #23: Write integration tests](#issue-23-write-integration-tests)
- [Issue #24: Service documentation and README](#issue-24-service-documentation-and-readme)

---

## Phase 1: Project Setup

### Issue #1: Initialize auth-service

**Labels:** `auth`, `backend`, `setup`, `high-priority`

**Description:**

Create the auth-service project structure using NestJS framework.

**Tasks:**

- [ ] Create `services/auth-service` directory
- [ ] Initialize NestJS project: `nest new auth-service`
- [ ] Install core dependencies
- [ ] Service runs independently on port 3001
- [ ] Environment-based configuration supported

**Commands:**

```bash
cd services
nest new auth-service --skip-git --package-manager npm
cd auth-service
npm install
```

**Acceptance Criteria:**

- [x] Service starts with `npm run start:dev`
- [x] Service stops cleanly
- [x] No errors in console
- [x] No dependencies on other services yet

**Dependencies:** None

---

### Issue #2: Add health endpoint

**Labels:** `auth`, `backend`, `devops`, `high-priority`

**Description:**

Expose `/health` endpoint for monitoring and health checks.

**Tasks:**

- [ ] Create `HealthController` with GET `/health` endpoint
- [ ] Return service status JSON
- [ ] No authentication required

**Implementation:**

```typescript
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'auth-service',
      timestamp: new Date().toISOString(),
    };
  }
}
```

**API Specification:**

```http
GET /health

Response (200 OK):
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2026-02-02T10:00:00Z"
}
```

**Acceptance Criteria:**

- [x] Endpoint accessible without authentication
- [x] Returns 200 OK with JSON response
- [x] Can be used by Docker health checks

**Dependencies:** Issue #1

---

### Issue #3: Install Prisma and setup database

**Labels:** `auth`, `backend`, `prisma`, `database`, `high-priority`

**Description:**

Setup Prisma ORM and connect to PostgreSQL `auth_db` database.

**Tasks:**

- [ ] Install Prisma: `npm install prisma @prisma/client`
- [ ] Initialize Prisma: `npx prisma init`
- [ ] Configure `DATABASE_URL` in `.env`
- [ ] Create `PrismaService` and `PrismaModule`
- [ ] Test database connection

**Commands:**

```bash
npm install prisma @prisma/client
npx prisma init
```

**Environment Variable:**

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db
```

**PrismaService:**

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**Acceptance Criteria:**

- [x] Prisma client can connect to PostgreSQL
- [x] `.env` used for DB credentials
- [x] Connection tested successfully

**Dependencies:** 
- Issue #1
- PostgreSQL `auth_db` created (infrastructure)

---

### Issue #4: Define Account and Session models in Prisma

**Labels:** `auth`, `backend`, `prisma`, `database`, `high-priority`

**Description:**

Define Prisma schema for `Account` and `Session` models.

**Schema:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Account {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Will store hashed password
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions  Session[]
  
  @@map("accounts")
}

model Session {
  id           String   @id @default(uuid())
  accountId    String
  refreshToken String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  
  account Account @relation(fields: [accountId], references: [id], onDelete: Cascade)
  
  @@map("sessions")
}
```

**Acceptance Criteria:**

- [x] Schema matches specification above
- [x] Email is unique
- [x] Sessions have cascade delete
- [x] Proper naming conventions used

**Dependencies:** Issue #3

---

### Issue #5: Run first migration

**Labels:** `auth`, `backend`, `prisma`, `database`, `high-priority`

**Description:**

Create and apply first Prisma migration for Account and Session tables.

**Commands:**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

**Tasks:**

- [ ] Run migration command
- [ ] Verify migration files created in `prisma/migrations/`
- [ ] Generate Prisma Client
- [ ] Verify tables exist in database

**Acceptance Criteria:**

- [x] Migration applied successfully
- [x] Tables exist in `auth_db`
- [x] Migration folder exists: `prisma/migrations/`
- [x] Prisma Client generated

**Dependencies:** Issue #4

---

### Issue #6: Verify schema in pgAdmin

**Labels:** `auth`, `devops`, `postgres`, `medium-priority`

**Description:**

Verify database tables and columns in pgAdmin or psql.

**Commands:**

```bash
# Using psql
docker exec postgres psql -U postgres -d auth_db -c '\dt'
docker exec postgres psql -U postgres -d auth_db -c '\d accounts'
docker exec postgres psql -U postgres -d auth_db -c '\d sessions'
```

**Verification Checklist:**

- [ ] `accounts` table exists
- [ ] `sessions` table exists
- [ ] All columns match Prisma schema
- [ ] Foreign key constraint exists (sessions -> accounts)
- [ ] Unique constraint on email
- [ ] Unique constraint on refreshToken

**Acceptance Criteria:**

- [x] Account table has correct columns
- [x] Session table has correct columns
- [x] Data types match Prisma schema
- [x] Constraints are applied

**Dependencies:** Issue #5

---

### Issue #7: Document Prisma setup

**Labels:** `auth`, `docs`, `prisma`, `low-priority`

**Description:**

Create documentation for Prisma setup, schema, and migration commands.

**Documentation Location:** `services/auth-service/docs/DATABASE.md`

**Content:**

```markdown
# Database Setup

## Schema

- `accounts` - User authentication credentials
- `sessions` - Refresh token sessions

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string

## Commands

- `npx prisma migrate dev` - Create and apply migration
- `npx prisma generate` - Generate Prisma Client
- `npx prisma studio` - Open Prisma Studio GUI
```

**Acceptance Criteria:**

- [x] Documentation file created
- [x] Anyone can run migrations using documented commands
- [x] Schema explained clearly

**Dependencies:** Issue #5

---

### Issue #8: Add environment configuration

**Labels:** `auth`, `backend`, `config`, `high-priority`

**Description:**

Setup environment variables for database, JWT, RabbitMQ, and service port.

**Environment Variables:**

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d
REFRESH_TOKEN_EXPIRATION=30d

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@localhost:5672

# Service
PORT=3001
NODE_ENV=development
```

**Tasks:**

- [ ] Create `.env` file with all variables
- [ ] Create `.env.example` template
- [ ] Install `@nestjs/config`
- [ ] Create `ConfigModule` setup
- [ ] Validate environment variables on startup

**ConfigModule Setup:**

```typescript
ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    PORT: Joi.number().default(3001),
  }),
}),
```

**Acceptance Criteria:**

- [x] No hardcoded secrets in code
- [x] Works in both local and Docker environments
- [x] Config validation fails fast on missing variables

**Dependencies:** Issue #1

---

### Issue #9: Setup RabbitMQ client

**Labels:** `auth`, `backend`, `rabbitmq`, `microservices`, `high-priority`

**Description:**

Configure RabbitMQ connection for publishing authentication events.

**Installation:**

```bash
npm install @nestjs/microservices amqplib amqp-connection-manager
```

**Tasks:**

- [ ] Install RabbitMQ dependencies
- [ ] Create `EventsModule` for RabbitMQ
- [ ] Create `EventEmitterService` for publishing events
- [ ] Configure connection to `auth.events` exchange
- [ ] Test connection

**EventEmitterService:**

```typescript
@Injectable()
export class EventEmitterService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: 'auth_events',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async emit(pattern: string, data: any) {
    return this.client.emit(pattern, data).toPromise();
  }
}
```

**Acceptance Criteria:**

- [x] Successfully connects to RabbitMQ
- [x] Can publish events to `auth.events` exchange
- [x] Connection handles failures gracefully

**Dependencies:** 
- Issue #8
- RabbitMQ running (infrastructure)

---

## Phase 2: Core Features

### Issue #10: Password hashing and validation

**Labels:** `auth`, `backend`, `security`, `high-priority`

**Description:**

Implement secure password hashing using bcrypt.

**Installation:**

```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

**Implementation:**

```typescript
@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

**Acceptance Criteria:**

- [x] Uses bcrypt with salt rounds = 10
- [x] No plain text passwords in DB or logs
- [x] Password comparison works correctly

**Dependencies:** Issue #3

---

### Issue #11: Add input validation with DTOs

**Labels:** `auth`, `backend`, `validation`, `high-priority`

**Description:**

Implement request validation using class-validator and DTOs.

**Installation:**

```bash
npm install class-validator class-transformer
```

**DTOs:**

```typescript
// register.dto.ts
export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain letters and numbers',
  })
  password: string;
}

// login.dto.ts
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

// refresh-token.dto.ts
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
```

**Global Validation Pipe:**

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));
```

**Acceptance Criteria:**

- [x] ValidationPipe enabled globally
- [x] Returns 400 with clear error messages
- [x] Email format validated
- [x] Password requirements enforced

**Dependencies:** Issue #1

---

### Issue #12: Implement JWT token generation

**Labels:** `auth`, `backend`, `security`, `high-priority`

**Description:**

Setup JWT token generation for authentication.

**Installation:**

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install --save-dev @types/passport-jwt
```

**JwtModule Configuration:**

```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },
}),
```

**Token Generation:**

```typescript
@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  generateAccessToken(accountId: string, email: string): string {
    return this.jwtService.sign({
      sub: accountId,
      email,
      type: 'access',
    });
  }

  generateRefreshToken(): string {
    return randomUUID();
  }
}
```

**Acceptance Criteria:**

- [x] JWT contains accountId and email
- [x] Token expiration set from env variable
- [x] Token can be decoded externally
- [x] Refresh tokens are UUIDs

**Dependencies:** Issue #8

---

### Issue #13: Implement JWT Strategy and Guards

**Labels:** `auth`, `backend`, `security`, `high-priority`

**Description:**

Implement Passport JWT strategy and authentication guards.

**JWT Strategy:**

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      accountId: payload.sub,
      email: payload.email,
    };
  }
}
```

**JWT Auth Guard:**

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**Usage:**

```typescript
@UseGuards(JwtAuthGuard)
@Get('me')
async getMe(@Request() req) {
  return req.user;
}
```

**Acceptance Criteria:**

- [x] JwtStrategy validates token signature
- [x] Protected endpoints return 401 without valid JWT
- [x] User data extracted from JWT payload
- [x] Guard can be used with `@UseGuards()`

**Dependencies:** Issue #12

---

### Issue #14: Implement register endpoint with RabbitMQ event

**Labels:** `auth`, `backend`, `feature`, `microservices`, `high-priority`

**Description:**

Create user registration endpoint that publishes event to RabbitMQ.

**Endpoint:** `POST /auth/register`

**Implementation:**

```typescript
@Post('register')
async register(@Body() registerDto: RegisterDto) {
  // 1. Check if email exists
  const exists = await this.prisma.account.findUnique({
    where: { email: registerDto.email },
  });
  
  if (exists) {
    throw new ConflictException('Email already registered');
  }

  // 2. Hash password
  const hashedPassword = await this.passwordService.hash(registerDto.password);

  // 3. Create account
  const account = await this.prisma.account.create({
    data: {
      email: registerDto.email,
      password: hashedPassword,
    },
  });

  // 4. Generate tokens
  const accessToken = this.tokenService.generateAccessToken(account.id, account.email);
  const refreshToken = this.tokenService.generateRefreshToken();

  // 5. Create session
  await this.prisma.session.create({
    data: {
      accountId: account.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // 6. Emit event to RabbitMQ
  await this.eventEmitter.emit('user.registered', {
    userId: account.id,
    email: account.email,
    timestamp: new Date().toISOString(),
  });

  // 7. Return response
  return {
    accessToken,
    refreshToken,
    user: {
      id: account.id,
      email: account.email,
      createdAt: account.createdAt,
    },
  };
}
```

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

**API Specification:**

```http
POST /auth/register
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response (201 Created):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "uuid-refresh-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2026-02-02T10:00:00Z"
  }
}

Error (409 Conflict):
{
  "statusCode": 409,
  "message": "Email already registered",
  "error": "Conflict"
}
```

**Acceptance Criteria:**

- [x] Email uniqueness enforced
- [x] Password hashed before storing
- [x] JWT and refresh token generated
- [x] Session created in database
- [x] Event published to RabbitMQ
- [x] Returns appropriate error for duplicates

**Dependencies:** Issues #4, #9, #10, #11, #12

---

### Issue #15: Implement login endpoint

**Labels:** `auth`, `backend`, `feature`, `high-priority`

**Description:**

Create login endpoint with credential validation.

**Endpoint:** `POST /auth/login`

**Implementation:**

```typescript
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // 1. Find account
  const account = await this.prisma.account.findUnique({
    where: { email: loginDto.email },
  });

  if (!account) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // 2. Verify password
  const isValid = await this.passwordService.compare(
    loginDto.password,
    account.password,
  );

  if (!isValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // 3. Check if account is active
  if (!account.isActive) {
    throw new ForbiddenException('Account is inactive');
  }

  // 4. Generate tokens
  const accessToken = this.tokenService.generateAccessToken(account.id, account.email);
  const refreshToken = this.tokenService.generateRefreshToken();

  // 5. Create session
  await this.prisma.session.create({
    data: {
      accountId: account.id,
      refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // 6. Return response
  return {
    accessToken,
    refreshToken,
    user: {
      id: account.id,
      email: account.email,
    },
  };
}
```

**API Specification:**

```http
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "uuid-refresh-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}

Error (401 Unauthorized):
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}

Error (403 Forbidden):
{
  "statusCode": 403,
  "message": "Account is inactive",
  "error": "Forbidden"
}
```

**Acceptance Criteria:**

- [x] Validates email and password
- [x] Password verified using bcrypt
- [x] Returns 401 for invalid credentials
- [x] Returns 403 for inactive accounts
- [x] Session created on successful login

**Dependencies:** Issues #10, #11, #12

---

## Phase 3: Session Management

### Issue #16: Implement token refresh endpoint

**Labels:** `auth`, `backend`, `feature`, `medium-priority`

**Description:**

Allow users to refresh access tokens using refresh token.

**Endpoint:** `POST /auth/refresh`

**Implementation:**

```typescript
@Post('refresh')
async refresh(@Body() refreshDto: RefreshTokenDto) {
  // 1. Find session
  const session = await this.prisma.session.findUnique({
    where: { refreshToken: refreshDto.refreshToken },
    include: { account: true },
  });

  if (!session) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  // 2. Check expiration
  if (new Date() > session.expiresAt) {
    await this.prisma.session.delete({ where: { id: session.id } });
    throw new UnauthorizedException('Refresh token expired');
  }

  // 3. Generate new access token
  const accessToken = this.tokenService.generateAccessToken(
    session.account.id,
    session.account.email,
  );

  // 4. Optional: Rotate refresh token
  const newRefreshToken = this.tokenService.generateRefreshToken();
  await this.prisma.session.update({
    where: { id: session.id },
    data: {
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
}
```

**API Specification:**

```http
POST /auth/refresh
Content-Type: application/json

Request:
{
  "refreshToken": "uuid-refresh-token"
}

Response (200 OK):
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "new-uuid-refresh-token"
}

Error (401 Unauthorized):
{
  "statusCode": 401,
  "message": "Invalid or expired refresh token",
  "error": "Unauthorized"
}
```

**Acceptance Criteria:**

- [x] Validates refresh token exists
- [x] Checks token expiration
- [x] Generates new access token
- [x] Optionally rotates refresh token
- [x] Returns 401 for invalid tokens

**Dependencies:** Issues #12, #15

---

### Issue #17: Implement logout endpoint

**Labels:** `auth`, `backend`, `feature`, `medium-priority`

**Description:**

Allow users to logout and invalidate refresh token.

**Endpoint:** `POST /auth/logout`

**Implementation:**

```typescript
@Post('logout')
async logout(@Body() refreshDto: RefreshTokenDto) {
  // Delete session
  await this.prisma.session.deleteMany({
    where: { refreshToken: refreshDto.refreshToken },
  });

  return { message: 'Logged out successfully' };
}

@Post('logout-all')
@UseGuards(JwtAuthGuard)
async logoutAll(@Request() req) {
  // Delete all sessions for user
  await this.prisma.session.deleteMany({
    where: { accountId: req.user.accountId },
  });

  return { message: 'Logged out from all devices' };
}
```

**API Specification:**

```http
POST /auth/logout
Content-Type: application/json

Request:
{
  "refreshToken": "uuid-refresh-token"
}

Response (200 OK):
{
  "message": "Logged out successfully"
}

POST /auth/logout-all
Authorization: Bearer <access-token>

Response (200 OK):
{
  "message": "Logged out from all devices"
}
```

**Acceptance Criteria:**

- [x] Deletes session from database
- [x] Returns success message
- [x] Logout-all endpoint requires JWT
- [x] Logout-all deletes all user sessions

**Dependencies:** Issues #13, #15

---

### Issue #18: Implement GET /auth/me endpoint

**Labels:** `auth`, `backend`, `feature`, `medium-priority`

**Description:**

Protected endpoint to get current authenticated user information.

**Endpoint:** `GET /auth/me`

**Implementation:**

```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
async getMe(@Request() req) {
  const account = await this.prisma.account.findUnique({
    where: { id: req.user.accountId },
    select: {
      id: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!account) {
    throw new NotFoundException('Account not found');
  }

  return account;
}
```

**API Specification:**

```http
GET /auth/me
Authorization: Bearer <access-token>

Response (200 OK):
{
  "id": "uuid",
  "email": "user@example.com",
  "isActive": true,
  "createdAt": "2026-02-02T10:00:00Z",
  "updatedAt": "2026-02-02T10:00:00Z"
}

Error (401 Unauthorized):
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Acceptance Criteria:**

- [x] Requires valid JWT token
- [x] Returns user information
- [x] Does not include password
- [x] Returns 401 without token

**Dependencies:** Issue #13

---

## Phase 4: Infrastructure

### Issue #19: Create Dockerfile

**Labels:** `auth`, `devops`, `docker`, `medium-priority`

**Description:**

Create multi-stage Dockerfile for production builds.

**Dockerfile:**

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 3001

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
```

**.dockerignore:**

```
node_modules
dist
.env
.git
*.md
.vscode
coverage
```

**Acceptance Criteria:**

- [x] Multi-stage build for smaller image
- [x] Runs Prisma migrations on startup
- [x] Exposes port 3001
- [x] .dockerignore excludes unnecessary files

**Dependencies:** All previous issues

---

### Issue #20: Add auth-service to docker-compose

**Labels:** `auth`, `devops`, `docker`, `high-priority`

**Description:**

Integrate auth-service into root docker-compose.yml.

**Docker Compose Configuration:**

```yaml
auth-service:
  build:
    context: ./services/auth-service
    dockerfile: Dockerfile
  container_name: auth-service
  restart: unless-stopped
  env_file:
    - services/auth-service/.env
  environment:
    DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/auth_db
    RABBITMQ_URL: amqp://${RABBITMQ_DEFAULT_USER}:${RABBITMQ_DEFAULT_PASS}@rabbitmq:5672
    JWT_SECRET: ${JWT_SECRET}
    PORT: 3001
  ports:
    - "3001:3001"
  networks:
    - task_management_network
  depends_on:
    postgres:
      condition: service_healthy
    rabbitmq:
      condition: service_healthy
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

**Acceptance Criteria:**

- [x] Service starts with docker-compose up
- [x] Waits for postgres and rabbitmq to be healthy
- [x] Health check configured
- [x] Accessible on port 3001

**Dependencies:** Issue #19

---

### Issue #21: Add global exception filter

**Labels:** `auth`, `backend`, `error-handling`, `medium-priority`

**Description:**

Implement global exception filter for standardized error responses.

**Implementation:**

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      statusCode: status,
      message: typeof message === 'object' ? message['message'] : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

**Usage:**

```typescript
app.useGlobalFilters(new AllExceptionsFilter());
```

**Error Response Format:**

```json
{
  "statusCode": 400,
  "message": ["email must be valid", "password too short"],
  "timestamp": "2026-02-02T10:00:00Z",
  "path": "/auth/register"
}
```

**Acceptance Criteria:**

- [x] Catches all exceptions
- [x] Returns standardized error format
- [x] Logs errors appropriately
- [x] Handles validation errors

**Dependencies:** Issue #1

---

## Phase 5: Quality & Testing

### Issue #22: Write unit tests

**Labels:** `auth`, `testing`, `medium-priority`

**Description:**

Write unit tests for auth service components.

**Test Coverage:**

```typescript
describe('AuthService', () => {
  it('should register a new user', async () => { ... });
  it('should reject duplicate email', async () => { ... });
  it('should hash password before saving', async () => { ... });
  it('should login with valid credentials', async () => { ... });
  it('should reject invalid password', async () => { ... });
  it('should generate valid JWT token', async () => { ... });
  it('should refresh access token', async () => { ... });
  it('should logout and delete session', async () => { ... });
});

describe('PasswordService', () => {
  it('should hash password', async () => { ... });
  it('should compare password correctly', async () => { ... });
});

describe('TokenService', () => {
  it('should generate access token', () => { ... });
  it('should generate refresh token', () => { ... });
});
```

**Commands:**

```bash
npm run test
npm run test:cov
```

**Acceptance Criteria:**

- [x] Unit tests for all services
- [x] Mock database connections
- [x] Mock RabbitMQ connections
- [x] Test coverage > 80%

**Dependencies:** All feature issues

---

### Issue #23: Write integration tests

**Labels:** `auth`, `testing`, `low-priority`

**Description:**

Write E2E integration tests for API endpoints.

**Test Suite:**

```typescript
describe('AuthController (e2e)', () => {
  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'Test1234' })
      .expect(201);
  });

  it('/auth/login (POST)', () => { ... });
  it('/auth/refresh (POST)', () => { ... });
  it('/auth/logout (POST)', () => { ... });
  it('/auth/me (GET)', () => { ... });
});
```

**Commands:**

```bash
npm run test:e2e
```

**Acceptance Criteria:**

- [x] E2E tests for all endpoints
- [x] Test database setup/teardown
- [x] All tests pass

**Dependencies:** All feature issues

---

### Issue #24: Service documentation and README

**Labels:** `auth`, `docs`, `low-priority`

**Description:**

Create comprehensive README for auth-service.

**README Structure:**

```markdown
# Auth Service

## Overview
Authentication microservice for task management platform.

## Features
- User registration
- JWT authentication
- Refresh token rotation
- Event-driven architecture

## API Endpoints
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- GET /auth/me
- GET /health

## Environment Variables
[List all variables]

## Setup
[Installation instructions]

## Running
[Development and production commands]

## Testing
[Test commands]

## Docker
[Docker build and run commands]
```

**Acceptance Criteria:**

- [x] Complete README created
- [x] All endpoints documented
- [x] Setup instructions clear
- [x] Any developer can run service

**Dependencies:** All issues

---

## 📊 Issue Summary

**Total Issues:** 24  
**High Priority:** 12  
**Medium Priority:** 8  
**Low Priority:** 4

**Estimated Timeline:**
- **Week 1:** Issues #1-9 (Setup + Infrastructure)
- **Week 2:** Issues #10-18 (Core Features + Session Management)
- **Week 3:** Issues #19-24 (Docker + Testing + Docs)

**Build Order:**
1. Setup (Issues #1-9)
2. Core Auth (Issues #10-15)
3. Sessions (Issues #16-18)
4. Infrastructure (Issues #19-21)
5. Quality (Issues #22-24)

---

## 🎯 Getting Started

1. Copy each issue to GitHub
2. Assign labels and milestones
3. Start with Issue #1
4. Work through issues sequentially
5. Mark as done when acceptance criteria met

---

**Last Updated:** February 2, 2026
