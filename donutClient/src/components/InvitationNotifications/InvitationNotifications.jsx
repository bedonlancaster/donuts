import { useState, useEffect } from 'react';
import { getAuthHeaders } from '../../utils/auth';
import './InvitationNotifications.css';

function InvitationNotifications({ isOpen, onClose, onInvitationAccepted }) {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [respondingTo, setRespondingTo] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchInvitations();
        }
    }, [isOpen]);

    const fetchInvitations = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/invitations/received/pending', {
                method: 'GET',
                headers: getAuthHeaders(),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setInvitations(data);
            } else {
                setError('Failed to load invitations');
            }
        } catch (err) {
            console.error('Error fetching invitations:', err);
            setError('Network error loading invitations');
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (invitationId, accept) => {
        setRespondingTo(invitationId);
        setError('');

        try {
            const response = await fetch(`http://localhost:5000/api/invitations/${invitationId}/respond`, {
                method: 'POST',
                headers: getAuthHeaders(),
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ accept })
            });

            if (response.ok) {
                // Remove the invitation from the list
                setInvitations(invitations.filter(inv => inv.id !== invitationId));

                // If accepted, notify parent and close the window
                if (accept) {
                    onInvitationAccepted?.();
                    onClose();
                }
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to respond to invitation');
            }
        } catch (err) {
            console.error('Error responding to invitation:', err);
            setError('Network error responding to invitation');
        } finally {
            setRespondingTo(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="notifications-overlay" onClick={onClose}>
            <div className="notifications-panel" onClick={(e) => e.stopPropagation()}>
                <div className="notifications-header">
                    <h2>Invitations</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="notifications-body">
                    {loading ? (
                        <div className="loading-text">Loading invitations...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : invitations.length === 0 ? (
                        <div className="empty-state">
                            <p>No new invitations at this time</p>
                        </div>
                    ) : (
                        <div className="invitations-list">
                            {invitations.map(invitation => (
                                <div key={invitation.id} className="invitation-item">
                                    <div className="invitation-header">
                                        <div className="project-artwork">
                                            {invitation.projectArtworkUrl ? (
                                                <img
                                                    src={`http://localhost:5000${invitation.projectArtworkUrl}`}
                                                    alt={invitation.projectTitle}
                                                />
                                            ) : (
                                                <div className="artwork-placeholder">🍩</div>
                                            )}
                                        </div>
                                        <div className="invitation-info">
                                            <div className="project-title">{invitation.projectTitle}</div>
                                            <div className="invited-by">
                                                from <strong>{invitation.invitedByFullName}</strong> (@{invitation.invitedByUserName})
                                            </div>
                                            {invitation.message && (
                                                <div className="invitation-message">"{invitation.message}"</div>
                                            )}
                                            <div className="invitation-date">
                                                {new Date(invitation.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="invitation-actions">
                                        <button
                                            className="decline-button"
                                            onClick={() => handleRespond(invitation.id, false)}
                                            disabled={respondingTo === invitation.id}
                                        >
                                            {respondingTo === invitation.id ? 'Declining...' : 'Decline'}
                                        </button>
                                        <button
                                            className="accept-button"
                                            onClick={() => handleRespond(invitation.id, true)}
                                            disabled={respondingTo === invitation.id}
                                        >
                                            {respondingTo === invitation.id ? 'Accepting...' : 'Accept'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InvitationNotifications;
