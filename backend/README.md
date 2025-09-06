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
