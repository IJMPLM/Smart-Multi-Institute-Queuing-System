# Smart Multi-Institute Queuing System
## Database Implementation

The system uses PostgreSQL as the primary data store. PostgreSQL's JSONB data type is used to store form schemas, applicant responses, and other flexible structures. This document outlines the entity relationships and data flow across the database.

---

## Entity Relationship Overview

The core tables include:

```
institutes(id, name, address, contact)
services(id, institute_id, name, form_id, avg_service_time)
forms(id, institute_id, version, schema_jsonb)
applicants(id, name, contact)
sessions(id, applicant_id, institute_id, service_id, ai_thread_id, status)
form_entries(id, session_id, question_id, value_jsonb, validation_status)
queue_items(id, session_id, service_id, queue_number, priority, status, counter_id)
counters(id, institute_id, name, service_ids[], status)
audit_logs(id, user_id, action, payload_jsonb, created_at)
```

---

## Table Descriptions

### 1. Institutes
Represents institutions within which queues and services operate.

### 2. Services
Contains service definitions and linked form requirements.
- Includes average service time per applicant for ETA computation.

### 3. Forms
Stores form schema in JSONB for dynamic rendering and validation.

### 4. Applicants
Stores basic applicant data.

### 5. Sessions
Represents an applicant's service session from start until completion.

### 6. Form Entries
Contains applicant answers to dynamic form questions.

### 7. Queue Items
Represents each queue record for a service.

Statuses include:
- waiting  
- called  
- processing  
- completed  
- missing  

### 8. Counters
Represents service counters and their assigned services.

### 9. Audit Logs
Records administrative and system actions for traceability.

---

## Indexing Strategy

```sql
CREATE INDEX idx_active_queues ON queue_items(service_id, status)
WHERE status IN ('waiting','called','processing');
```

This reduces query cost for real-time queue extraction.

---

## Concurrency and Locking

To prevent multiple counters from serving the same queue number:
```sql
SELECT id FROM queue_items
WHERE service_id = ?
  AND status = 'waiting'
ORDER BY priority DESC, created_at ASC
FOR UPDATE SKIP LOCKED
LIMIT 1;
```

---

## Version
Version 1.0 — November 2025
