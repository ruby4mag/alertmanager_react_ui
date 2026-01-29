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

const ChatBot = ({ alertData, graphData, isOpen: propIsOpen, onToggle }) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    // Determine if controlled or uncontrolled
    const isControlled = propIsOpen !== undefined;
    const isOpen = isControlled ? propIsOpen : internalIsOpen;

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const hasInitialized = useRef(false);

    // Replace this with your actual n8n webhook URL
    // Use the proxy path defined in vite.config.mjs
    const N8N_WEBHOOK_URL = 'http://192.168.1.201:5678/webhook/alert-chat';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

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
            const alertPayload = { ...alertData };
            if (graphData && graphData.nodes && graphData.nodes.length > 0) {
                alertPayload.graph_data = graphData;
            }

            // Use fetch for streaming support
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'init',
                    alert: alertPayload,
                }),
            });

            if (!response.body) throw new Error('ReadableStream not supported.');

            const reader = response.body.getReader();
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
            // Use fetch for streaming support
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'chat',
                    message: userMessage.text,
                    chatHistory: messages.concat(userMessage),
                    alertId: alertData?._id,
                    alert: alertData,
                }),
            });

            if (!response.body) throw new Error('ReadableStream not supported.');

            const reader = response.body.getReader();
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
            {/* Floating Chat Button */}
            {!isOpen && (
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
                    style={{
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
                        <span><strong>OpsGenie AI</strong></span>
                        <CButton size="sm" color="transparent" style={{ color: '#fff' }} onClick={handleToggle}>
                            <CIcon icon={cilX} />
                        </CButton>
                    </CCardHeader>

                    <CCardBody style={{
                        flex: 1,
                        overflowY: 'auto',
                        backgroundColor: '#f8f9fa',
                        padding: '10px'
                    }}>
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
