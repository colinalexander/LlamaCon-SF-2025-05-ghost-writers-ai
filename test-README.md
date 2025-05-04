# Tavus API Test Suite

This is a comprehensive test suite to manually test the Tavus API and measure response times.

## Setup and Running Tests

### Node.js Tests

1. Install dependencies:
   ```
   npm install
   ```

2. Run the basic test:
   ```
   node test-tavus-api.js
   ```

3. Run the advanced test:
   ```
   node test-tavus-api-advanced.js
   ```

4. Run the fixed test (using the correct API endpoint):
   ```
   node test-tavus-api-fixed.js
   ```

### Curl Tests

The curl test script is often more reliable for diagnosing network issues:

1. Make the script executable:
   ```
   chmod +x test-tavus-api.sh
   ```

2. Run the curl tests:
   ```
   ./test-tavus-api.sh
   ```

## What These Scripts Do

### Basic Test (`test-tavus-api.js`)

This script makes direct API calls to the Tavus API endpoints:

1. `https://api.tavus.io/v2/videos` - To create a video
2. `https://api.tavus.io/v2/conversations` - To create a conversation

It measures the time it takes for each request to complete and logs detailed information about the response.

### Advanced Test (`test-tavus-api-advanced.js`)

This script performs a comprehensive series of tests:

1. Tests the reachability of the Tavus API domain
2. Tests the existence of the videos and conversations endpoints
3. Tests creating videos and conversations with different timeout values (10s, 30s, 60s)
4. Tests alternative API endpoints
5. Logs all results to a file (`tavus-api-test.log`) for detailed analysis

### Curl Test (`test-tavus-api.sh`)

This bash script uses curl to test the Tavus API:

1. Tests the reachability of the Tavus API domain
2. Tests the existence of the videos and conversations endpoints
3. Tests creating videos and conversations with different timeout values (10s, 30s, 60s)
4. Tests alternative API endpoints (tavusapi.com, player.tavus.io)
5. Saves API responses to JSON files for inspection
6. Logs all results to a file (`tavus-api-curl-test.log`) for detailed analysis

The curl test is particularly useful because:
- It bypasses any Node.js-specific networking issues
- It provides more detailed HTTP status information
- It can be more reliable for diagnosing connection problems

## Troubleshooting

If you encounter any issues:

- **Connection Timeout**: This indicates that the request is taking too long to complete. The default timeout for Node.js is 2 minutes, which should be plenty of time for the API to respond.

- **Connection Refused**: This indicates that the server is not accepting connections. The hostname might be incorrect or the server might be down.

- **Hostname Not Found**: This indicates that the domain name could not be resolved. Check if the domain is correct.

## Modifying the Script

You can modify the script to test different genres or parameters:

- Change the genre by modifying the `genreConfig` variable
- Change the API key by modifying the `TAVUS_API_KEY` variable
- Change the script or other parameters in the request body

## Next Steps

Based on the results of this test, you can:

1. Verify if the API is actually reachable
2. Determine the actual response time
3. Check if the API key is valid
4. Examine the exact response format

This information will help you fix the integration in your Next.js application.
