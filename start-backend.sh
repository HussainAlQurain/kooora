#!/bin/bash

# Set environment variables
export JWT_SECRET="kooora-secret-key-2024-very-long-and-secure-key-for-production-must-be-at-least-256-bits-long"
export JWT_EXPIRATION=86400000
export SPRING_PROFILES_ACTIVE=dev

# Start the backend
cd /workspace/backend
echo "Starting Kooora Backend..."
echo "JWT Secret: ${JWT_SECRET:0:20}..."
echo "Profile: $SPRING_PROFILES_ACTIVE"

java -jar target/kooora-backend.jar