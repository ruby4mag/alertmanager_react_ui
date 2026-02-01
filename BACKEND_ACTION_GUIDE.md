# Backend Implementation Guide for ChatBot Actions

Since the ChatBot logic is driven by n8n (or your backend service), you need to update your workflow to handle the new `action` and `payload` fields sent by the frontend.

## 1. Request Structure

The frontend now sends the following JSON payload to your webhook:

```json
{
  "action": "action_id",       // e.g., "init", "create_incident", "submit_form"
  "sessionId": "alert_123",    // The Alert ID
  "alert": { ... },            // Verify full alert objects
  "payload": {                 // Optional data from forms
    "pd_service": "P12345",
    "priority": "P1"
  },
  "message": "..."             // User text (if type is chat)
}
```

## 2. n8n Workflow Instructions

You should update your n8n workflow to route logic based on the `action` field.

### Step-by-Step Logic:

1.  **Webhook Node**: Receives the POST request.
2.  **Switch Node**: Route based on `{{$json.body.action}}`.
    *   **Case `chat`**: Standard RAG/LLM chat flow.
    *   **Case `init`**: Generate initial summary and Greeting.
    *   **Case `create_incident`** (Example):
        *   Take `{{$json.body.sessionId}}` and `{{$json.body.alert}}`.
        *   Call PagerDuty API / Create Incident using **PagerDuty Node**.
        *   Return a stream response confirming creation.
    *   **Case `execute_action`**:
        *   Use `{{$json.body.payload}}` to perform specific tasks.

### 3. Sending Actions to Frontend

To display buttons in the ChatBot, your n8n response (final Code node or Stream) should include an `actions` array in the JSON stream.

**Example Response for "Greeting":**
```javascript
return {
  "type": "item",
  "content": "I can help you manage this incident. What would you like to do?",
  "actions": [
    {
      "type": "button",
      "label": "Create PagerDuty Incident",
      "action_id": "init_pd_creation",
      "style": "primary"
    },
    {
      "type": "button",
      "label": "Analyze Root Cause",
      "action_id": "analyze_rca",
      "style": "secondary"
    }
  ]
}
```

**Example Response for "Form":**
```javascript
return {
  "type": "item",
  "content": "Please select the service:",
  "actions": [
    {
      "type": "select",
      "key": "pd_service_id",
      "label": "Select Service",
      "options": [
        { "label": "Database Ops", "value": "P123" },
        { "label": "Frontend Ops", "value": "P456" }
      ],
      "action_id": "submit_pd_creation"
    }
  ]
}
```

## 3. Go Backend Changes (Optional)

The Go backend (ChatbotProxy) already proxies the full JSON body, so **no code changes are strictly required** for it to support passing the `action` and `payload` to n8n.

However, you can add logging to `internal/handlers/chatbot.go` to debug incoming actions:

```go
// Inside ChatbotProxy
action, _ := requestBody["action"].(string)
log.Printf("Received Action: %s", action)
```
