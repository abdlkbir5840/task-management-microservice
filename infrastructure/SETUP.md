# Infrastructure Setup Guide

## First Time Setup

After cloning this repository, you need to create your local environment files:

### 1. PostgreSQL Environment

```bash
cd infrastructure/postgres
cp .env.postgres.example .env.postgres
```

Edit `.env.postgres` and update credentials if needed (defaults are fine for development).

### 2. RabbitMQ Environment

```bash
cd infrastructure/rabbitmq
cp .env.rabbitmq.example .env.rabbitmq
```

Edit `.env.rabbitmq` and update credentials if needed (defaults are fine for development).

### 3. Infrastructure Environment

```bash
cd infrastructure/docker
cp .env.infra.example .env.infra
```

This file contains shared Docker configuration. Defaults are fine for development.

## Starting Infrastructure

### Start PostgreSQL

```bash
cd infrastructure/postgres
docker-compose -f docker-compose.postgres.yml up -d
```

Verify databases:
```bash
docker exec postgres psql -U postgres -c '\l'
```

Should show: `auth_db`, `user_db`, `project_db`, `task_db`, `notification_db`

### Start RabbitMQ

```bash
cd infrastructure/rabbitmq
docker-compose -f docker-compose.rabbitmq.yml up -d
```

Access management UI: http://localhost:15672
- Username: `admin` (from .env.rabbitmq)
- Password: `admin` (from .env.rabbitmq)

## Stopping Infrastructure

```bash
# PostgreSQL
cd infrastructure/postgres
docker-compose -f docker-compose.postgres.yml down

# RabbitMQ
cd infrastructure/rabbitmq
docker-compose -f docker-compose.rabbitmq.yml down
```

## Clean Slate (Remove All Data)

```bash
# Stop and remove volumes
cd infrastructure/postgres
docker-compose -f docker-compose.postgres.yml down -v

cd ../rabbitmq
docker-compose -f docker-compose.rabbitmq.yml down -v
```

⚠️ **WARNING:** This deletes all data in databases and message queues!

## Security Notes

- ✅ `.env` files are **gitignored** - never commit them
- ✅ `.env.example` files are **committed** - use as templates
- ⚠️ **Change default passwords** for production deployments
- ⚠️ **Never commit real credentials** to version control

## Troubleshooting

### Issue: Port already in use

**PostgreSQL (5432):**
```bash
lsof -ti:5432 | xargs kill -9
```

**RabbitMQ (5672, 15672):**
```bash
lsof -ti:5672 | xargs kill -9
lsof -ti:15672 | xargs kill -9
```

### Issue: Databases not created

```bash
# Remove volume and restart
cd infrastructure/postgres
docker-compose -f docker-compose.postgres.yml down -v
docker-compose -f docker-compose.postgres.yml up -d
```

### Issue: Can't connect to RabbitMQ

Check logs:
```bash
docker logs task-mgmt-rabbitmq
```

Verify health:
```bash
docker exec task-mgmt-rabbitmq rabbitmq-diagnostics ping
```
