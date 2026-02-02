# 1. Docker Infrastructure

this folder contains runtime Docker infrastructure configuration shared by all microservices.

# 2. Responsibility

* Define shared environment variables for infrastructure components
* Document Docker networks used for service communication
* Define persistent volumes for stateful services

# 3. What Docker solves here

* Local and production parity
* Service isolation
* Built-in service discorvery via docker DNS
* Easy startup of infrastrcuture dependencies

# 4. What Docker does not do

* No buisness logic
* No service configuration
* No prisma schema or migration

# 5. Networking

* All containers run inside a single Docker network
* Services dsicover each other by container name

# 6. Environmet Variables

* Infrastructure environment variables live in `docker/env`
* Service specific variables live inside each service
