#!/bin/bash
# Install dependencies
echo "Installing server dependencies..."
cd server && npm install
cd ..

echo "Installing client dependencies..."
cd client && npm install
cd ..

# Start Server
echo "Starting Backend..."
cd server && npm run dev &

# Start Client
echo "Starting Frontend..."
cd client && npm run dev &

wait
