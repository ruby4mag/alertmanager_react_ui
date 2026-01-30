# PagerDuty Integration - Backend API Requirements

## Overview
This document outlines the backend API endpoints required to support the PagerDuty Service and Escalation Policy fields in the Notify Rules form.

## Required Backend Endpoints

### 1. Get PagerDuty Services
**Endpoint:** `GET /api/pagerduty/services`

**Description:** Returns a list of all available PagerDuty services that can be assigned to notify rules.

**Request:**
```http
GET /api/pagerduty/services
Authorization: Bearer <token>
```

**Expected Response:**
```json
[
  {
    "id": "PXXXXXX",
    "name": "Production API Service",
    "description": "Main production API service"
  },
  {
    "id": "PYYYYYY",
    "name": "Database Service",
    "description": "Database monitoring service"
  },
  {
    "id": "PZZZZZZ",
    "name": "Frontend Service",
    "description": "Frontend application service"
  }
]
```

**Response Fields:**
- `id` (string, required): Unique identifier for the PagerDuty service
- `name` (string, required): Display name of the service
- `description` (string, optional): Description of the service

**Status Codes:**
- `200 OK`: Successfully retrieved services
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error

---

### 2. Get PagerDuty Escalation Policies
**Endpoint:** `GET /api/pagerduty/escalation-policies`

**Description:** Returns a list of all available PagerDuty escalation policies that can be assigned to notify rules.

**Request:**
```http
GET /api/pagerduty/escalation-policies
Authorization: Bearer <token>
```

**Expected Response:**
```json
[
  {
    "id": "EXXXXXX",
    "name": "Critical Alerts - On-Call Team",
    "description": "Escalation for critical production alerts"
  },
  {
    "id": "EYYYYYY",
    "name": "Standard Escalation",
    "description": "Standard escalation path"
  },
  {
    "id": "EZZZZZZ",
    "name": "Database Team Escalation",
    "description": "Escalation for database issues"
  }
]
```

**Response Fields:**
- `id` (string, required): Unique identifier for the escalation policy
- `name` (string, required): Display name of the escalation policy
- `description` (string, optional): Description of the escalation policy

**Status Codes:**
- `200 OK`: Successfully retrieved escalation policies
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server error

---

## Updated Notify Rule Endpoints

### 3. Create Notify Rule (Updated)
**Endpoint:** `POST /api/notifyrules`

**Description:** Creates a new notify rule with optional PagerDuty configuration.

**Request Body:**
```json
{
  "rulename": "Critical Production Alerts",
  "ruledescription": "Notify on critical production issues",
  "ruleobject": "(Entity = 'production-api' and Severity = 'critical')",
  "payload": "{\"message\": \"Alert triggered\"}",
  "endpoint": "https://webhook.example.com/notify",
  "pagerduty_service": "PXXXXXX",
  "pagerduty_escalation_policy": "EXXXXXX"
}
```

**New Fields:**
- `pagerduty_service` (string, optional): ID of the PagerDuty service
- `pagerduty_escalation_policy` (string, optional): ID of the PagerDuty escalation policy

---

### 4. Update Notify Rule (Updated)
**Endpoint:** `PUT /api/notifyrules/{id}`

**Description:** Updates an existing notify rule with optional PagerDuty configuration.

**Request Body:**
```json
{
  "rulename": "Critical Production Alerts",
  "ruledescription": "Notify on critical production issues",
  "ruleobject": "(Entity = 'production-api' and Severity = 'critical')",
  "payload": "{\"message\": \"Alert triggered\"}",
  "endpoint": "https://webhook.example.com/notify",
  "pagerduty_service": "PXXXXXX",
  "pagerduty_escalation_policy": "EXXXXXX"
}
```

**New Fields:**
- `pagerduty_service` (string, optional): ID of the PagerDuty service
- `pagerduty_escalation_policy` (string, optional): ID of the PagerDuty escalation policy

---

### 5. Get Notify Rule (Updated)
**Endpoint:** `GET /api/notifyrules/{id}`

**Description:** Retrieves a specific notify rule including PagerDuty configuration.

