# Authentication Fix for ChatBot Proxy

## Issue
When calling `POST http://192.168.1.201:8080/api/v1/chatbot`, the backend returned:
```json
{"error":"Authorization header required"}
```

## Root Cause
The ChatBot component was making unauthenticated requests to the backend proxy endpoint. The backend requires an `Authorization` header with a valid token for all API requests.

## Solution
Added authentication to the ChatBot component by:

1. **Importing AuthContext** (line 17)
   ```javascript
   import { useAuth } from '../auth/AuthContext';
   ```

2. **Getting the token** (line 20)
   ```javascript
   const { getToken } = useAuth();
   ```

3. **Adding Authorization header to init request** (lines 108-114)
   ```javascript
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

4. **Adding Authorization header to chat request** (lines 203-209)
   ```javascript
   const token = getToken();
   const response = await fetch(CHATBOT_API_URL, {
       method: 'POST',
       headers: { 
           'Content-Type': 'application/json',
           'Authorization': token,
       },
       body: JSON.stringify({...}),
   });
   ```

## How It Works

### Token Flow:
```
1. User logs in → Token stored in localStorage
2. AuthContext provides getToken() method
3. ChatBot calls getToken() before each API request
4. Token added to Authorization header
5. Backend validates token
6. Request forwarded to n8n with sessionId injected
```

### Token Storage:
- Token is stored in `localStorage.getItem('token')`
- Managed by `AuthContext` (`src/auth/AuthContext.js`)
- Same authentication mechanism used by all other API calls in the app

## Files Modified
- ✅ `/opt/alertninja/alertmanager_react_ui/src/components/ChatBot.js`
- ✅ `/opt/alertninja/alertmanager_react_ui/CHATBOT_PROXY_INTEGRATION.md` (documentation updated)

## Testing
1. ✅ Verify token is present in localStorage
2. ✅ Check Authorization header is sent in network tab
3. ✅ Confirm backend accepts the request
4. ✅ Verify chatbot initializes successfully

## Status
✅ **FIXED** - ChatBot now includes Authorization header in all requests to the backend proxy
