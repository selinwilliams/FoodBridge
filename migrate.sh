#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${YELLOW}>>> $1${NC}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# Check if running in Docker
IN_DOCKER=0
if [ -f "/.dockerenv" ]; then
    IN_DOCKER=1
fi

# Check if we're in the right directory
if [ ! -d "app" ] || [ ! -d "react-vite" ]; then
    print_error "Please run this script from the FoodBridge root directory"
fi

print_status "Starting database migration process..."

if [ $IN_DOCKER -eq 0 ]; then
    # Local development setup
    
    # 1. Set up Python virtual environment
    if [ ! -d "venv" ]; then
        print_status "Creating virtual environment..."
        python3 -m venv venv || print_error "Failed to create virtual environment"
    fi

    print_status "Activating virtual environment..."
    source venv/bin/activate || print_error "Failed to activate virtual environment"

    # 2. Install dependencies
    print_status "Installing Python dependencies..."
    pip install -r app/requirements.txt || print_error "Failed to install dependencies"
fi

# 3. Set up environment variables
if [ $IN_DOCKER -eq 0 ]; then
    export FLASK_APP=app
    export FLASK_ENV=development
    export FLASK_DEBUG=True
    export DATABASE_URL="sqlite:///dev.db"
else
    # Docker environment variables should be set in docker-compose.yml
    print_status "Using Docker environment variables"
fi

# 4. Clean up existing database and migrations
print_status "Cleaning up existing database and migrations..."
if [ $IN_DOCKER -eq 0 ]; then
    rm -f instance/dev.db
fi
rm -rf migrations

# 5. Initialize and run migrations
cd app || print_error "Failed to change to app directory"

print_status "Initializing database migrations..."
flask db init || print_error "Failed to initialize migrations"

print_status "Creating new migration..."
flask db migrate -m "Initial migration" || print_error "Failed to create migration"

print_status "Applying migration..."
flask db upgrade || print_error "Failed to apply migration"

# 6. Seed the database
print_status "Seeding the database..."
flask seed all || print_error "Failed to seed database"

# 7. Verify current migration
print_status "Verifying database setup..."
flask db current || print_error "Failed to verify migration"

print_success "Database migration completed successfully!"

if [ $IN_DOCKER -eq 0 ]; then
    print_success "You can now start your application with:"
    echo "cd app && flask run"
else
    print_success "Docker container is ready to start the application"
fi

# Return to root directory
cd ..

# Deactivate virtual environment if in local development
if [ $IN_DOCKER -eq 0 ]; then
    deactivate
fi 