**Expected Response:**
```json
{
  "id": "123",
  "rulename": "Critical Production Alerts",
  "ruledescription": "Notify on critical production issues",
  "ruleobject": "{\"combinator\":\"and\",\"rules\":[{\"field\":\"Entity\",\"operator\":\"=\",\"value\":\"production-api\"}]}",
  "payload": "{\"message\": \"Alert triggered\"}",
  "endpoint": "https://webhook.example.com/notify",
  "pagerduty_service": "PXXXXXX",
  "pagerduty_escalation_policy": "EXXXXXX",
  "created_at": "2026-01-30T10:00:00Z",
  "updated_at": "2026-01-30T12:00:00Z"
}
```

**New Fields in Response:**
- `pagerduty_service` (string, nullable): ID of the PagerDuty service
- `pagerduty_escalation_policy` (string, nullable): ID of the PagerDuty escalation policy

---

## Implementation Notes

### Backend Implementation Checklist:
1. **Database Schema Updates:**
   - Add `pagerduty_service` column (VARCHAR/TEXT, nullable) to the notify rules table
   - Add `pagerduty_escalation_policy` column (VARCHAR/TEXT, nullable) to the notify rules table

2. **PagerDuty API Integration:**
   - Implement PagerDuty API client to fetch services and escalation policies
   - Store PagerDuty API credentials securely (API key/token)
   - Consider caching the services and escalation policies to reduce API calls
   - Handle PagerDuty API rate limits appropriately

3. **Error Handling:**
   - Handle cases where PagerDuty API is unavailable
   - Validate that provided service/policy IDs exist in PagerDuty
   - Provide meaningful error messages to the frontend

4. **Optional Enhancements:**
   - Add a background job to periodically sync PagerDuty services and policies
   - Store service/policy names locally for faster lookups
   - Add validation to ensure selected service/policy still exists in PagerDuty

### PagerDuty API Reference:
- **List Services:** `GET https://api.pagerduty.com/services`
- **List Escalation Policies:** `GET https://api.pagerduty.com/escalation_policies`
- **Authentication:** Use PagerDuty API token in header: `Authorization: Token token=<YOUR_API_TOKEN>`

### Example PagerDuty API Calls:

**Get Services:**
```bash
curl -X GET \
  'https://api.pagerduty.com/services' \
  -H 'Authorization: Token token=YOUR_API_TOKEN' \
  -H 'Accept: application/vnd.pagerduty+json;version=2'
```

**Get Escalation Policies:**
```bash
curl -X GET \
  'https://api.pagerduty.com/escalation_policies' \
  -H 'Authorization: Token token=YOUR_API_TOKEN' \
  -H 'Accept: application/vnd.pagerduty+json;version=2'
```

---

## Frontend Changes Summary

The following files have been updated to support PagerDuty integration:

1. **`/opt/alertninja/alertmanager_react_ui/src/views/rule/notifyrule/New.js`**
   - Added PagerDuty Service dropdown
   - Added PagerDuty Escalation Policy dropdown
   - Fetches data from backend on component mount
   - Sends selected values when creating a new rule

2. **`/opt/alertninja/alertmanager_react_ui/src/views/rule/notifyrule/Edit.js`**
   - Added PagerDuty Service dropdown
   - Added PagerDuty Escalation Policy dropdown
   - Loads existing values when editing a rule
   - Sends updated values when saving changes

3. **`/opt/alertninja/alertmanager_react_ui/src/views/rule/notifyrule/View.js`**
   - Added read-only PagerDuty Service dropdown
   - Added read-only PagerDuty Escalation Policy dropdown
   - Displays selected values when viewing a rule

All dropdowns are populated dynamically from the backend and include a default "Select a service/policy" option.

The services and escalation policies are stored in the mongo collection called pagerduty_services and pagerduty_escalation_policies respectively.

The sample document in the collection is as follows:

{
  "_id": {
    "$oid": "697cdfc1d2d032b1d9a7d1f7"
  },
  "ep_name": "SN:IT-Apps-MVP-ITES",
  "ep_id": "P02SNEP"
}

and {
  "_id": {
    "$oid": "697cde59d2d032b1d9a7d1ed"
  },
  "service_name": "SN: Jira Application",
  "service_id": "PJV72JW"
}