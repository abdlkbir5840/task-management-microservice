# 1. Rules

1. Each service owns its data
2. No service reads another service's DB
3. Only the owner emits events about its data
4. Other services react, never command
5. Synchonous calls are for user actions
6. Asynchronous evnets are for side effects

# 2. Service Ownership

## Auth Service

### Responsibility

* Authentication
* JWT issuing
* Credential validation

### Owns

* Credentials
* Password hashes
* Refresh tokens

### Does Not

* Store user profiles
* Store tasks or projects

### Emits Events

| Event               | Description              |
| ------------------- | ------------------------ |
| auth.user_registred | A new user has registred |

## User Service

### Responsibility

* User profile
* Roles & preferences

### Owns

* User profile(name, email, avatar, ..)
* Roles (admin, member, ..)

### Owns

| Event                | From         | Purpose             |
| -------------------- | ------------ | ------------------- |
| Aiuth.user_registred | Auth Service | Create user profile |

### Emits Events

| Event               | Description          |
| ------------------- | -------------------- |
| user.profile_update | User updated profile |

## Project Service

### Responsibility

* Projects
* Memeberships
* Roles inside projects

### Owns

* Projects
* Project members
* Permission inside project

### Does Not

* Own task

### Emits Events

| Event                | Description           |
| -------------------- | --------------------- |
| project.created      | New project created   |
| project.member_added | User added to project |

## Task Service

### Responsibility

* Task lifecycle

### Does Not

* Tasks
* Status
* Assignment
* Deadlines

### Consumes Events

| Event                | From            | Purpose             |
| -------------------- | --------------- | ------------------- |
| project.created      | Projecr Service | Allow task creation |
| project.member_added | Project Service | Validate assignees  |

### Emits Events

| Event          | Description      |
| -------------- | ---------------- |
| task.created   | New task created |
| task.updated   | task updated     |
| task.completed | task completed   |

## Notification Service

### Responsibility

* Notifications (email, in-app, push)

### Owns

* Notification records (optional)

### Consumes Events

| Event                | From            |
| -------------------- | --------------- |
| task.created         | Task Service    |
| task.completed       | task service    |
| project.member_added | project service |

### Does Not

* Expose buisness APIs
* Call other services synchonously

# 3. Communication Matrix

| From                   |    To    | Type  | Why            |
| :--------------------- | :------: | ----- | -------------- |
| Client                 | Gateway | HTTP  | Entry point    |
| Gateway                | Service | HTTP  | User requests  |
| Auth -> User           | RabbitMQ | Async | Loose coupling |
| Project -> Task        | RabbitMQ | Async | Decoupled      |
| Task -> Notification   | RabbitMQ | Async | Side effect    |
| Notification -> Others |    X    | None  | one way only   |

# 4. Event Design Rules

## Event Shape

```
Event_name
event_version
titmestamp
producer
payload
```

## Example

```
task.created
{
taskId
projectId
assignedId
createdBy
}
```
