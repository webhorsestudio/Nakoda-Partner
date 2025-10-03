#!/bin/bash

# Quick Test Script for Global Sync API
# This script tests the global sync functionality

# Configuration
API_URL="https://yourdomain.com/api/orders/global-sync"
MONITOR_URL="https://yourdomain.com/api/orders/global-sync-monitor"

echo "🧪 Testing Global Sync API..."
echo "================================"

# Test 1: Basic API endpoint
echo "Test 1: Basic API endpoint"
echo "URL: $API_URL"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL")
http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

echo "HTTP Status: $http_code"
if [ "$http_code" -eq 200 ]; then
    echo "✅ Basic API test passed"
    echo "Response: $response_body"
else
    echo "❌ Basic API test failed"
    echo "Response: $response_body"
fi

echo ""

# Test 2: Monitoring endpoint
echo "Test 2: Monitoring endpoint"
echo "URL: $MONITOR_URL"
response=$(curl -s -w "\n%{http_code}" "$MONITOR_URL")
http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

echo "HTTP Status: $http_code"
if [ "$http_code" -eq 200 ]; then
    echo "✅ Monitoring API test passed"
    echo "Response: $response_body"
else
    echo "❌ Monitoring API test failed"
    echo "Response: $response_body"
fi

echo ""

# Test 3: Manual sync via monitoring endpoint
echo "Test 3: Manual sync via monitoring endpoint"
echo "URL: $MONITOR_URL (POST)"
response=$(curl -s -w "\n%{http_code}" -X POST "$MONITOR_URL")
http_code=$(echo "$response" | tail -n1)
response_body=$(echo "$response" | head -n -1)

echo "HTTP Status: $http_code"
if [ "$http_code" -eq 200 ]; then
    echo "✅ Manual sync test passed"
    echo "Response: $response_body"
else
    echo "❌ Manual sync test failed"
    echo "Response: $response_body"
fi

echo ""
echo "🎯 Test completed!"
echo "If all tests passed, your Global Sync API is working correctly."
echo "You can now set up the cron job using one of the methods in the setup guide."
