# Legora Messenger

A real-time messaging application built with Python gRPC backend and React frontend.

## Disclaimer

In the interest of transparency I'd like to highlight that I'm predominanatly a backend engineer and although I understand how things work on the frontend, this UI was developed with input from ChatGPT. 

## Architecture

- **Backend**: Python with gRPC, PostgreSQL database, JWT authentication
- **Frontend**: React with TypeScript, Tailwind CSS, gRPC-Web
- **Communication**: Server streaming for message delivery, unary calls for sending
- **Deployment**: Docker containers with Envoy proxy for gRPC-Web translation

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- Protocol Buffers compiler (`protoc`)

## Clone the Repository

```bash
git clone git@github.com:robinlh/legora-messenger.git
cd legora-messenger
```

## Quick Start

```bash
docker-compose up --build
```

This will:
- Build and start the backend gRPC server (port 50051)
- Build and start the Envoy proxy (port 8080)
- Build and start the frontend web server (port 3000)
- Set up a PostgreSQL database with test data

To take stack down (optional -v to remove db volume)
```bash
docker-compose down -v
```

## Local Development Setup

### 1. Generate Protocol Buffer Files (Optional)

I've included the generated protobuf files in the repo for ease of use, so generation steps aren't necessary.

#### Backend Proto Generation

```bash
cd backend
mkdir -p messenger/generated
python -m grpc_tools.protoc \
    -I../protos \
    --python_out=./messenger/generated \
    --grpc_python_out=./messenger/generated \
    ../protos/messaging.proto ../protos/auth.proto
```

#### Frontend Proto Generation

```bash
cd frontend
mkdir -p src/generated
npx grpc_tools_node_protoc \
    --js_out=import_style=commonjs,binary:./src/generated \
    --grpc-web_out=import_style=typescript,mode=grpcwebtext:./src/generated \
    -I ../protos \
    ../protos/messaging.proto ../protos/auth.proto
```

### 2. Database Setup

```bash
docker run -d --name messenger-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=messenger -p 5432:5432 postgres:15
```

### 3. Backend Setup

```bash
cd backend
uv sync
uv run python init_db.py
uv run python seed_db.py
uv run python main.py
```

### 4. Envoy Setup

```bash
docker-compose up envoy
```

### 5. Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Access the Application

- Frontend: http://localhost:3000
- Backend gRPC: localhost:50051 (via Envoy at localhost:8080 for web clients)

#### Usage notes
When logging in as a test user you can create new DMs or group chats with any of the other test users. 

To see received messages for a user
- open a new tab
- logout if still presented with the chat screen
- login as desired user

### Test Users
The application comes seeded with test users:
- **jacob** (password: password123)
- **jakob** (password: password123)
- **joachim** (password: password123)
- **erik** (password: password123)
- **zino** (password: password123)
- **robin** (password: password123)