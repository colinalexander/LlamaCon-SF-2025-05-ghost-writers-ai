#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Tavus API key
API_KEY="5e123216085a43b0a8e69746e6abc1e8"

# Replica and persona IDs for spy-novel genre
REPLICA_ID="rf4703150052"
PERSONA_ID="p48fdf065d6b"

# Log file
LOG_FILE="tavus-api-curl-test.log"

# Function to log messages
log() {
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo -e "${timestamp} - $1"
  echo "${timestamp} - $1" >> "${LOG_FILE}"
}

# Clear the log file
> "${LOG_FILE}"

log "Starting Tavus API curl tests..."
log "API Key: ${API_KEY:0:5}..."
log "Replica ID: ${REPLICA_ID}"
log "Persona ID: ${PERSONA_ID}"

# Test 1: Simple GET request to check if the domain is reachable
log "\n=== Test 1: Simple GET request to check if the domain is reachable ==="
start_time=$(date +%s.%N)
curl_output=$(curl -s -o /dev/null -w "%{http_code}" -X GET "https://api.tavus.io" -m 10)
end_time=$(date +%s.%N)
duration=$(echo "${end_time} - ${start_time}" | bc)

if [ "${curl_output}" -ge 200 ] && [ "${curl_output}" -lt 300 ]; then
  log "${GREEN}Success! Response code: ${curl_output}${NC}"
else
  log "${RED}Error! Response code: ${curl_output}${NC}"
fi
log "Request completed in ${duration} seconds"

# Test 2: Check if the videos endpoint exists
log "\n=== Test 2: Check if the videos endpoint exists ==="
start_time=$(date +%s.%N)
curl_output=$(curl -s -o /dev/null -w "%{http_code}" -X GET "https://api.tavus.io/v2/videos" -H "x-api-key: ${API_KEY}" -m 10)
end_time=$(date +%s.%N)
duration=$(echo "${end_time} - ${start_time}" | bc)

if [ "${curl_output}" -ge 200 ] && [ "${curl_output}" -lt 300 ]; then
  log "${GREEN}Success! Response code: ${curl_output}${NC}"
else
  log "${RED}Error! Response code: ${curl_output}${NC}"
fi
log "Request completed in ${duration} seconds"

# Test 3: Create a video with a short timeout
log "\n=== Test 3: Create a video with a short timeout (10s) ==="
start_time=$(date +%s.%N)
curl_output=$(curl -s -o "video_response_10s.json" -w "%{http_code}" -X POST "https://api.tavus.io/v2/videos" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -d "{\"replica_id\":\"${REPLICA_ID}\",\"persona_id\":\"${PERSONA_ID}\",\"script\":\"Hello! I am your writing coach. I am here to help you with your project.\"}" \
  -m 10)
end_time=$(date +%s.%N)
duration=$(echo "${end_time} - ${start_time}" | bc)

if [ "${curl_output}" -ge 200 ] && [ "${curl_output}" -lt 300 ]; then
  log "${GREEN}Success! Response code: ${curl_output}${NC}"
  log "Response saved to video_response_10s.json"
else
  log "${RED}Error! Response code: ${curl_output}${NC}"
fi
log "Request completed in ${duration} seconds"

# Test 4: Create a video with a longer timeout
log "\n=== Test 4: Create a video with a longer timeout (30s) ==="
start_time=$(date +%s.%N)
curl_output=$(curl -s -o "video_response_30s.json" -w "%{http_code}" -X POST "https://api.tavus.io/v2/videos" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -d "{\"replica_id\":\"${REPLICA_ID}\",\"persona_id\":\"${PERSONA_ID}\",\"script\":\"Hello! I am your writing coach. I am here to help you with your project.\"}" \
  -m 30)
end_time=$(date +%s.%N)
duration=$(echo "${end_time} - ${start_time}" | bc)

if [ "${curl_output}" -ge 200 ] && [ "${curl_output}" -lt 300 ]; then
  log "${GREEN}Success! Response code: ${curl_output}${NC}"
  log "Response saved to video_response_30s.json"
else
  log "${RED}Error! Response code: ${curl_output}${NC}"
fi
log "Request completed in ${duration} seconds"

# Test 5: Create a video with a very long timeout
log "\n=== Test 5: Create a video with a very long timeout (60s) ==="
start_time=$(date +%s.%N)
curl_output=$(curl -s -o "video_response_60s.json" -w "%{http_code}" -X POST "https://api.tavus.io/v2/videos" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -d "{\"replica_id\":\"${REPLICA_ID}\",\"persona_id\":\"${PERSONA_ID}\",\"script\":\"Hello! I am your writing coach. I am here to help you with your project.\"}" \
  -m 60)
end_time=$(date +%s.%N)
duration=$(echo "${end_time} - ${start_time}" | bc)

if [ "${curl_output}" -ge 200 ] && [ "${curl_output}" -lt 300 ]; then
  log "${GREEN}Success! Response code: ${curl_output}${NC}"
  log "Response saved to video_response_60s.json"
else
  log "${RED}Error! Response code: ${curl_output}${NC}"
fi
log "Request completed in ${duration} seconds"

