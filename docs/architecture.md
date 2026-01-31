# **Goal of the System**

## purpose:

buld a Task & Project Management System with the following goals:

* User cann register, logon, and manage profiles
* User can create projects and assign tasks
* Task can have statuses, deadlines, priotries
* Notification are sent asynchronously for task events
* System is scalable, decoupled, and resilient

## Tech Stack:

* Backemd: NestJS microservice
* Database: PostgreSQL per service (via Prisma ORM)
* Message Broker: RabbitMQ (async evnets)
* API Gateway: Single entry point
* Containerization: Docker

# High-Level Architecture

```
                   ┌───────────────┐
                   │    Client     │
                   └──────┬────────┘
                          │
                          ▼
                   ┌───────────────┐
                   │ API Gateway   │
                   └──────┬────────┘
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
 ┌─────────────┐  ┌─────────────┐  ┌────────────────┐
 │ Auth Service│  │ User Service│  │ Project Service│
 └─────────────┘  └─────────────┘  └────────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ Task Service│
                   └──────┬──────┘
                          ▼
                   ┌─────────────┐
                   │Notification │
                   │  Service    │
                   └─────────────┘

                   ┌─────────────┐
                   │ RabbitMQ    │
                   └─────────────┘

                   ┌─────────────┐
                   │ PostgreSQL  │
                   │ DB per svc  │
                   └─────────────┘

```

## Legend:

* Client --> Gateway: All requiest go throgh API Gateway
* Gateway --> Services: Synchronous HTTP
* Services --> RabbitMQ --> Notification Service: Async evnets
* Each Service has its own DB --> no shared tables

# Microservice Responsibilites

| Service              | Purpose                                     | Owns                           | Must Not do                   |
| -------------------- | ------------------------------------------- | ------------------------------ | ----------------------------- |
| API Gatway           | Single entry point, routing, JWT validation | routing rules, auth validation | Buisness logic, DB access     |
| Auth ervice          | authentication & JWT                        | credentials, tokens            | user profile, tasks, projects |
| User Service         | user profile management, roels              | user profiles, roles           | authentication, tasks         |
| Project Service      | Project & memberships                       | project info, roles            | tasks, notifications          |
| Task Service         | Task lifecyle management                    | Tasks, assignments, status     | project logic, notifications  |
| Notification Service | Async notification (email, in-app)          | none(creative consumer)        | core task logic, use auth     |

# Communication Patterns

| Flow                 | Type  | When Used                                          |
| -------------------- | ----- | -------------------------------------------------- |
| Client → Gateway    | HTTP  | User-facing requests, need immediate response      |
| Gateway → Services  | HTTP  | Synchronous business calls                         |
| Services → RabbitMQ | Async | Side effects: notifications, logging, search index |
| Services → Services | Async | Event-driven communication for decoupling          |

# Events

|      Event      | Owner Service   | Consumer Service           |
| :-------------: | --------------- | -------------------------- |
|  user.created  | Auth Service    | User Service               |
| project.created | Project Service | Task Service, Notification |
|  task.created  | Task Service    | Notification Service       |
| task.completed | Task Service    | Notification Service       |


# Databases

* Each service has its own database
* DBs are isolated, no shared tables
* Each services is responsible for its own schema and migrations

| Service       | DB Name    |
| ------------- | ---------- |
| Auth          | auth_db    |
| User          | user_db    |
| Project       | project_db |
| Task          | task_db    |
| Notififcaiton | optional   |

# Security Model

* **Authentication**: JWT issued by auth service, verified at Gateway
* **Authorization**: service level permission checks (roles & ownership)
* **service-to-service**: internal network only (docker internal network), no public exposure


# Failure & Resilience

* Gateway: Request timouts, basic retries, rate limiting
* service: validate inputs, handle partial failures gracefully
* Async(RabbitMQ): message retries, dead latter queues, persistent messages

No service mech needed at this stage ─
