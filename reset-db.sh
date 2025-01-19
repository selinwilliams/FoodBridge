#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Check if running in Docker
if [ -f "/.dockerenv" ]; then
    echo -e "${RED}This script is for local development only${NC}"
    exit 1
fi

echo -e "${RED}WARNING: This will delete all data in your development database${NC}"
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Stop any running Docker containers
    docker compose down -v

    # Remove database files
    rm -f instance/dev.db
    rm -rf migrations

    # Run migration script
    ./migrate.sh

    echo -e "${GREEN}Database has been reset successfully${NC}"
else
    echo "Operation cancelled"
fi 