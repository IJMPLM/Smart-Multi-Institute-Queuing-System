# Smart Multi-Institute Queuing System – Backend
## Overview

The backend of the Smart Multi-Institute Queuing System provides the core application logic, API endpoints, authentication mechanisms, queue handling, and real-time communication for applicants, counters, and administrators within a secured local area network environment.

This system manages:
- Applicant interactions and guided form submissions
- Queue creation, assignment, and monitoring
- Counter operations for serving and managing applicants
- Administrative supervision and overrides
- Real-time updates through WebSocket communication
- Database operations using PostgreSQL with JSONB fields

---

## Technology Stack

| Component | Technology |
|----------|------------|
| Runtime Environment | Node.js |
| Backend Framework | Express or Fastify |
| Database | PostgreSQL (JSONB for form/entry structures) |
| Real-Time Communication | Socket.IO (WebSocket) |
| Caching and Pub/Sub | Redis |
| Reverse Proxy and SSL | NGINX |
| Containerization (optional) | Docker |

---

## Folder Structure

```
backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── db/
│   └── utils/
├── public/
├── docs/
└── package.json
```

Each directory has the following responsibilities:

- **controllers/** – Contains logic for handling incoming API requests  
- **routes/** – Defines available API endpoints  
- **models/** – Database schema definitions and helper structures  
- **middleware/** – Authentication, validation, and error-handling layers  
- **db/** – PostgreSQL connections and SQL utilities  
- **utils/** – Helper functions and shared modules  

---

## Setup and Installation

### Prerequisites
- Node.js (v18 or above)
- PostgreSQL (v14 or above)
- Redis (optional but recommended)
- NPM or Yarn

### Installation Steps

1. Install dependencies:
```
npm install
```

2. Create an `.env` file with the following variables:
```
PORT=4000
DB_URL=postgresql://username:password@localhost:5432/queue_system
JWT_SECRET=your_jwt_secret
```

3. Start the development server:
```
npm run dev
```

4. Access the backend API at:
```
http://localhost:4000/api
```

---

## Available Documentation

The backend documentation consists of the following files:

| File | Description |
|------|-------------|
| API_REFERENCE.md | List of backend endpoints |
| API_OBJECTS.md | JSON models used in API communication |
| ARCHITECTURE.md | System architecture and topology |
| SECURITY.md | Security controls and validation standards |
| DB_IMPLEMENTATION.md | Database schema and relationships |
| LOGIC_FLOW.md | Queue lifecycle and processing logic |

---

## Version History

Version 1.0 — November 2025
