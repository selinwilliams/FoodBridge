FROM python:3.9.18-alpine3.18

# Install build dependencies
RUN apk add --no-cache \
    postgresql-dev \
    gcc \
    python3-dev \
    musl-dev \
    build-base \
    libffi-dev

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN pip install psycopg2-binary

# Copy the rest of the application
COPY . .

# Set environment variables
ENV FLASK_APP=__init__.py
ENV FLASK_ENV=development
ENV PYTHONPATH=/app

# Run the application
CMD flask run --host=0.0.0.0