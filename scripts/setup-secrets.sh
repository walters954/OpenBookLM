#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Creating Kubernetes secrets...${NC}"

# Function to encode value to base64
encode_base64() {
    echo -n "$1" | base64
}

# Read values from .env file if it exists
if [ -f .env ]; then
    source .env
fi

# Create temporary secrets file
cat << EOF > k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  DATABASE_URL: $(encode_base64 "${DATABASE_URL}")
  UPSTASH_REDIS_REST_URL: $(encode_base64 "${UPSTASH_REDIS_REST_URL}")
  UPSTASH_REDIS_REST_TOKEN: $(encode_base64 "${UPSTASH_REDIS_REST_TOKEN}")
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: $(encode_base64 "${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}")
  CLERK_SECRET_KEY: $(encode_base64 "${CLERK_SECRET_KEY}")
  CEREBRAS_API_KEY: $(encode_base64 "${CEREBRAS_API_KEY}")
  LLAMA_API_KEY: $(encode_base64 "${LLAMA_API_KEY}")
  OPENAI_API_KEY: $(encode_base64 "${OPENAI_API_KEY}")
EOF

# Apply the secrets to Kubernetes
kubectl apply -f k8s/secrets.yaml

# Clean up the temporary file
rm k8s/secrets.yaml

echo -e "${GREEN}Secrets have been created successfully!${NC}" 