FROM python:3.9.18-alpine3.18

# Install build dependencies
RUN apk add --no-cache \
    postgresql-dev \
    gcc \
    python3-dev \
    musl-dev \
    build-base \
    libffi-dev \
    postgresql-client \
    curl

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN pip install psycopg2-binary

# Copy application code
COPY . .

# Copy and make entrypoint script executable
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set environment variables
ENV FLASK_APP=__init__.py
ENV PYTHONPATH=/app
ENV POSTGRES_HOST=db
ENV POSTGRES_DB=postgres
ENV POSTGRES_USER=postgres

ENTRYPOINT ["docker-entrypoint.sh"]