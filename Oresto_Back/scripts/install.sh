#!/bin/sh
set -e

# Check if node_modules is empty or does not exist
if [ ! -d "node_modules" ] || [ -z "$(ls -A 'node_modules' 2>/dev/null)" ]; then
    echo "node_modules is empty or does not exist, running npm install..."
    npm ci
else
    echo "node_modules is not empty, skipping npm install..."
fi

# Check if logs directory exists
if [ ! -d "logs" ]; then
    echo "logs folder does not exist, creating it..."
    mkdir -p /app/logs
else
    echo "logs folder exists..."
fi

# Execute the command provided as arguments to the script
exec "$@"