# Test 6: Check if the conversations endpoint exists
log "\n=== Test 6: Check if the conversations endpoint exists ==="
start_time=$(date +%s.%N)
curl_output=$(curl -s -o /dev/null -w "%{http_code}" -X GET "https://api.tavus.io/v2/conversations" -H "x-api-key: ${API_KEY}" -m 10)
end_time=$(date +%s.%N)
duration=$(echo "${end_time} - ${start_time}" | bc)

if [ "${curl_output}" -ge 200 ] && [ "${curl_output}" -lt 300 ]; then
  log "${GREEN}Success! Response code: ${curl_output}${NC}"
else
  log "${RED}Error! Response code: ${curl_output}${NC}"
fi
log "Request completed in ${duration} seconds"

# Test 7: Create a conversation with a short timeout
log "\n=== Test 7: Create a conversation with a short timeout (10s) ==="
start_time=$(date +%s.%N)
curl_output=$(curl -s -o "conversation_response_10s.json" -w "%{http_code}" -X POST "https://api.tavus.io/v2/conversations" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -d "{\"replica_id\":\"${REPLICA_ID}\",\"persona_id\":\"${PERSONA_ID}\",\"conversation_name\":\"Writing Coach Session\",\"conversational_context\":\"The user is working on a spy-novel project and needs writing guidance.\",\"custom_greeting\":\"Hello! I'm your writing coach.\",\"callback_url\":\"https://your-domain.com/api/tavus/transcript\",\"properties\":{\"max_call_duration\":1800}}" \
  -m 10)
end_time=$(date +%s.%N)
duration=$(echo "${end_time} - ${start_time}" | bc)

if [ "${curl_output}" -ge 200 ] && [ "${curl_output}" -lt 300 ]; then
  log "${GREEN}Success! Response code: ${curl_output}${NC}"
  log "Response saved to conversation_response_10s.json"
else
  log "${RED}Error! Response code: ${curl_output}${NC}"
fi
log "Request completed in ${duration} seconds"

# Test 8: Create a conversation with a longer timeout
log "\n=== Test 8: Create a conversation with a longer timeout (30s) ==="
start_time=$(date +%s.%N)
curl_output=$(curl -s -o "conversation_response_30s.json" -w "%{http_code}" -X POST "https://api.tavus.io/v2/conversations" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -d "{\"replica_id\":\"${REPLICA_ID}\",\"persona_id\":\"${PERSONA_ID}\",\"conversation_name\":\"Writing Coach Session\",\"conversational_context\":\"The user is working on a spy-novel project and needs writing guidance.\",\"custom_greeting\":\"Hello! I'm your writing coach.\",\"callback_url\":\"https://your-domain.com/api/tavus/transcript\",\"properties\":{\"max_call_duration\":1800}}" \
  -m 30)
end_time=$(date +%s.%N)
duration=$(echo "${end_time} - ${start_time}" | bc)

if [ "${curl_output}" -ge 200 ] && [ "${curl_output}" -lt 300 ]; then
  log "${GREEN}Success! Response code: ${curl_output}${NC}"
  log "Response saved to conversation_response_30s.json"
else
  log "${RED}Error! Response code: ${curl_output}${NC}"
fi
log "Request completed in ${duration} seconds"

# Test 9: Try a different API endpoint (tavusapi.com instead of api.tavus.io)
log "\n=== Test 9: Try a different API endpoint (tavusapi.com) ==="
start_time=$(date +%s.%N)
curl_output=$(curl -s -o "tavusapi_response.json" -w "%{http_code}" -X POST "https://tavusapi.com/v2/videos" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${API_KEY}" \
  -d "{\"replica_id\":\"${REPLICA_ID}\",\"persona_id\":\"${PERSONA_ID}\",\"script\":\"Hello! I am your writing coach. I am here to help you with your project.\"}" \
  -m 30)
end_time=$(date +%s.%N)
duration=$(echo "${end_time} - ${start_time}" | bc)

if [ "${curl_output}" -ge 200 ] && [ "${curl_output}" -lt 300 ]; then
  log "${GREEN}Success! Response code: ${curl_output}${NC}"
  log "Response saved to tavusapi_response.json"
else
  log "${RED}Error! Response code: ${curl_output}${NC}"
fi
log "Request completed in ${duration} seconds"

# Test 10: Try a different API endpoint (player.tavus.io)
log "\n=== Test 10: Try a different API endpoint (player.tavus.io) ==="
start_time=$(date +%s.%N)
curl_output=$(curl -s -o "player_response.json" -w "%{http_code}" -X GET "https://player.tavus.io" -m 10)
end_time=$(date +%s.%N)
duration=$(echo "${end_time} - ${start_time}" | bc)

if [ "${curl_output}" -ge 200 ] && [ "${curl_output}" -lt 300 ]; then
  log "${GREEN}Success! Response code: ${curl_output}${NC}"
  log "Response saved to player_response.json"
else
  log "${RED}Error! Response code: ${curl_output}${NC}"
fi
log "Request completed in ${duration} seconds"

log "\nAll tests completed. Check the log file for details: ${LOG_FILE}"
