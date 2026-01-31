#!/bin/bash
# Ollama entrypoint script
# Starts the server and pulls the required model

set -e

# Start ollama server in background
echo "Starting Ollama server..."
ollama serve &

# Wait for server to be ready
echo "Waiting for Ollama server to start..."
sleep 5

# Check if server is ready
until curl -s http://localhost:11434/api/tags > /dev/null 2>&1; do
    echo "Waiting for Ollama to be ready..."
    sleep 2
done

echo "Ollama server is ready!"

# Pull the configured model if not already present
MODEL="${OLLAMA_MODEL:-qwen3:4b}"
echo "Checking for model: $MODEL"

if ! ollama list | grep -q "$MODEL"; then
    echo "Pulling model: $MODEL (this may take a while)..."
    ollama pull "$MODEL"
    echo "Model $MODEL is ready!"
else
    echo "Model $MODEL already available."
fi

# Keep the container running
echo "Ollama is running and ready for requests."
wait
