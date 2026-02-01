# Purpose of API Gateway

* Single entry point for all client request
* Handles routing to the correct microservice
* Handles authentication (jwt verification)
* Handles authorization (optional role check)
* Handles corss-cutting concerns: logging, rate limiting, CORS, error responses

the gateway it dosn't contain buisness logic, it only routes and validate requests

# High Level Route Structure

* `/auth/**`  --> Auth service (login, registration, token refresh)
* `/users/**`  --> User service (profile, roles)
* `/projects/**`  --> project service (prjects, memberships)
* `/tasks/**`  --> task service (create, assign, status)
* `/notifications/**`  --> notification service (read notification, settings)

# Route Responsibilites

## Auth Handling:

* Gateway verifies JWT for all protected routes
* Extracts userId and roles form token
* Pass token or user context to downstream service

## Auth Handling:

* Gateway standardizes error responses (status code, JSON body)
* Handles 401, 403, 403, 500 consistently

## Routing Patterns:

### 1. Synchronous HTTP:

* Used for requests where client expects immediate response
* Examples: `/auth/login`, `/projects`, /tasks/:id
* Gateway simple proxies the request to the correct service

### 2. Asynchronous Messaging:

* Not exposed directly to client
* Used internally for events, e.g, task.created, task.completed
* Gateway does not handle RabbitMQ messages, it only triggers service actions that may emit events

# Gateway Rules & Policies

* JWT required on all `/users`, `/projects`, `/tasks`, `/notifications`
* Public access only on `/auth` routes
* Rate limiting: per user or IP, e.g 100 request/min
* Timouts: e.g 5 seconds per downstream service call
* Retries: only for idemoptent requests if desired
* Fail-fast: return error immediately if downstream service is unavailable
* Circuite breaker: can support circuit nreaker pattern for resilience
