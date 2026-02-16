---
title: Introduction to REST APIs
created: 2023-07-20 11:00:00
updated: 2023-08-02 15:20:40
---

REST APIs are the backbone of modern web applications. Here's what you need to know.

## What is REST?

REST (Representational State Transfer) is an architectural style for designing networked applications. It uses HTTP methods to perform operations on resources.

## HTTP Methods

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Read data | Get user list |
| POST | Create data | Create new user |
| PUT | Update (full) | Replace user data |
| PATCH | Update (partial) | Update user email |
| DELETE | Remove data | Delete a user |

## Resource URLs

Design URLs around resources (nouns), not actions (verbs):

```
✅ Good:
GET    /users          # List users
GET    /users/123      # Get user 123
POST   /users          # Create user
PUT    /users/123      # Update user 123
DELETE /users/123      # Delete user 123

❌ Bad:
GET    /getUsers
POST   /createUser
POST   /deleteUser/123
```

## Status Codes

```
2xx - Success
  200 OK
  201 Created
  204 No Content

4xx - Client Error
  400 Bad Request
  401 Unauthorized
  403 Forbidden
  404 Not Found

5xx - Server Error
  500 Internal Server Error
  503 Service Unavailable
```

## Request & Response

### Request

```http
POST /api/users HTTP/1.1
Host: example.com
Content-Type: application/json
Authorization: Bearer eyJhbGc...

{
  "name": "Alice",
  "email": "alice@example.com"
}
```

### Response

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": 123,
  "name": "Alice",
  "email": "alice@example.com",
  "createdAt": "2023-07-20T11:30:00Z"
}
```

## Best Practices

1. Use plural nouns for resources (`/users` not `/user`)
2. Version your API (`/v1/users`)
3. Use query params for filtering (`/users?role=admin`)
4. Return appropriate status codes
5. Include pagination for lists
6. Document your API thoroughly

## Testing APIs

Use tools like:

- **curl** - Command line
- **Postman** - GUI application
- **Thunder Client** - VS Code extension

```bash
# Example curl request
curl -X GET https://api.example.com/users \
  -H "Authorization: Bearer token123"
```

Understanding REST is fundamental for any web developer!

