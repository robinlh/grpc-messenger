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
