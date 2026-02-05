import { useState, useEffect, useRef } from 'react';
import { HiChat, HiPaperAirplane, HiUser, HiRefresh } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PromoterChat = () => {
    const [manager, setManager] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchManager();
    }, []);

    useEffect(() => {
        if (manager) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
            return () => clearInterval(interval);
        }
    }, [manager]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchManager = async () => {
        try {
            // Get current user info to find their manager
            const meRes = await api.get('/auth/me');
            const managerId = meRes.data.user?.createdBy;

            if (!managerId) {
                setLoading(false);
                return;
            }

            // Get manager details
            const managerRes = await api.get(`/users/${managerId}`);
            setManager(managerRes.data.user);
        } catch (error) {
            console.log('Failed to fetch manager:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        if (!manager) return;
        try {
            const res = await api.get(`/messages/${manager._id}`);
            setMessages(res.data.messages || []);
        } catch (error) {
            console.log('Failed to fetch messages');
        }
    };

    const sendMessage = async (e, quickMessage = null) => {
        e?.preventDefault();
        const content = quickMessage || newMessage.trim();
        if (!content || !manager) return;

        setSending(true);
        try {
            const res = await api.post(`/messages/${manager._id}`, { content });
            setMessages([...messages, res.data.message]);
            setNewMessage('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        }
        setSending(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="page flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!manager) {
        return (
            <div className="page">
                <div className="page-header">
                    <h1><HiChat style={{ color: 'var(--brand-primary)' }} /> Messages</h1>
                </div>
                <div className="card flex flex-col items-center justify-center p-8 text-center" style={{ minHeight: '400px' }}>
                    <HiUser size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                    <h2>No Manager Assigned</h2>
                    <p className="text-muted">You haven't been assigned to a manager yet. Please contact support.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page chat-page">
            <div className="page-header">
                <h1>
                    <HiChat style={{ color: 'var(--brand-primary)' }} />
                    Messages
                </h1>
                <p>Chat with your manager</p>
            </div>

            <div className="chat-container-single">
                {/* Chat Panel */}
                <div className="chat-panel">
                    <div className="chat-header">
                        <div className="chat-user-info">
                            <div className="chat-avatar">
                                {manager.name[0].toUpperCase()}
                            </div>
                            <div>
                                <h4>{manager.name}</h4>
                                <span className="text-muted text-sm">{manager.email}</span>
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={fetchMessages}>
                            <HiRefresh />
                        </button>
                    </div>

                    <div className="messages-container">
                        {messages.length === 0 ? (
                            <div className="no-messages">
                                <HiChat size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                                <p className="text-muted">No messages yet. Start a conversation with your manager!</p>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <div
                                    key={msg._id || i}
                                    className={`message ${msg.sender?._id === manager._id ? 'received' : 'sent'}`}
                                >
                                    <div className="message-content">{msg.content}</div>
                                    <div className="message-time">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="message-input-form" onSubmit={sendMessage}>
                        <input
                            type="text"
                            className="input"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!newMessage.trim() || sending}
                        >
                            {sending ? <div className="spinner-sm"></div> : <HiPaperAirplane />}
                        </button>
                    </form>
                </div>
            </div>

            <style>{`
                .chat-page {
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 60px);
                }

                .chat-container-single {
                    flex: 1;
                    display: flex;
                    min-height: 0;
                }

                .chat-panel {
                    flex: 1;
                    background: var(--bg-card);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .chat-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .chat-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: var(--brand-gradient);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.1rem;
                }

                .chat-user-info {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .chat-user-info h4 {
                    margin: 0;
                }

                .messages-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .no-messages {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }

                .message {
                    max-width: 70%;
                    padding: 0.75rem 1rem;
                    border-radius: var(--radius-lg);
                }

                .message.sent {
                    align-self: flex-end;
                    background: var(--brand-primary);
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .message.received {
                    align-self: flex-start;
                    background: var(--bg-tertiary);
                    border-bottom-left-radius: 4px;
                }

                .message-content {
                    word-break: break-word;
                }

                .message-time {
                    font-size: 0.7rem;
                    opacity: 0.7;
                    margin-top: 0.25rem;
                }

                .quick-actions {
                    border-top: 1px solid var(--border-color);
                    background: var(--bg-secondary);
                    padding: 0.75rem;
                }

                .quick-actions-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    font-size: 0.85rem;
                }

                .quick-actions-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .quick-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .quick-action-btn:hover {
                    background: var(--primary-50);
                    border-color: var(--brand-primary);
                    color: var(--brand-primary);
                }

                .quick-action-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .message-input-form {
                    display: flex;
                    gap: 0.75rem;
                    padding: 1rem;
                    border-top: 1px solid var(--border-color);
                }

                .message-input-form .input {
                    flex: 1;
                }

                .spinner-sm {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .message {
                        max-width: 85%;
                    }
                }
            `}</style>
        </div>
    );
};

export default PromoterChat;
