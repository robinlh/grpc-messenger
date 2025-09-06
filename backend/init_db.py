import sys
from messenger.config.database import init_db
from messenger.models import User, Thread, ThreadParticipant, Message

def main():
    try:
        init_db()
        print("Database initialized")
        print("Tables created: users, threads, thread_participants, messages")
    except Exception as e:
        print(f"Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()