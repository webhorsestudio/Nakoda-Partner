# Global Order Sync Monitoring Dashboard
# This script provides monitoring capabilities for the global sync system

#!/bin/bash

# Configuration
API_URL="https://yourdomain.com/api/orders/global-sync-monitor"
LOG_FILE="/var/log/nakoda-sync-monitor.log"
ALERT_EMAIL="admin@yourdomain.com"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to send alert email
send_alert() {
    local subject="$1"
    local message="$2"
    
    echo "$message" | mail -s "$subject" "$ALERT_EMAIL" 2>/dev/null || \
    echo "Failed to send email alert: $subject"
}

# Function to check sync health
check_sync_health() {
    log_message "Checking global sync health..."
    
    response=$(curl -s -w "\n%{http_code}" "$API_URL")
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        log_message "✅ Sync health check passed"
        
        # Parse response to check if sync is running
        if echo "$response_body" | grep -q '"isRunning":true'; then
            log_message "✅ Global sync is running"
        else
            log_message "⚠️ Global sync is not running"
            send_alert "Global Sync Alert" "Global sync is not running. Please check the system."
        fi
        
        # Check last sync time
        last_sync=$(echo "$response_body" | grep -o '"lastSync":"[^"]*"' | cut -d'"' -f4)
        if [ -n "$last_sync" ]; then
            log_message "📅 Last sync: $last_sync"
        fi
        
    else
        log_message "❌ Sync health check failed with HTTP $http_code"
        send_alert "Global Sync Alert" "Global sync health check failed with HTTP $http_code"
    fi
}

# Function to test sync manually
test_sync() {
    log_message "Testing global sync manually..."
    
    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL")
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq 200 ]; then
        log_message "✅ Manual sync test successful"
        echo "$response_body" | jq '.' 2>/dev/null || echo "$response_body"
    else
        log_message "❌ Manual sync test failed with HTTP $http_code"
        echo "$response_body"
    fi
}

# Function to show sync statistics
show_stats() {
    log_message "Fetching sync statistics..."
    
    response=$(curl -s "$API_URL")
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
}

# Main menu
case "$1" in
    "health")
        check_sync_health
        ;;
    "test")
        test_sync
        ;;
    "stats")
        show_stats
        ;;
    "monitor")
        # Continuous monitoring
        while true; do
            check_sync_health
            sleep 300  # Check every 5 minutes
        done
        ;;
    *)
        echo "Usage: $0 {health|test|stats|monitor}"
        echo ""
        echo "Commands:"
        echo "  health  - Check sync health status"
        echo "  test    - Test sync manually"
        echo "  stats   - Show sync statistics"
        echo "  monitor - Start continuous monitoring"
        exit 1
        ;;
esac
