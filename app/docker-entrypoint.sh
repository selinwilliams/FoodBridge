#!/bin/sh
set -e

# Function to check if postgres is ready
postgres_ready() {
    python << END
import sys
import psycopg2
try:
    psycopg2.connect(
        dbname="${POSTGRES_DB}",
        user="${POSTGRES_USER}",
        password="${POSTGRES_PASSWORD}",
        host="${POSTGRES_HOST}"
    )
except psycopg2.OperationalError:
    sys.exit(-1)
sys.exit(0)
END
}

echo "Waiting for PostgreSQL..."
until postgres_ready; do
  >&2 echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL is available"

# Reset database tables and types
echo "Resetting database tables and types..."
python << END
import psycopg2

conn = psycopg2.connect(
    dbname="${POSTGRES_DB}",
    user="${POSTGRES_USER}",
    password="${POSTGRES_PASSWORD}",
    host="${POSTGRES_HOST}"
)
cur = conn.cursor()

# Drop all tables
cur.execute("""
    SELECT tablename FROM pg_tables WHERE schemaname = 'public';
""")
tables = cur.fetchall()

for table in tables:
    cur.execute(f'DROP TABLE IF EXISTS {table[0]} CASCADE;')

# Drop all enum types
cur.execute("""
    SELECT t.typname
    FROM pg_type t
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typtype = 'e' AND n.nspname = 'public';
""")
enums = cur.fetchall()

for enum in enums:
    cur.execute(f'DROP TYPE IF EXISTS {enum[0]} CASCADE;')

conn.commit()
cur.close()
conn.close()
END

echo "Checking for existing migrations..."
if [ ! -d "migrations" ]; then
    echo "Initializing migrations directory..."
    flask db init
    if [ $? -ne 0 ]; then
        echo "Failed to initialize migrations"
        exit 1
    fi
fi

echo "Removing old migrations..."
rm -rf migrations/versions/*

echo "Creating new migration..."
flask db migrate -m "Initial migration"
if [ $? -ne 0 ]; then
    echo "Failed to create migration"
    exit 1
fi

echo "Applying migrations..."
flask db upgrade head
if [ $? -ne 0 ]; then
    echo "Failed to apply migrations"
    exit 1
fi

if [ "$FLASK_ENV" = "development" ]; then
    echo "Seeding development data..."
    flask seed all
    if [ $? -ne 0 ]; then
        echo "Failed to seed database"
        exit 1
    fi
fi

echo "Starting Flask application..."
exec flask run --host=0.0.0.0 