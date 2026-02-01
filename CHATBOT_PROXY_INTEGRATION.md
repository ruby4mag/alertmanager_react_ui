# Frontend ChatBot Proxy Integration

## Overview
Updated the ChatBot component to use the backend proxy endpoint (`/api/v1/chatbot`) instead of calling n8n directly. This enables the backend to inject the `sessionId` (derived from the incident's `alertid`) before forwarding requests to n8n, allowing Redis-based conversation context management.

## Changes Made

### File: `/opt/alertninja/alertmanager_react_ui/src/components/ChatBot.js`

#### 1. Updated API Endpoint (Line 41-42)
**Before:**
```javascript
const N8N_WEBHOOK_URL = 'http://192.168.1.201:5678/webhook/alert-chat';
```

**After:**
```javascript
const CHATBOT_API_URL = 'http://192.168.1.201:8080/api/v1/chatbot';
```

**Rationale:** 
- Routes chatbot requests through the backend proxy
- Backend extracts `alert.alertid` and injects it as `sessionId`
- Enables Redis-based session management in n8n workflow

---

#### 2. Added Authentication (Lines 17, 20)
**Added:**
```javascript
import { useAuth } from '../auth/AuthContext';

const ChatBot = ({ alertData, graphData, isOpen: propIsOpen, onToggle, embedded = false }) => {
    const { getToken } = useAuth();
    // ...
}
```

**Rationale:**
- Backend requires authentication via Authorization header
- Uses the same auth mechanism as other API calls in the application
- Token is retrieved from localStorage via AuthContext

---

#### 3. Updated Init Payload Structure (Lines 95-116)
**Before:**
```javascript
const alertPayload = { ...alertData };
if (graphData && graphData.nodes && graphData.nodes.length > 0) {
    alertPayload.graph_data = graphData;
}

const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        action: 'init',
        alert: alertPayload,
    }),
});
```

**After:**
```javascript
const payload = {
    action: 'init',
    alert: alertData,
};

if (graphData && graphData.nodes && graphData.nodes.length > 0) {
    payload.graph_data = graphData;
}

const token = getToken();
const response = await fetch(CHATBOT_API_URL, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': token,
    },
    body: JSON.stringify(payload),
});
```

**Rationale:**
- `graph_data` is now a top-level field (not nested inside `alert`)
- Cleaner payload structure matching backend expectations
- Backend can easily extract and forward all fields to n8n
- **Authorization header included** for authenticated requests

---

#### 4. Updated Chat Message Endpoint (Lines 202-217)
**Before:**
```javascript
const response = await fetch(N8N_WEBHOOK_URL, {
```

**After:**
```javascript
const token = getToken();
const response = await fetch(CHATBOT_API_URL, {
    method: 'POST',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': token,
    },
    body: JSON.stringify({
        action: 'chat',
        message: userMessage.text,
        chatHistory: messages.concat(userMessage),
        alertId: alertData?._id,
        alert: alertData,
    }),
});
```

**Rationale:**
- Ensures follow-up chat messages also go through the backend proxy
- Maintains consistent sessionId across the entire conversation
- **Authorization header included** for authenticated requests

---

## How It Works

### Request Flow:
```
Frontend (ChatBot.js)
    ↓ POST /api/v1/chatbot
Backend Proxy (chatbot.go)
    ↓ Extracts alert.alertid
    ↓ Injects sessionId
    ↓ POST to n8n webhook
n8n Workflow
    ↓ Uses sessionId for Redis context
    ↓ Streams response back
Backend Proxy
    ↓ Forwards stream
Frontend (ChatBot.js)
    ↓ Displays AI response
```

### Example Payload Sent to Backend:
```json
{
  "action": "init",
  "alert": {
    "alertid": "INC-2026-001",
    "entity": "db-prod-01",
    "severity": "critical",
    ...
  },
  "graph_data": {
    "nodes": [...],
    "edges": [...]
  }
}
```

### Backend Transforms to:
```json
{
  "action": "init",
  "sessionId": "INC-2026-001",  // ← Injected by backend
  "alert": {
    "alertid": "INC-2026-001",
    ...
  },
  "graph_data": {
    "nodes": [...],
    "edges": [...]
  }
}
```

### n8n Workflow Can Now:
```javascript
// Store context in Redis
const sessionId = $json.sessionId;
await redis.set(`rca:session:${sessionId}`, JSON.stringify({
  alert_id: $json.alert.alertid,
  graph_data: $json.graph_data,
  conversation_history: []
}), 'EX', 3600);

// Retrieve context for follow-up questions
const context = await redis.get(`rca:session:${sessionId}`);
```

---

## Benefits

✅ **Session Isolation**: Each incident has its own conversation context  
✅ **Stateful Conversations**: Follow-up questions can reference previous context  
✅ **Centralized Logic**: SessionId injection handled in one place (backend)  
✅ **No Breaking Changes**: Existing n8n workflows continue to work  
✅ **Scalability**: Redis provides fast, distributed session storage  
✅ **Security**: Backend can add authentication/validation before forwarding  

---

## Testing

### 1. Test Chat Initialization
```javascript
// Open alert detail page
// Click on chatbot
// Verify initial message loads
// Check browser console for any errors
```

### 2. Verify Backend Receives Request
```bash
# Check backend logs for:
# "Received chatbot request"
# "Extracted sessionId: INC-XXXX"
# "Forwarding to n8n..."
```

### 3. Verify n8n Receives sessionId
```javascript
// In n8n workflow, log the incoming payload:
console.log('SessionId:', $json.sessionId);
console.log('Alert ID:', $json.alert.alertid);
```

### 4. Test Follow-up Questions
```javascript
// Send a message in the chat
// Verify it uses the same sessionId
// Check that context is maintained across messages
```

---

## Next Steps

1. ✅ **Frontend Updated** - ChatBot now uses backend proxy
2. ⏳ **Test Integration** - Verify end-to-end flow works
3. ⏳ **Update n8n Workflow** - Implement Redis session management
4. ⏳ **Add Error Handling** - Handle backend/n8n failures gracefully
5. ⏳ **Add Session Cleanup** - Implement TTL or manual cleanup logic

---

## Rollback Plan

If issues arise, revert to direct n8n calls:

```javascript
// In ChatBot.js, change line 42 back to:
const N8N_WEBHOOK_URL = 'http://192.168.1.201:5678/webhook/alert-chat';

// And update fetch calls to use N8N_WEBHOOK_URL instead of CHATBOT_API_URL
```

---

## Files Modified

- ✅ `/opt/alertninja/alertmanager_react_ui/src/components/ChatBot.js`

## Files NOT Modified (No Changes Needed)

- `/opt/alertninja/alertmanager_react_ui/vite.config.mjs` - Proxy config can remain for future use
- Other components - No dependencies on ChatBot internals
