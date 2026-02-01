# ChatBot Backend Proxy Issue - Garbled Response

## Problem
The chatbot is receiving garbled/binary data from the backend proxy endpoint (`/api/v1/chatbot`), even though the response has `Content-Type: application/json`.

## Symptoms
- Response headers show `Content-Type: application/json`
- Response body contains garbled binary data like: `�������Ḏ�0F�ݧ�N Mb���c�ᦹ�����w]|�...`
- This indicates the backend is not properly handling the n8n streaming response

## Root Cause Analysis

The backend proxy (`/api/v1/chatbot`) is likely doing one of the following incorrectly:

### Scenario 1: Not Decompressing n8n's Response
```go
// WRONG - Backend forwards compressed n8n response without decompressing
resp, _ := http.Post(n8nURL, "application/json", body)
// resp.Body is gzip compressed from n8n
io.Copy(c.Response().Writer, resp.Body) // Sends compressed binary to frontend
```

**Fix needed:**
```go
// CORRECT - Decompress before forwarding
resp, _ := http.Post(n8nURL, "application/json", body)

// Check if response is gzipped
if resp.Header.Get("Content-Encoding") == "gzip" {
    gzipReader, _ := gzip.NewReader(resp.Body)
    defer gzipReader.Close()
    io.Copy(c.Response().Writer, gzipReader) // Forward decompressed data
} else {
    io.Copy(c.Response().Writer, resp.Body)
}
```

### Scenario 2: Not Setting Correct Headers
```go
// WRONG - Not removing Content-Encoding header when forwarding
c.Response().Header().Set("Content-Encoding", "gzip") // Frontend can't decompress
io.Copy(c.Response().Writer, compressedBody)
```

**Fix needed:**
```go
// CORRECT - Don't set Content-Encoding if you're sending uncompressed data
c.Response().Header().Set("Content-Type", "application/json")
// Don't set Content-Encoding header
io.Copy(c.Response().Writer, decompressedBody)
```

### Scenario 3: Not Handling Streaming Correctly
```go
// WRONG - Reading entire response into memory then sending
body, _ := ioutil.ReadAll(resp.Body)
c.JSON(200, body) // Sends binary data as JSON
```

**Fix needed:**
```go
// CORRECT - Stream the response properly
c.Response().Header().Set("Content-Type", "text/event-stream")
c.Response().Header().Set("Cache-Control", "no-cache")
c.Response().Header().Set("Connection", "keep-alive")

flusher, _ := c.Response().Writer.(http.Flusher)
scanner := bufio.NewScanner(resp.Body)
for scanner.Scan() {
    c.Response().Writer.Write(scanner.Bytes())
    c.Response().Writer.Write([]byte("\n"))
    flusher.Flush()
}
```

## Diagnostic Steps

### 1. Check Backend Logs
Look for errors or warnings when proxying to n8n

### 2. Test n8n Directly
```bash
curl -X POST http://192.168.1.201:5678/webhook/alert-chat \
  -H "Content-Type: application/json" \
  -d '{"action":"init","alert":{...}}'
```

Check if n8n returns:
- Compressed data (gzip)?
- Streaming response?
- What Content-Type header?

### 3. Check Backend Proxy Code
Look at `/opt/alertninja/alertmanager_go_api/internal/handlers/chatbot.go`

Specifically check:
- How it forwards the request to n8n
- How it handles the n8n response
- What headers it sets on the response to frontend

## Frontend Workaround (Temporary)

I've added logging to the frontend to help diagnose:

```javascript
console.log('Backend response status:', response.status);
console.log('Backend response headers:', {
    contentType: response.headers.get('content-type'),
    contentEncoding: response.headers.get('content-encoding'),
});
console.log('[INIT] Chunk:', chunk.substring(0, 200));
console.log('[INIT] Parsed JSON:', json);
```

**To test:**
1. Open browser console
2. Open an alert detail page
3. Click the chatbot
4. Check the console logs

This will show:
- What headers the backend is sending
- What the actual response chunks look like
- Whether it's binary data or text

## Expected Behavior

### Correct Flow:
```
Frontend → POST /api/v1/chatbot
    ↓
Backend Proxy:
  1. Adds sessionId from alert.alertid
  2. Forwards to n8n
  3. Receives n8n streaming response
  4. Decompresses if needed
  5. Streams back to frontend (uncompressed)
    ↓
Frontend:
  1. Receives text stream
  2. Parses JSON lines
  3. Extracts content
  4. Displays to user
```

### Current (Broken) Flow:
```
Frontend → POST /api/v1/chatbot
    ↓
Backend Proxy:
  1. Adds sessionId
  2. Forwards to n8n
  3. Receives compressed response
  4. ❌ Forwards compressed data without decompressing
    ↓
Frontend:
  1. Receives binary/compressed data
  2. ❌ Can't parse as JSON
  3. ❌ Displays garbled text
```

## Solution

**The backend proxy needs to be fixed to properly handle the n8n streaming response.**

Specifically in `/opt/alertninja/alertmanager_go_api/internal/handlers/chatbot.go`:

1. Check if n8n response is gzip compressed
2. Decompress if needed
3. Stream the decompressed data to frontend
4. Set correct headers (no Content-Encoding: gzip)

## Files to Check/Modify

### Backend (needs fixing):
- `/opt/alertninja/alertmanager_go_api/internal/handlers/chatbot.go`

### Frontend (diagnostic logging added):
- `/opt/alertninja/alertmanager_react_ui/src/components/ChatBot.js`

## Next Steps

1. ✅ Added frontend logging to diagnose the issue
2. ⏳ Check backend chatbot.go implementation
3. ⏳ Fix backend to properly decompress/stream n8n response
4. ⏳ Test end-to-end flow
5. ⏳ Remove frontend diagnostic logging once fixed
