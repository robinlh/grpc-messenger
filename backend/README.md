## Backend setup

### Auth Models and DB connection
- protos for login + token validation
```bash
uv run python -m grpc_tools.protoc -I./protos --python_out=./messenger/generated --grpc_python_out=./messenger/generated ./protos/auth.proto
```
- user model
- db run and config
```bash
docker run -d --name messenger-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=messenger -p 5432:5432 postgres:15
```
- migrations
- seed data
- message and thread models

https://dev.to/lovestaco/designing-a-schema-for-a-chat-with-notification-application-59mc

### Login and Token validation
- grpc server that implements login request/response + validate token request/response
```bash
grpcurl -plaintext -d '{"username":"alice","password":"password123"}' localhost:50051 messenger.AuthService/Login
```

```
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFsaWNlIiwiZXhwIjoxNzU3MjQ0NDgwfQ.K7p3u0Ref-Ru3M4-uHmUCESgJx4V4P4uXs-KuiL8dk4",
  "message": "Login successful",
  "user_id": 1,
  "username": "alice"
}
```

```bash
grpcurl -plaintext -d '{"username":"bob","password":"password123"}' localhost:50051 messenger.AuthService/Login
```
```
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6ImJvYiIsImV4cCI6MTc1NzI0NDQ5Nn0.Wmotrvb9doLsNKMuLonHJ2HtlHZGJMp9-uv6WKAjEcQ",
  "message": "Login successful",
  "user_id": 2,
  "username": "bob"
}
```

```bash
grpcurl -plaintext -d '{"username":"alice","password":"wrongpass"}' localhost:50051 messenger.AuthService/Login
```
```
{
  "message": "Invalid password"
}
```

```bash

grpcurl -plaintext -d '{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyLCJ1c2VybmFtZSI6ImJvYiIsImV4cCI6MTc1NzI0NDQ5Nn0.Wmotrvb9doLsNKMuLonHJ2HtlHZGJMp9-uv6WKAjEcQ"}' localhost:50051 messenger.AuthService/ValidateToken
```

```
{
  "valid": true,
  "user_id": 2,
  "username": "bob"
}
```

```bash
grpcurl -plaintext -d '{"token":"nonsense"}' localhost:50051 messenger.AuthService/ValidateToken
```

```
{}
```
empty object because all fields are default

### Extend protos for messaging

- protos for sending messages and creating threads
```bash
uv run python -m grpc_tools.protoc -I./protos --python_out=./messenger/generated --grpc_python_out=./messenger/generated ./protos/messaging.proto
```

- send message and create thread 
- get messages and threads

```bash
grpcurl -plaintext -d '{"username": "alice", "password": "password123"}'
localhost:50051 messenger.AuthService/Login
```
```

{
"success": true,
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFsaW
NlIiwiZXhwIjoxNzU3MjQ2Nzk2fQ.93Oho8_72Og5Hfr9ogT8cudmY8QyNYQjpTAWamBXKr4",
"message": "Login successful",
"user_id": 1,
"username": "alice"
}
```

```bash
grpcurl -plaintext -d '{"token":
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFsaWNlIiwiZXh
wIjoxNzU3MjQ2Nzk2fQ.93Oho8_72Og5Hfr9ogT8cudmY8QyNYQjpTAWamBXKr4",
"participant_usernames": ["bob"], "name":"Alice and Bob"}' localhost:50051
messenger.MessagingService/CreateThread
```
```

{
"success": true,
"message": "Thread created successfully",
"thread": {
"id": 3,
"name": "Alice and Bob",
"participants": [
{
"id": 1,
"username": "alice"
},
{
"id": 2,
"username": "bob"
}
],
"updated_at": "1757153114"
}
}
```

```bash

grpcurl -plaintext -d '{"token":
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFsaWNlIiwiZXh
wIjoxNzU3MjQ2Nzk2fQ.93Oho8_72Og5Hfr9ogT8cudmY8QyNYQjpTAWamBXKr4"}' localhost:50051
messenger.MessagingService/GetThreads
```

```
{
"threads": [
{
"id": 3,
"name": "Alice and Bob",
"participants": [
{
"id": 1,
"username": "alice"
},
{
"id": 2,
"username": "bob"
}
],
"updated_at": "1757153114"
},
{
"id": 1,
"participants": [
{
"id": 1,
"username": "alice"
},
{
"id": 2,
"username": "bob"
}
],
"last_message": {
"id": 5,
"content": "React + TypeScript on the frontend, Python + gRPC on the backend",
"sender_id": 1,
"sender_username": "alice",
"created_at": "1757137403"
},
"updated_at": "1757138303"
},
{
"id": 2,
"name": "Project Planning",
"participants": [
{
"id": 1,
"username": "alice"
},
{
"id": 3,
"username": "charlie"
},
{
"id": 4,
"username": "diana"
}
],
"last_message": {
"id": 9,
"content": "Perfect! Let's sync up tomorrow morning",
"sender_id": 1,
"sender_username": "alice",
"created_at": "1757137103"
},
"updated_at": "1757138303"
}
]
}
```

```bash
grpcurl -plaintext -d '{"token":
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFsaWNlIiwiZXh
wIjoxNzU3MjQ2Nzk2fQ.93Oho8_72Og5Hfr9ogT8cudmY8QyNYQjpTAWamBXKr4", "thread_id": 3,
"content": "Hello from Alice!"}' localhost:50051
messenger.MessagingService/SendMessage
```

```
{
"success": true,
"message": "Message sent successfully",
"sent_message": {
"id": 10,
"content": "Hello from Alice!",
"sender_id": 1,
"sender_username": "alice",
"created_at": "1757153410"
}
}
```

- stream messages and broadcast messages
- something iffy here but will come back to it