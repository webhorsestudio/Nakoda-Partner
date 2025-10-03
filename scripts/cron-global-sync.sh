#!/bin/bash

# Global Order Sync Cron Job
# This script calls the Global Sync API every 5 minutes
# Run this script with: chmod +x cron-global-sync.sh && ./cron-global-sync.sh

# Configuration
API_URL="https://yourdomain.com/api/orders/global-sync"
LOG_FILE="/var/log/nakoda-global-sync.log"
ERROR_LOG="/var/log/nakoda-global-sync-error.log"
MAX_RETRIES=3
RETRY_DELAY=30

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$ERROR_LOG"
}

# Function to perform sync
perform_sync() {
    local attempt=1
    
    while [ $attempt -le $MAX_RETRIES ]; do
        log_message "Attempting global sync (attempt $attempt/$MAX_RETRIES)"
        
        # Make the API call
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -H "User-Agent: Nakoda-Global-Sync-Cron/1.0" \
            --max-time 30 \
            "$API_URL")
        
        # Extract HTTP status code
        http_code=$(echo "$response" | tail -n1)
        response_body=$(echo "$response" | head -n -1)
        
        if [ "$http_code" -eq 200 ]; then
            log_message "Global sync successful: $response_body"
            return 0
        else
            log_error "Global sync failed with HTTP $http_code: $response_body"
            
            if [ $attempt -lt $MAX_RETRIES ]; then
                log_message "Retrying in $RETRY_DELAY seconds..."
                sleep $RETRY_DELAY
            fi
        fi
        
        attempt=$((attempt + 1))
    done
    
    log_error "Global sync failed after $MAX_RETRIES attempts"
    return 1
}

# Main execution
log_message "Starting global sync cron job"
perform_sync
exit_code=$?

if [ $exit_code -eq 0 ]; then
    log_message "Global sync cron job completed successfully"
else
    log_error "Global sync cron job failed"
fi

exit $exit_code
