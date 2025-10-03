# External Service Configuration for Global Order Sync
# This file contains configurations for various external services that can call our API

## Option 1: Uptime Robot (Free - 5 minute intervals)
# Website: https://uptimerobot.com/
# 
# Setup:
# 1. Create account at UptimeRobot
# 2. Add new monitor
# 3. Monitor Type: HTTP(s)
# 4. URL: https://yourdomain.com/api/orders/global-sync
# 5. Method: POST
# 6. Monitoring Interval: 5 minutes
# 7. Save monitor

## Option 2: Pingdom (Paid - 1 minute intervals)
# Website: https://www.pingdom.com/
#
# Setup:
# 1. Create Pingdom account
# 2. Add new check
# 3. Check Type: HTTP
# 4. URL: https://yourdomain.com/api/orders/global-sync
# 5. Method: POST
# 6. Check Interval: 5 minutes
# 7. Save check

## Option 3: StatusCake (Free tier available)
# Website: https://www.statuscake.com/
#
# Setup:
# 1. Create StatusCake account
# 2. Add new test
# 3. Test Type: HTTP
# 4. Website URL: https://yourdomain.com/api/orders/global-sync
# 5. Request Method: POST
# 6. Check Rate: 5 minutes
# 7. Save test

## Option 4: Cron-job.org (Free)
# Website: https://cron-job.org/
#
# Setup:
# 1. Create account at cron-job.org
# 2. Create new cron job
# 3. Title: Nakoda Global Sync
# 4. URL: https://yourdomain.com/api/orders/global-sync
# 5. Method: POST
# 6. Schedule: */5 * * * * (every 5 minutes)
# 7. Save job

## Option 5: EasyCron (Free tier available)
# Website: https://www.easycron.com/
#
# Setup:
# 1. Create EasyCron account
# 2. Add new cron job
# 3. Job Name: Nakoda Global Sync
# 4. URL: https://yourdomain.com/api/orders/global-sync
# 5. HTTP Method: POST
# 6. Cron Expression: */5 * * * * (every 5 minutes)
# 7. Save job

## Option 6: GitHub Actions (Free for public repos)
# Create file: .github/workflows/global-sync.yml
#
# name: Global Order Sync
# on:
#   schedule:
#     - cron: '*/5 * * * *'  # Every 5 minutes
# jobs:
#   sync:
#     runs-on: ubuntu-latest
#     steps:
#       - name: Call Global Sync API
#         run: |
#           curl -X POST \
#             -H "Content-Type: application/json" \
#             -H "User-Agent: GitHub-Actions-Global-Sync/1.0" \
#             https://yourdomain.com/api/orders/global-sync

## Option 7: Railway Cron Jobs (If using Railway)
# Add to railway.json:
# {
#   "cron": {
#     "global-sync": {
#       "schedule": "*/5 * * * *",
#       "command": "curl -X POST https://yourdomain.com/api/orders/global-sync"
#     }
#   }
# }

## Option 8: Render Cron Jobs (If using Render)
# Create a new Cron Job service:
# 1. Name: nakoda-global-sync
# 2. Command: curl -X POST https://yourdomain.com/api/orders/global-sync
# 3. Schedule: */5 * * * *
# 4. Deploy

## Recommended Setup:
# For production, use UptimeRobot (free) or GitHub Actions (if repo is public)
# For development, use local cron job or Vercel cron jobs
