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
import axios from 'axios';

const ChatBot = ({ alertData }) => {
    const [isOpen, setIsOpen] = useState(false);
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

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen && !hasInitialized.current && alertData) {
            initializeChat();
        }
    };

    const initializeChat = async () => {
        setLoading(true);
        hasInitialized.current = true;
        console.log("Initializing chat. Alert Data:", alertData); // Debug log

        try {
            // Send alert data to n8n to get a summary
            const response = await axios.post(N8N_WEBHOOK_URL, {
                action: 'init',
                alert: alertData,
            });

            if (response.data && response.data.output) {
                setMessages([
                    { sender: 'ai', text: response.data.output },
                ]);
            } else if (typeof response.data === 'string') {
                setMessages([
                    { sender: 'ai', text: response.data },
                ]);
            } else {
                setMessages([
                    { sender: 'ai', text: "Hello! I'm ready to help you with this alert." },
                ]);
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

        try {
            // Send message + history + alert context to n8n
            const response = await axios.post(N8N_WEBHOOK_URL, {
                action: 'chat',
                message: userMessage.text,
                chatHistory: messages.concat(userMessage),
                alertId: alertData?._id,
                alert: alertData, // Include full alert data for context
            });

            let aiResponseText = "I didn't get a response.";
            if (response.data && response.data.output) {
                aiResponseText = response.data.output
            } else if (typeof response.data === 'string') {
                aiResponseText = response.data
            }

            setMessages((prev) => [
                ...prev,
                { sender: 'ai', text: aiResponseText },
            ]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => [
                ...prev,
                { sender: 'ai', text: 'Sorry, something went wrong processing your request.' },
            ]);
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
                    onClick={toggleChat}
                >
                    <CIcon icon={cilChatBubble} size="xl" />
                </CButton>
            )}

            {/* Chat Window */}
            {isOpen && (
                <CCard
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '350px',
                        height: '500px',
                        zIndex: 1050,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <CCardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#321fdb', color: '#fff' }}>
                        <span><strong>AI Assistant</strong></span>
                        <CButton size="sm" color="transparent" style={{ color: '#fff' }} onClick={toggleChat}>
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
                                    {msg.text}
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
