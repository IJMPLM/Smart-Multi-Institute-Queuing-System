# Smart Multi-Institute Queuing System
## System Architecture and Network Flow

The Smart Multi-Institute Queuing System uses a LAN-based star topology architecture that connects applicants, counters, displays, and the main server host. The backend server provides REST and WebSocket communication between all connected clients.

---

## LAN Topology

All devices connect to a main server host within a secured local area network (LAN).

```
[Applicant Devices]   [Counters]   [Displays]
         \                |              /
          \_______________|_____________/
                      Main Server
```

**Topology:** Star  
**Primary Protocols:** HTTPS and WSS (WebSocket Secure)

---

## System Components

| Component | Description |
|------------|--------------|
| Applicant Web Application | Used by applicants via mobile or kiosk for form submission and queue tracking. |
| Counter Dashboard | Staff interface for calling, serving, or transferring applicants in the queue. |
| Administrator Control Panel | Provides system monitoring, audit logs, and configuration access. |
| Main Server | Hosts APIs, WebSocket connections, and data synchronization logic. |
| Database (PostgreSQL) | Stores applicant data, queue states, forms, and audit logs. |
| Cache or Message Broker (Redis) | Handles real-time pub/sub events and queue updates. |
| Display Clients | Display the current queue number and service window. |

---

## Data and Communication Flow

1. **Applicant to Server**  
   The applicant submits messages or form data through HTTPS. The server validates and stores the data in PostgreSQL.

2. **Server to Counter**  
   Counter dashboards connect via WebSocket to receive live queue updates.

3. **Administrator to Server**  
   Administrators perform management actions such as calling, skipping, transferring, or freezing queues. These actions are broadcasted through Redis Pub/Sub or Socket.IO rooms.

4. **Server to Display Clients**  
   Public display clients receive broadcast updates for queue numbers and counters.

---

## Network Communication Summary

| Channel | Protocol | Purpose |
|----------|-----------|----------|
| REST API | HTTPS (TLS 1.3) | Standard CRUD operations and form submissions |
| Real-time | WSS (Secure WebSocket) | Queue status updates and counter events |
| Administrator Broadcast | Redis Pub/Sub or MQTT | Inter-counter messaging and display updates |
| Database Synchronization | TCP/IP (PostgreSQL) | Persistent data storage and queries |

---

## Process Flow Example

1. Applicant joins a queue by submitting a validated form and is assigned a queue number. The estimated waiting time is calculated based on the average service time.  
2. Counter retrieves the next ticket through a secure endpoint, marks it as "processing," and then as "completed."  
3. Administrator may pause queues, broadcast announcements, or transfer applicants between counters.  
4. The server pushes real-time updates to all clients (applicant, counter, display) using WebSocket rooms.

---

## Main Server Host Setup

**Host Services:**
- Express or Fastify backend API
- PostgreSQL for persistent data
- Redis for real-time events
- NGINX reverse proxy for SSL termination
- Socket.IO server for event broadcasting

**Example Docker Compose Configuration:**
```yaml
services:
  api:
    build: ./backend
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - redis
  postgres:
    image: postgres:15
    volumes:
      - ./data:/var/lib/postgresql/data
  redis:
    image: redis:alpine
  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
```

---

## Version
Version 1.0 – November 2025
