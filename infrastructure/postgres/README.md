# 1. Databese Infrastructure

This folder is responisble for database provisioning only for the task management microservice system.

# 2. Core Principles

* Database per service
* Each microservice fully owns its database
* No shared database
* No cross-service joins
* No schema or tables defined here

# 3. Why prisma is not here

* Prisma schema and migration live inside each microservice
* Infrastructure does not manage tables or relations
* Infrastructure ony guarantess that databases exist

| Service              | Database name   |
| -------------------- | --------------- |
| auth-service         | auth_db         |
| user-service         | user_db         |
| project-service      | project_db      |
| task-service         | task_db         |
| notification-service | notification_db |

# 4. Resposibility Split

| Concern           | Owner                 |
| ----------------- | --------------------- |
| Database creation | Infrastructure        |
| Tables & schema   | Prisma(service level) |
| Migrations        | Prisma                |
| Backups           | Infrastructure        |
| Data integrity    | Service level         |
