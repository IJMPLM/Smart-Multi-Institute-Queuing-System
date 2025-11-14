# Smart Multi-Institute Queuing System
## Security and Validation Standards

This document outlines the security mechanisms implemented in the backend to protect applicant data, queue information, and system integrity. The system enforces multiple layers of security including authentication, input validation, encryption, and audit logging.

---

## Authentication and Authorization

### JSON Web Token (JWT) Authentication
All clients use JSON Web Tokens (JWT) for authentication. Tokens are short-lived and must be included in HTTP headers as follows:
```
Authorization: Bearer <JWT_TOKEN>
```

### Role-Based Access Control (RBAC)

| Role | Access Scope |
|------|---------------|
| Applicant | Chatbot, form submission, queue tracking |
| Counter Administrator | Queue processing, ticket management |
| System Administrator | Full access to all endpoints and logs |
| Display Client | Read-only queue monitoring |

Access permissions are verified both at the route and socket levels.

---

## Input Validation and Data Sanitization

| Validation Type | Library or Method | Description |
|-----------------|-------------------|--------------|
| Input Validation | express-validator or Joi | Ensures data conforms to expected formats |
| Data Sanitization | HTML entity encoding | Prevents cross-site scripting (XSS) |
| Email and Phone Validation | Regular expressions | Validates contact information |
| Numeric Validation | Built-in numeric checks | Prevents invalid queue numbers |

**Example Validation Code:**
```javascript
check("email").isEmail().withMessage("Invalid email format");
check("queueNumber").isInt({ min: 1 });
```

---

## Network Security

| Layer | Security Measure |
|--------|-------------------|
| Transport | HTTPS and WSS (TLS 1.3 encryption) |
| Session | HttpOnly, Secure, and SameSite cookies |
| Database | Encrypted credentials and limited privileges |
| Backup | Nightly PostgreSQL backups with encryption |
| Firewall | Restricted to LAN or VPN access only |

---

## Data Handling and Privacy

- Personally identifiable information (PII) is stored minimally and sanitized before database insertion.  
- JWT tokens are hashed using SHA-256 if persisted.  
- Form entries are stored in JSONB format, validated on input.  
- Administrative and system-critical actions are recorded in the audit log.

**Example Audit Log Entry:**
```json
{
  "user": "admin01",
  "action": "freeze_all",
  "timestamp": "2025-11-09T10:33:00Z",
  "ip": "192.168.1.10"
}
```

---

## Error Handling

All backend errors follow a standard response format:
```json
{
  "status": "error",
  "message": "Invalid input",
  "details": { "field": "email" }
}
```
Sensitive information, such as stack traces or database credentials, is never exposed to clients.

---

## Session and Application Security

- Tokens have a short lifetime (no longer than one hour).  
- Refresh tokens may be used for persistent sessions.  
- Socket.IO rooms require token validation before connection.  
- All form submissions include CSRF protection.  
- QR-based logins use single-use, time-limited tokens.

---

## Version
Version 1.0 – November 2025
