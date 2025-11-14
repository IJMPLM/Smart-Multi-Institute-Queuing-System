# Smart Multi-Institute Queuing System
## API Object Templates

This document defines the JSON structure of objects exchanged within the backend system.

---

## Institute Object

```json
{
  "id": "inst-001",
  "name": "Pamantasan ng Lungsod ng Maynila",
  "address": "Intramuros, Manila",
  "contact": {
    "email": "info@plm.edu.ph",
    "phone": "+63-2-1234-5678"
  },
  "services": [
    {
      "id": "svc-001",
      "name": "Registrar",
      "avg_service_time": 5
    }
  ]
}
```

---

## Service Object

```json
{
  "id": "svc-001",
  "institute_id": "inst-001",
  "name": "Registrar",
  "form_id": "form-001",
  "avg_service_time": 5
}
```

---

## Form Object

```json
{
  "id": "form-001",
  "name": "Admission Application Form",
  "version": "1.0",
  "questions": [
    { "id": "q-001", "type": "text", "label": "First Name", "required": true },
    { "id": "q-002", "type": "text", "label": "Last Name", "required": true },
    { "id": "q-003", "type": "email", "label": "Email Address", "required": true },
    { "id": "q-004", "type": "dropdown", "label": "Course", "options": ["BSCS", "BSIT", "BSECE"] }
  ]
}
```

---

## Form Entry Object

```json
{
  "id": "entry-001",
  "form_id": "form-001",
  "applicant_id": "app-101",
  "answers": [
    { "question_id": "q-001", "value": "Joseph" },
    { "question_id": "q-002", "value": "Rapiz" },
    { "question_id": "q-003", "value": "jprapiz@plm.edu.ph" }
  ],
  "validated": true,
  "timestamp": "2025-11-09T10:00:00Z"
}
```

---

## Applicant Object

```json
{
  "id": "app-101",
  "name": "Joseph Prince Rapiz",
  "contact": {
    "email": "jprapiz@plm.edu.ph",
    "phone": "0917-123-4567"
  },
  "session_id": "sess-303",
  "current_queue": {
    "service": "Registrar",
    "queue_number": 15,
    "status": "waiting"
  }
}
```

---

## Queue Item Object

```json
{
  "id": "qitem-001",
  "service_id": "svc-001",
  "session_id": "sess-303",
  "queue_number": 15,
  "priority": "normal",
  "status": "waiting",
  "counter_id": null,
  "created_at": "2025-11-09T09:55:00Z"
}
```

---

## Counter Object

```json
{
  "id": "counter-01",
  "institute_id": "inst-001",
  "service_ids": ["svc-001", "svc-002"],
  "status": "active",
  "current_ticket": 15,
  "last_updated": "2025-11-09T10:15:00Z"
}
```

---

## Session Token Object

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  "expires_in": 3600,
  "user_role": "applicant",
  "session_id": "sess-303"
}
```

---

## AI Message Objects

### Chat Input
```json
{
  "session_id": "sess-303",
  "message": "I want to apply for admission",
  "context": "general_inquiry"
}
```

### Chat Response
```json
{
  "message": "Which service do you want to apply for?",
  "choices": ["Registrar", "Guidance", "Admission"],
  "intent": "select_service",
  "status": "success"
}
```

---

## Error Object

```json
{
  "status": "error",
  "message": "Invalid form input",
  "details": {
    "field": "email",
    "issue": "Invalid format"
  }
}
```

---

## Version
Version 1.0 — November 2025
