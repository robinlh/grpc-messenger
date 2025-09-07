FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && pip install uv

COPY backend/pyproject.toml .

RUN uv pip install --system -r pyproject.toml

COPY backend .

EXPOSE 50051

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

CMD ["sh", "-c", "python init_db.py && python seed_db.py && python main.py"]