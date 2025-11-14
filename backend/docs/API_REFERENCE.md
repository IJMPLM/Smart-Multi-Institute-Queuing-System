# Smart Multi-Institute Queuing System
## Backend API Reference

All backend APIs follow REST conventions and exchange data in JSON format.  
The base URL is:

```
http://<server-ip>:<port>/api
```

---

## Authentication

Routes requiring authentication use JSON Web Tokens (JWT). The token must be included in the header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Standard Response Format

Successful response:
```json
{
  "status": "success",
  "data": {},
  "message": "Optional success message"
}
```

Error response:
```json
{
  "status": "error",
  "message": "Description of the error"
}
```

---

## Applicant Endpoints

| Method | Endpoint | Description | Auth | Example Request | Example Response |
|--------|----------|-------------|------|------------------|------------------|
| POST | /applicant/message | Sends message to chatbot handler for intent detection or guidance | No | `{ "message": "I want to apply", "type": "open" }` | `{ "message": "Which service would you like to apply for?", "choices": ["Registrar", "Guidance", "Admission"] }` |
| GET | /applicant/services | Retrieves available services | No | — | `{ "services": [{ "id": "svc-001", "name": "Registrar" }] }` |
| POST | /applicant/form | Submits form entries for validation | Yes | `{ "sessionId": "sess-101", "entries": [] }` | `{ "message": "Form validated successfully." }` |
| POST | /applicant/join-queue | Adds applicant to queue | Yes | `{ "serviceId": "svc-001", "sessionId": "sess-101" }` | `{ "queueNumber": 12, "eta": 8 }` |
| GET | /applicant/queue/:id | Retrieves queue position | Yes | — | `{ "queueNumber": 12, "position": 3, "status": "waiting" }` |
| GET | /applicant/history | Fetches past queue sessions | Yes | — | `[ { "service": "Registrar", "status": "completed" } ]` |

---

## Counter Endpoints

| Method | Endpoint | Description | Auth | Example Response |
|--------|----------|-------------|------|------------------|
| POST | /counter/start | Activates a counter station | Yes | `{ "status": "active", "counterId": "C01" }` |
| PUT | /counter/update | Updates current ticket being served | Yes | `{ "message": "Serving ticket 15" }` |
| POST | /counter/process | Marks a ticket as processing | Yes | `{ "message": "Ticket 15 is now in process." }` |
| POST | /counter/complete | Marks a ticket as completed | Yes | `{ "message": "Ticket 15 completed." }` |
| POST | /counter/missing | Marks a ticket as no-show | Yes | `{ "message": "Ticket 16 marked as missing." }` |
| POST | /counter/transfer | Transfers a ticket | Yes | `{ "message": "Ticket 16 transferred to Counter 3." }` |
| POST | /counter/shutdown | Deactivates counter | Yes | `{ "status": "inactive" }` |

---

## Administrator Endpoints

| Method | Endpoint | Description | Example Response |
|--------|----------|-------------|------------------|
| GET | /admin/dashboard | Retrieves system summary | `{ "activeCounters": 5, "queues": 3 }` |
| POST | /admin/freeze | Freezes all queue activity | `{ "message": "Queues frozen successfully." }` |
| POST | /admin/resume | Resumes queue operations | `{ "message": "Queues resumed." }` |
| POST | /admin/broadcast | Sends message to all clients | `{ "message": "System maintenance at 5 PM" }` |
| GET | /admin/audit | Retrieves audit logs | `[ { "user": "admin01", "action": "freeze_all" } ]` |

---

## Database Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /db/createApplicant | Creates an applicant record |
| GET | /db/readApplicant/:id | Retrieves applicant data |
| PUT | /db/updateApplicant | Updates applicant record |
| DELETE | /db/deleteApplicant/:id | Deletes applicant record |
| GET | /db/queue | Lists queue entries |
| GET | /db/counters | Lists counters and statuses |

---

## WebSocket Events

| Event | Description | Payload Example |
|--------|-------------|-----------------|
| queue:update | Queue state updates | `{ "service": "Registrar", "currentTicket": 12 }` |
| counter:status | Counter activity changes | `{ "counterId": "C01", "status": "active" }` |
| admin:broadcast | Administrator announcements | `{ "message": "System maintenance at 5 PM" }` |

---

## Version
Version 1.0 — November 2025
