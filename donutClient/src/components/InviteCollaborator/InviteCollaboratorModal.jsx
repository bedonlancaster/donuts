import { useState, useEffect } from 'react';
import { getAuthHeaders } from '../../utils/auth';
import './InviteCollaboratorModal.css';

function InviteCollaboratorModal({ projectId, isOpen, onClose, onInviteSent }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');

    // Queue mode: if projectId is null, we're queuing invitations rather than sending immediately
    const isQueueMode = projectId === null;

    // Search for users when query changes
    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            setSearching(true);
            try {
                const response = await fetch(`http://localhost:5000/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
                    method: 'GET',
                    headers: getAuthHeaders(),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const users = await response.json();
                    setSearchResults(users);
                } else {
                    setError('Failed to search users');
                }
            } catch (err) {
                console.error('Error searching users:', err);
                setError('Network error searching users');
            } finally {
                setSearching(false);
            }
        };

        const debounceTimer = setTimeout(searchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleSendInvite = async () => {
        if (!selectedUser) return;

        // If in queue mode, just return the invitation data to parent
        if (isQueueMode) {
            const invitation = {
                invitedUserId: selectedUser.id,
                username: selectedUser.userName,
                fullName: selectedUser.fullName,
                message
            };
            onInviteSent?.(invitation);
            handleClose();
            return;
        }

        // Normal mode: send invitation immediately
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/invitations/send', {
                method: 'POST',
                headers: getAuthHeaders(),
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    projectId,
                    invitedUserId: selectedUser.id,
                    message
                })
            });

            if (response.ok) {
                onInviteSent?.();
                handleClose();
            } else {
                const errorData = await response.json();
                setError(errorData.message || errorData || 'Failed to send invitation');
            }
        } catch (err) {
            console.error('Error sending invitation:', err);
            setError('Network error sending invitation');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedUser(null);
        setMessage('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isQueueMode ? 'Queue Collaborator Invitation' : 'Invite Collaborator'}</h2>
                    <button className="modal-close" onClick={handleClose}>×</button>
                </div>

                <div className="modal-body">
                    {!selectedUser ? (
                        <>
                            <div className="search-section">
                                <label>Search for a user</label>
                                <input
                                    className="form-input"
                                    type="text"
                                    placeholder="Username, first name, or last name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="search-results">
                                {searching && <div className="loading-text">Searching...</div>}
                                {searchResults.length > 0 && !searching && (
                                    <div className="results-list">
                                        {searchResults.map(user => (
                                            <div
                                                key={user.id}
                                                className="user-result"
                                                onClick={() => setSelectedUser(user)}
                                            >
                                                <div className="user-avatar">
                                                    {user.profileImageUrl ? (
                                                        <img src={`http://localhost:5000${user.profileImageUrl}`} alt={user.fullName} />
                                                    ) : (
                                                        <div className="avatar-placeholder">
                                                            {user.firstName[0]}{user.lastName[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="user-info">
                                                    <div className="user-name">{user.fullName}</div>
                                                    <div className="user-username">@{user.userName}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
                                    <div className="no-results">No users found</div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="selected-user-section">
                                <label>Inviting:</label>
                                <div className="selected-user">
                                    <div className="user-avatar">
                                        {selectedUser.profileImageUrl ? (
                                            <img src={`http://localhost:5000${selectedUser.profileImageUrl}`} alt={selectedUser.fullName} />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="user-info">
                                        <div className="user-name">{selectedUser.fullName}</div>
                                        <div className="user-username">@{selectedUser.userName}</div>
                                    </div>
                                    <button
                                        className="change-user-button"
                                        onClick={() => setSelectedUser(null)}
                                    >
                                        Change
                                    </button>
                                </div>
                            </div>

                            <div className="message-section">
                                <label>Add a message (optional)</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Collab on this DONUT with me..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={3}
                                    maxLength={500}
                                />
                                <div className="char-count">{message.length}/500</div>
                            </div>
                        </>
                    )}

                    {error && <div className="modal-error">{error}</div>}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-theme-secondary" onClick={handleClose}>
                        Cancel
                    </button>
                    {selectedUser && (
                        <button
                            className="btn btn-theme-primary"
                            onClick={handleSendInvite}
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : isQueueMode ? 'Queue Invite' : 'Send Invite'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InviteCollaboratorModal;
