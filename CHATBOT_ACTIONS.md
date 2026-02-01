# ChatBot Interactive Actions

## Overview
Implemented interactive actions (buttons, dropdowns) within the ChatBot to allow users to trigger workflows directly from the chat interface (e.g., creating PagerDuty incidents).

## Features

### 1. **Data Driven UI**
The UI renders components dynamically based on the `actions` array in the AI response JSON.
- **Buttons**: Rendered with style options (primary, danger, secondary).
- **Forms/Selects**: Rendered as dropdowns with a submit button.

### 2. **Action Execution**
Clicking an action triggers `handleActionExecute`, which:
- **Clears previous actions**: Removes buttons from the chat history to prevent double-clicking.
- **Sends POST request**: Calls `/api/v1/chatbot` with the action ID and payload.
- **Streams response**: Displays the AI's follow-up in real-time.

### 3. **Payload Structure**
Requests triggered by actions include:
- `action`: The ID of the action (e.g., "create_incident").
- `sessionId`: The alert ID for context.
- `payload`: Any data collected from forms (e.g., selected PagerDuty service).

## Frontend Implementation Details

### `ActionComponent`
A reusable component defined in `ChatBot.js` that renders the appropriate UI element based on `action.type`.

```javascript
// Example Action JSON
{
  "type": "button",
  "label": "Create Incident",
  "action_id": "create_pd",
  "style": "danger"
}
```

### Parsing Logic
Updated `initializeChat`, `handleSendMessage`, and `handleActionExecute` to parse the `actions` field from the streaming JSON response.

```javascript
if (json.actions) {
    aiActions = json.actions;
}
```

### Usage Flow
1. **AI sends structured response** with `actions`.
2. **Frontend renders buttons** below the text.
3. **User clicks button**.
4. **Frontend removes buttons** from the UI.
5. **Frontend appends "Selected Action: ..."** message.
6. **Backend streams next steps** (AI response).

## Files Modified
- `src/components/ChatBot.js`: Added `ActionComponent`, `handleActionExecute`, and updated parsing/rendering.
