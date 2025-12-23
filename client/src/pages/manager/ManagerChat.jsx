import { useState, useEffect, useRef } from 'react';
import { HiChat, HiPaperAirplane, HiUser, HiArrowLeft, HiRefresh } from 'react-icons/hi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ManagerChat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser._id);
            const interval = setInterval(() => fetchMessages(selectedUser._id), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            // Get promoters for new conversations
            const promotersRes = await api.get('/users?role=promoter');
            const promoters = promotersRes.data.users || [];

            // Get existing conversations
            try {
                const convoRes = await api.get('/messages/conversations');
                const existingConvos = convoRes.data.conversations || [];

                // Merge: existing conversations + promoters without conversations
                const convoUserIds = existingConvos.map(c => c.user?._id?.toString());
                const newPromoters = promoters.filter(p => !convoUserIds.includes(p._id));

                setConversations([
                    ...existingConvos,
                    ...newPromoters.map(p => ({
                        user: p,
                        lastMessage: null,
                        unreadCount: 0
                    }))
                ]);
            } catch {
                // No conversations yet, just show promoters
                setConversations(promoters.map(p => ({
                    user: p,
                    lastMessage: null,
                    unreadCount: 0
                })));
            }
        } catch (error) {
            toast.error('Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const res = await api.get(`/messages/${userId}`);
            setMessages(res.data.messages || []);
        } catch (error) {
            console.log('Failed to fetch messages');
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        setSending(true);
        try {
            const res = await api.post(`/messages/${selectedUser._id}`, {
                content: newMessage.trim()
            });
            setMessages([...messages, res.data.message]);
            setNewMessage('');
            fetchConversations(); // Refresh conversation list
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

    return (
        <div className="page chat-page">
            <div className="page-header">
                <h1>
                    <HiChat style={{ color: 'var(--brand-primary)' }} />
                    Messages
                </h1>
                <p>Chat with your promoters</p>
            </div>

            <div className="chat-container">
                {/* Conversations List */}
                <div className={`conversations-panel ${selectedUser ? 'mobile-hidden' : ''}`}>
                    <div className="panel-header">
                        <h3>Promoters</h3>
                        <button className="btn btn-ghost btn-sm" onClick={fetchConversations}>
                            <HiRefresh />
                        </button>
                    </div>
                    <div className="conversations-list">
                        {conversations.length === 0 ? (
                            <div className="empty-state">
                                <HiUser size={32} />
                                <p>No promoters yet</p>
                            </div>
                        ) : (
                            conversations.map((conv, i) => (
                                <div
                                    key={conv.user?._id || i}
                                    className={`conversation-item ${selectedUser?._id === conv.user?._id ? 'active' : ''}`}
                                    onClick={() => setSelectedUser(conv.user)}
                                >
                                    <div className="conv-avatar">
                                        {(conv.user?.name || 'U')[0].toUpperCase()}
                                    </div>
                                    <div className="conv-info">
                                        <div className="conv-name">
                                            {conv.user?.name || 'Unknown'}
                                            {conv.unreadCount > 0 && (
                                                <span className="unread-badge">{conv.unreadCount}</span>
                                            )}
                                        </div>
                                        {conv.lastMessage && (
                                            <div className="conv-preview">
                                                {conv.lastMessage.isMine ? 'You: ' : ''}
                                                {conv.lastMessage.content.substring(0, 30)}...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Panel */}
                <div className={`chat-panel ${!selectedUser ? 'mobile-hidden' : ''}`}>
                    {!selectedUser ? (
                        <div className="no-chat-selected">
                            <HiChat size={48} />
                            <h3>Select a promoter to start chatting</h3>
                            <p className="text-muted">Choose from the list on the left</p>
                        </div>
                    ) : (
                        <>
                            <div className="chat-header">
                                <button className="btn btn-ghost mobile-only" onClick={() => setSelectedUser(null)}>
                                    <HiArrowLeft />
                                </button>
                                <div className="chat-user-info">
                                    <div className="chat-avatar">
                                        {selectedUser.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h4>{selectedUser.name}</h4>
                                        <span className="text-muted text-sm">{selectedUser.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="messages-container">
                                {messages.length === 0 ? (
                                    <div className="no-messages">
                                        <p className="text-muted">No messages yet. Send the first message!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, i) => (
                                        <div
                                            key={msg._id || i}
                                            className={`message ${msg.sender?._id === selectedUser._id ? 'received' : 'sent'}`}
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
                        </>
                    )}
                </div>
            </div>

            <style>{`
                .chat-page {
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 60px);
                }

                .chat-container {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 1rem;
                    min-height: 0;
                }

                .conversations-panel {
                    background: var(--bg-card);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .panel-header h3 { margin: 0; }

                .conversations-list {
                    flex: 1;
                    overflow-y: auto;
                }

                .conversation-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 1rem;
                    cursor: pointer;
                    transition: background var(--transition-fast);
                    border-bottom: 1px solid var(--border-color);
                }

                .conversation-item:hover { background: var(--bg-tertiary); }
                .conversation-item.active { background: var(--primary-50); }

                .conv-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--brand-gradient);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                }

                .conv-info { flex: 1; min-width: 0; }
                .conv-name { font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }
                .conv-preview { font-size: 0.85rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                .unread-badge {
                    background: var(--brand-primary);
                    color: white;
                    font-size: 0.7rem;
                    padding: 0.15rem 0.4rem;
                    border-radius: 10px;
                }

                .chat-panel {
                    background: var(--bg-card);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .no-chat-selected {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-muted);
                    gap: 0.5rem;
                }

                .chat-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
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

                .chat-user-info { display: flex; align-items: center; gap: 0.75rem; }
                .chat-user-info h4 { margin: 0; }

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
                    align-items: center;
                    justify-content: center;
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

                .message-content { word-break: break-word; }
                .message-time { font-size: 0.7rem; opacity: 0.7; margin-top: 0.25rem; }

                .message-input-form {
                    display: flex;
                    gap: 0.75rem;
                    padding: 1rem;
                    border-top: 1px solid var(--border-color);
                }

                .message-input-form .input { flex: 1; }

                .spinner-sm {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                .empty-state {
                    padding: 2rem;
                    text-align: center;
                    color: var(--text-muted);
                }

                .mobile-only { display: none; }

                @media (max-width: 768px) {
                    .chat-container { grid-template-columns: 1fr; }
                    .mobile-hidden { display: none !important; }
                    .mobile-only { display: flex; }
                }
            `}</style>
        </div>
    );
};

export default ManagerChat;
