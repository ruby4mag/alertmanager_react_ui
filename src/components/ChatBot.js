import React, { useState, useRef, useEffect } from 'react';
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCardFooter,
    CFormInput,
    CSpinner,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilChatBubble, cilX, cilSend } from '@coreui/icons';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import opsgenieIcon from '../assets/opsgenie-icon.png';
import { useAuth } from '../auth/AuthContext';

const ChatBot = ({ alertData, graphData, isOpen: propIsOpen, onToggle, embedded = false }) => {
    const { getToken } = useAuth();
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    // Determine if controlled or uncontrolled
    // If embedded, it is alwys "open"
    const isControlled = propIsOpen !== undefined;
    const isOpen = embedded ? true : (isControlled ? propIsOpen : internalIsOpen);

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const chatBodyRef = useRef(null);
    const hasInitialized = useRef(false);
    const userScrolledUp = useRef(false);

    // Initial load for embedded: only once when data is available
    useEffect(() => {
        if (embedded && !hasInitialized.current && alertData) {
            initializeChat();
        }
    }, [embedded, alertData]);

    // Use the backend proxy endpoint which injects sessionId before forwarding to n8n
    const CHATBOT_API_URL = 'http://192.168.1.201:8080/api/v1/chatbot';

    const scrollToBottom = (force = false) => {
        if (!chatBodyRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        // Only auto-scroll if user is near bottom or forced
        if (force || isNearBottom || !userScrolledUp.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            userScrolledUp.current = false;
        }
    };

    // Track user scroll behavior
    const handleScroll = () => {
        if (!chatBodyRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        userScrolledUp.current = !isAtBottom;
    };

    useEffect(() => {
        // Only scroll on new messages if user hasn't scrolled up
        scrollToBottom();
    }, [messages]);

    const handleToggle = () => {
        if (isControlled) {
            onToggle && onToggle();
        } else {
            setInternalIsOpen(!internalIsOpen);
        }

        // Initialize on open if not done
        const nextState = isControlled ? !propIsOpen : !internalIsOpen;
        if (nextState && !hasInitialized.current && alertData) {
            initializeChat();
        }
    };

    const initializeChat = async () => {
        setLoading(true);
        hasInitialized.current = true;
        console.log("Initializing chat. Alert Data:", alertData); // Debug log

        // Add a placeholder message for the streaming response
        setMessages([
            { sender: 'ai', text: 'Hello, I am your OpsGenie AI assistant. I will help you analyse this incident. Let me start with gathering some insights.' },
            { sender: 'ai', text: '' }
        ]);

        try {
            const payload = {
                action: 'init',
                alert: alertData,
            };

            if (graphData && graphData.nodes && graphData.nodes.length > 0) {
                payload.graph_data = graphData;
            }

            // Use fetch for streaming support via backend proxy
            const token = getToken();
            const response = await fetch(CHATBOT_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token,
                },
                body: JSON.stringify(payload),
            });

            console.log('Backend response status:', response.status);
            console.log('Backend response headers:', {
                contentType: response.headers.get('content-type'),
                contentEncoding: response.headers.get('content-encoding'),
            });

            if (!response.body) throw new Error('ReadableStream not supported.');

            // Handle gzip-compressed responses
            // Backend sends gzipped data but doesn't set Content-Encoding header
            const contentEncoding = response.headers.get('content-encoding');

            // Read first chunk to detect if it's gzipped (magic bytes: 0x1f 0x8b)
            const tempReader = response.body.getReader();
            const { value: firstChunk, done: firstDone } = await tempReader.read();

            let isGzipped = contentEncoding === 'gzip';

            // Check for gzip magic bytes
            if (!isGzipped && firstChunk && firstChunk.length >= 2) {
                isGzipped = firstChunk[0] === 0x1f && firstChunk[1] === 0x8b;
                console.log('Detected gzip by magic bytes:', isGzipped, 'First bytes:', firstChunk[0], firstChunk[1]);
            }

            // Recreate stream with first chunk included
            let stream = new ReadableStream({
                async start(controller) {
                    if (!firstDone) {
                        controller.enqueue(firstChunk);
                        try {
                            while (true) {
                                const { done, value } = await tempReader.read();
                                if (done) break;
                                controller.enqueue(value);
                            }
                        } finally {
                            controller.close();
                        }
                    } else {
                        controller.close();
                    }
                }
            });

            // Decompress if gzipped
            if (isGzipped) {
                console.log('Decompressing gzip stream...');
                stream = stream.pipeThrough(new DecompressionStream('gzip'));
            }

            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let aiResponseText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                console.log('[INIT] Chunk:', chunk.substring(0, 200));
                // N8N streams JSON objects separated by newlines.
                // We need to parse each line to extract the 'content' field.
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);
                        console.log('[INIT] Parsed JSON:', json);
                        // Access 'content' field based on node output structure
                        if (json.type === 'item' && json.content) {
                            aiResponseText += json.content;
                        } else if (json.type === 'end') {
                            // Stream ended
                        }
                    } catch (e) {
                        // If not JSON, append as raw text (fallback)
                        if (!line.trim().startsWith('{')) {
                            aiResponseText += line;
                        }
                    }
                }

                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg?.sender === 'ai') {
                        lastMsg.text = aiResponseText;
                    }
                    return newMessages;
                });
            }

            // Backward compatibility checks: If response was valid JSON {output: ...}, use that.
            try {
                if (aiResponseText.trim().startsWith('{') && aiResponseText.trim().endsWith('}')) {
                    const json = JSON.parse(aiResponseText);
                    if (json?.output) {
                        setMessages((prev) => {
                            const newMessages = [...prev];
                            const lastMsg = newMessages[newMessages.length - 1];
                            if (lastMsg?.sender === 'ai') {
                                lastMsg.text = json.output;
                            }
                            return newMessages;
                        });
                    }
                }
            } catch (e) {
                // Not JSON, keep raw text which is the expected behavior for streaming
            }

        } catch (error) {
            console.error('Failed to initialize chat:', error);
            setMessages([
                { sender: 'ai', text: "Hello! I'm having trouble connecting to the AI service, but I'm here." },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage = { sender: 'user', text: inputText };
        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        // Add a placeholder message for the streaming response
        setMessages((prev) => [...prev, { sender: 'ai', text: '' }]);

        try {
            // Use fetch for streaming support via backend proxy
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

            if (!response.body) throw new Error('ReadableStream not supported.');

            // Handle gzip-compressed responses
            // Backend sends gzipped data but doesn't set Content-Encoding header
            const contentEncoding = response.headers.get('content-encoding');

            // Read first chunk to detect if it's gzipped (magic bytes: 0x1f 0x8b)
            const tempReader = response.body.getReader();
            const { value: firstChunk, done: firstDone } = await tempReader.read();

            let isGzipped = contentEncoding === 'gzip';

            // Check for gzip magic bytes
            if (!isGzipped && firstChunk && firstChunk.length >= 2) {
                isGzipped = firstChunk[0] === 0x1f && firstChunk[1] === 0x8b;
                console.log('[CHAT] Detected gzip by magic bytes:', isGzipped);
            }

            // Recreate stream with first chunk included
            let stream = new ReadableStream({
                async start(controller) {
                    if (!firstDone) {
                        controller.enqueue(firstChunk);
                        try {
                            while (true) {
                                const { done, value } = await tempReader.read();
                                if (done) break;
                                controller.enqueue(value);
                            }
                        } finally {
                            controller.close();
                        }
                    } else {
                        controller.close();
                    }
                }
            });

            // Decompress if gzipped
            if (isGzipped) {
                console.log('[CHAT] Decompressing gzip stream...');
                stream = stream.pipeThrough(new DecompressionStream('gzip'));
            }

            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let aiResponseText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // N8N streams JSON objects separated by newlines.
                // We need to parse each line to extract the 'content' field.
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);
                        // Access 'content' field based on node output structure
                        if (json.type === 'item' && json.content) {
                            aiResponseText += json.content;
                        } else if (json.type === 'end') {
                            // Stream ended
                        }
                    } catch (e) {
                        // If not JSON, append as raw text (fallback)
                        if (!line.trim().startsWith('{')) {
                            aiResponseText += line;
                        }
                    }
                }

                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg?.sender === 'ai') {
                        lastMsg.text = aiResponseText;
                    }
                    return newMessages;
                });
            }

            // Backward compatibility checks: If response was valid JSON {output: ...}, use that.
            // This prevents breaking existing N8N workflows that return strictly JSON.
            try {
                // Only attempt if it looks like JSON starts/ends
                if (aiResponseText.trim().startsWith('{') && aiResponseText.trim().endsWith('}')) {
                    const json = JSON.parse(aiResponseText);
                    if (json?.output) {
                        setMessages((prev) => {
                            const newMessages = [...prev];
                            const lastMsg = newMessages[newMessages.length - 1];
                            if (lastMsg?.sender === 'ai') {
                                lastMsg.text = json.output;
                            }
                            return newMessages;
                        });
                    }
                }
            } catch (e) {
                // Not JSON, keep raw text which is the expected behavior for streaming
            }

        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg?.sender === 'ai') {
                    lastMsg.text += '\n\n(Error: Request failed)';
                } else {
                    newMessages.push({ sender: 'ai', text: 'Sorry, something went wrong processing your request.' });
                }
                return newMessages;
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Floating Chat Button - Only show if NOT embedded and NOT open */}
            {!embedded && !isOpen && (
                <CButton
                    color="primary"
                    shape="rounded-pill"
                    title="OpsGenie"
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1050,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    }}
                    onClick={handleToggle}
                >
                    <CIcon icon={cilChatBubble} size="xl" />
                </CButton>
            )}

            {/* Chat Window */}
            {isOpen && (
                <CCard
                    style={embedded ? {
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: 'none',
                        boxShadow: 'none'
                    } : {
                        position: 'fixed',
                        top: '20px',
                        bottom: '20px',
                        right: '20px',
                        width: '700px',
                        zIndex: 1050,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <CCardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#321fdb', color: '#fff' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={opsgenieIcon} alt="OpsGenie" style={{ width: '20px', height: '20px' }} />
                            <strong>OpsGenie AI</strong>
                        </span>
                        {!embedded && (
                            <CButton size="sm" color="transparent" style={{ color: '#fff' }} onClick={handleToggle}>
                                <CIcon icon={cilX} />
                            </CButton>
                        )}
                    </CCardHeader>

                    <CCardBody
                        ref={chatBodyRef}
                        onScroll={handleScroll}
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            backgroundColor: '#f8f9fa',
                            padding: '10px'
                        }}
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    marginBottom: '10px',
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: '80%',
                                        padding: '8px 12px',
                                        borderRadius: '12px',
                                        backgroundColor: msg.sender === 'user' ? '#321fdb' : '#e9ecef',
                                        color: msg.sender === 'user' ? '#fff' : '#212529',
                                        fontSize: '0.9rem',
                                        wordWrap: 'break-word',
                                    }}
                                >
                                    <ReactMarkdown
                                        children={msg.text}
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            a: ({ node, ...props }) => <a style={{ color: msg.sender === 'user' ? '#fff' : 'blue' }} target="_blank" rel="noopener noreferrer" {...props} />
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
                                <div
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '12px',
                                        backgroundColor: '#e9ecef',
                                    }}
                                >
                                    <CSpinner size="sm" color="secondary" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </CCardBody>

                    <CCardFooter>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <CFormInput
                                type="text"
                                placeholder="Type a message..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={loading}
                            />
                            <CButton color="primary" onClick={handleSendMessage} disabled={loading || !inputText.trim()}>
                                <CIcon icon={cilSend} />
                            </CButton>
                        </div>
                    </CCardFooter>
                </CCard>
            )}
        </>
    );
};

export default ChatBot;
