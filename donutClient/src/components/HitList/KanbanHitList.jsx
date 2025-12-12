import React, { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAudioPlayer } from '../../context/AudioPlayerContext'
import './KanbanHitList.css'

// Category constants - no emojis, use theme colors
const CATEGORIES = {
    0: { name: 'General' },
    2: { name: 'Production' },
    3: { name: 'Mixing' },
    4: { name: 'Mastering' },
    5: { name: 'Songwriting' }
}

// Priority constants - simplified
const PRIORITIES = {
    1: { name: 'Low', level: 1 },
    2: { name: 'Mid', level: 2 },
    3: { name: 'High', level: 3 },
    4: { name: 'Crit', level: 4 }
}

// Card Component
function Card({ item, onEdit, onDelete, onMarkDone, onSave, onUpdateItem, onAddBulletPoint, onUpdateBulletPoint, onRemoveBulletPoint, focusKey, setFocusKey, updateItemField, onOpenComments }) {
    const [showCategoryDropdown, setShowCategoryDropdown] = React.useState(false)
    const dropdownRef = React.useRef(null)
    const category = CATEGORIES[item.category] || CATEGORIES[0]
    const priority = PRIORITIES[item.priority] || PRIORITIES[2]

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowCategoryDropdown(false)
            }
        }

        if (showCategoryDropdown) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }
    }, [showCategoryDropdown])

    return (
        <div className="kanban-card">
            {item.isEditing ? (
                <div className="card-edit-mode">
                    <input
                        type="text"
                        className="subject-input"
                        placeholder="Subject/Topic..."
                        value={item.subject}
                        onChange={(e) => onUpdateItem(item.id, 'subject', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                            if (e.key === 'Tab' && !e.shiftKey) {
                                e.preventDefault()
                                setFocusKey(`${item.id}-0`)
                            } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                e.preventDefault()
                                onSave(item)
                            } else if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
                                e.preventDefault()
                                setFocusKey(`${item.id}-0`)
                            }
                        }}
                        autoFocus={item.isNew}
                        data-item-id={item.id}
                    />

                    <div className="bullet-points">
                        {item.bulletPoints.map((bullet, bulletIndex) => (
                            <div key={bulletIndex} className="bullet-point-input">
                                <span className="bullet">•</span>
                                <input
                                    type="text"
                                    placeholder="Add a point..."
                                    value={bullet}
                                    onChange={(e) => onUpdateBulletPoint(item.id, bulletIndex, e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey) {
                                            e.preventDefault()
                                            if (bullet.trim()) {
                                                onAddBulletPoint(item.id)
                                            }
                                        } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                            e.preventDefault()
                                            onSave(item)
                                        }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    ref={(input) => {
                                        if (focusKey === `${item.id}-${bulletIndex}` && input) {
                                            setTimeout(() => {
                                                input.focus()
                                                setFocusKey(null)
                                            }, 0)
                                        }
                                    }}
                                />
                                {item.bulletPoints.length > 1 && (
                                    <button
                                        className="remove-bullet-btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onRemoveBulletPoint(item.id, bulletIndex)
                                        }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            className="add-bullet-btn"
                            onClick={(e) => {
                                e.stopPropagation()
                                onAddBulletPoint(item.id)
                            }}
                        >
                            + Add point
                        </button>
                    </div>

                    <div className="card-actions">
                        <button
                            className="save-btn"
                            onClick={(e) => {
                                e.stopPropagation()
                                onSave(item)
                            }}
                            disabled={!item.subject.trim()}
                        >
                            Save
                        </button>
                        <button
                            className="cancel-btn"
                            onClick={(e) => {
                                e.stopPropagation()
                                // If it's a new item with no content, delete it
                                if (item.isNew && !item.subject.trim()) {
                                    onDelete(item.id)
                                } else {
                                    onUpdateItem(item.id, 'isEditing', false)
                                }
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="card-display-mode" onClick={() => {
                    // Only allow comments on saved items (not temp IDs)
                    if (typeof item.id === 'string' && item.id.startsWith('temp-')) {
                        alert('Please save this item before adding comments')
                        return
                    }
                    onOpenComments(item)
                }}>
                    <h4 className="card-title">{item.subject}</h4>

                    {item.bulletPoints.filter(b => b.trim()).length > 0 && (
                        <ul className="bullet-list">
                            {item.bulletPoints.filter(bullet => bullet.trim()).map((bullet, index) => (
                                <li key={index}>{bullet}</li>
                            ))}
                        </ul>
                    )}

                    <div className="card-footer">
                        <div className="card-badges">
                            <div className="category-badge-wrapper" ref={dropdownRef}>
                                <span
                                    className="category-badge clickable"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowCategoryDropdown(!showCategoryDropdown)
                                    }}
                                    title="Click to change category"
                                >
                                    {category.name}
                                </span>
                                {showCategoryDropdown && (
                                    <div className="category-dropdown">
                                        {Object.entries(CATEGORIES).map(([key, cat]) => (
                                            <div
                                                key={key}
                                                className={`category-option ${parseInt(key) === item.category ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    const newCategory = parseInt(key)
                                                    onUpdateItem(item.id, 'category', newCategory)
                                                    updateItemField(item.id, 'category', newCategory)
                                                    setShowCategoryDropdown(false)
                                                }}
                                            >
                                                {cat.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <span
                                className={`priority-badge priority-${priority.level} clickable`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    const priorities = Object.keys(PRIORITIES).map(k => parseInt(k))
                                    const currentIndex = priorities.indexOf(item.priority)
                                    const nextIndex = (currentIndex + 1) % priorities.length
                                    onUpdateItem(item.id, 'priority', priorities[nextIndex])
                                    updateItemField(item.id, 'priority', priorities[nextIndex])
                                }}
                                title="Click to change priority"
                            >
                                {priority.name}
                            </span>
                        </div>
                        <div className="card-controls">
                            <button
                                className="done-btn"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onMarkDone(item.id)
                                }}
                                title="Mark as done"
                            >
                                Done
                            </button>
                            <button
                                className="edit-btn"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onEdit(item.id)
                                }}
                            >
                                Edit
                            </button>
                            <button
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(item.id)
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Comments Modal Component
function CommentsModal({ item, onClose }) {
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    const [editingCommentId, setEditingCommentId] = useState(null)
    const [editText, setEditText] = useState('')

    // Fetch current user info
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/auth/me', {
                    credentials: 'include'
                })
                if (response.ok) {
                    const user = await response.json()
                    setCurrentUser(user)
                }
            } catch (err) {
                console.error('Error fetching current user:', err)
            }
        }
        fetchCurrentUser()
    }, [])

    useEffect(() => {
        // Don't try to fetch comments for unsaved items
        if (typeof item.id === 'string' && item.id.startsWith('temp-')) {
            setIsLoading(false)
            setError('Item must be saved before adding comments')
            return
        }

        console.log('Fetching comments for item:', item.id, 'Item object:', item)

        const fetchComments = async () => {
            try {
                setIsLoading(true)
                setError(null)
                const response = await fetch(`http://localhost:5000/api/hitlistitems/${item.id}/comments`, {
                    credentials: 'include'
                })

                console.log('Comments fetch response:', response.status, 'for item:', item.id)

                if (!response.ok) {
                    // If it's a 404 or similar, just show empty comments
                    console.warn('Could not fetch comments:', response.status, 'Item ID:', item.id)
                    setComments([])
                    return
                }

                const data = await response.json()
                setComments(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error('Error fetching comments:', err)
                // Don't show error for network issues, just show empty state
                setComments([])
            } finally {
                setIsLoading(false)
            }
        }

        fetchComments()
    }, [item.id])

    const handleAddComment = async () => {
        if (!newComment.trim()) return

        // Don't allow adding comments to unsaved items
        if (typeof item.id === 'string' && item.id.startsWith('temp-')) {
            alert('Please save this item before adding comments')
            return
        }

        try {
            const response = await fetch(`http://localhost:5000/api/hitlistitems/${item.id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ text: newComment })
            })

            if (!response.ok) {
                throw new Error('Failed to add comment')
            }

            const comment = await response.json()
            setComments([...comments, comment])
            setNewComment('')
        } catch (err) {
            console.error('Error adding comment:', err)
            alert('Failed to add comment. Please try again.')
        }
    }

    const handleEditComment = async (commentId) => {
        if (!editText.trim()) return

        try {
            const response = await fetch(`http://localhost:5000/api/hitlistitems/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ text: editText })
            })

            if (!response.ok) {
                throw new Error('Failed to update comment')
            }

            const updatedComment = await response.json()
            setComments(comments.map(c => c.id === commentId ? updatedComment : c))
            setEditingCommentId(null)
            setEditText('')
        } catch (err) {
            console.error('Error updating comment:', err)
            alert('Failed to update comment. Please try again.')
        }
    }

    const handleDeleteComment = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) return

        try {
            const response = await fetch(`http://localhost:5000/api/hitlistitems/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (!response.ok) {
                throw new Error('Failed to delete comment')
            }

            setComments(comments.filter(c => c.id !== commentId))
        } catch (err) {
            console.error('Error deleting comment:', err)
            alert('Failed to delete comment. Please try again.')
        }
    }

    const startEditingComment = (comment) => {
        setEditingCommentId(comment.id)
        setEditText(comment.text)
    }

    const cancelEditing = () => {
        setEditingCommentId(null)
        setEditText('')
    }

    const category = CATEGORIES[item.category] || CATEGORIES[0]
    const priority = PRIORITIES[item.priority] || PRIORITIES[2]

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-section">
                        <h2>{item.subject}</h2>
                        <div className="modal-badges">
                            <span className="category-badge-small">{category.name}</span>
                            <span className={`priority-badge priority-${priority.level}`}>{priority.name}</span>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {item.bulletPoints.filter(b => b.trim()).length > 0 && (
                        <div className="modal-description">
                            <h3>Details</h3>
                            <ul className="bullet-list">
                                {item.bulletPoints.filter(b => b.trim()).map((bullet, index) => (
                                    <li key={index}>{bullet}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="modal-comments">
                        <h3>Comments ({isLoading ? '...' : comments.length})</h3>

                        {isLoading ? (
                            <p className="no-comments">Loading comments...</p>
                        ) : (
                            <>
                                <div className="comments-list">
                                    {comments.length === 0 ? (
                                        <p className="no-comments">No comments yet. Be the first to comment!</p>
                                    ) : (
                                        comments.map(comment => {
                                            const isOwnComment = currentUser && comment.author.id === currentUser.id
                                            const isEditing = editingCommentId === comment.id

                                            return (
                                                <div key={comment.id} className="comment">
                                                    <div className="comment-header">
                                                        <strong>{comment.author.username}</strong>
                                                        <span className="comment-time">
                                                            {new Date(comment.createdAt).toLocaleString()}
                                                            {comment.updatedAt && ' (edited)'}
                                                        </span>
                                                    </div>

                                                    {isEditing ? (
                                                        <div className="comment-edit-mode">
                                                            <textarea
                                                                className="comment-edit-textarea"
                                                                value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                                        e.preventDefault()
                                                                        handleEditComment(comment.id)
                                                                    } else if (e.key === 'Escape') {
                                                                        cancelEditing()
                                                                    }
                                                                }}
                                                                autoFocus
                                                            />
                                                            <div className="comment-edit-actions">
                                                                <button
                                                                    className="comment-save-btn"
                                                                    onClick={() => handleEditComment(comment.id)}
                                                                    disabled={!editText.trim()}
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    className="comment-cancel-btn"
                                                                    onClick={cancelEditing}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="comment-text">{comment.text}</p>
                                                            {isOwnComment && (
                                                                <div className="comment-actions">
                                                                    <button
                                                                        className="comment-edit-btn"
                                                                        onClick={() => startEditingComment(comment)}
                                                                        title="Edit comment"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        className="comment-delete-btn"
                                                                        onClick={() => handleDeleteComment(comment.id)}
                                                                        title="Delete comment"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>

                                <div className="add-comment">
                                    <textarea
                                        placeholder="Add a comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                                e.preventDefault()
                                                handleAddComment()
                                            }
                                        }}
                                    />
                                    <button
                                        className="add-comment-btn"
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                    >
                                        Add Comment
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function KanbanHitList({ projectId, trackId, allTracks, currentTrackIndex, onNavigateTrack }) {
    const { currentTheme } = useTheme()
    const { currentTrack, isPlaying, togglePlayPause, playTrack } = useAudioPlayer()
    const [items, setItems] = useState([])
    const [currentPlayingTrack, setCurrentPlayingTrack] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [focusKey, setFocusKey] = useState(null)
    const [showCompletedStack, setShowCompletedStack] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedPriority, setSelectedPriority] = useState('all')
    const [sortBy, setSortBy] = useState('sortOrder') // sortOrder, priority, created
    const [selectedItem, setSelectedItem] = useState(null) // For comments modal

    const isTrackLevel = trackId !== undefined
    const apiEndpoint = isTrackLevel
        ? `http://localhost:5000/api/hitlistitems/track/${trackId}`
        : `http://localhost:5000/api/hitlistitems/project/${projectId}`

    // Fetch current track data for play button
    useEffect(() => {
        if (isTrackLevel && trackId) {
            const fetchTrack = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/tracks/${trackId}`, {
                        credentials: 'include'
                    })
                    if (response.ok) {
                        const track = await response.json()
                        setCurrentPlayingTrack(track)
                    }
                } catch (err) {
                    console.error('Error fetching track:', err)
                }
            }
            fetchTrack()
        }
    }, [trackId, isTrackLevel])

    const handlePlayTrack = () => {
        if (currentPlayingTrack) {
            if (currentTrack?.id === currentPlayingTrack.id && isPlaying) {
                togglePlayPause()
            } else {
                playTrack(currentPlayingTrack)
            }
        }
    }

    // Global keyboard listener for Enter to create new item
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only trigger if no input is focused and Enter is pressed
            if (e.key === 'Enter' && !e.target.matches('input, textarea, select, button')) {
                addNewItem()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [items])

    // Load hit list items from backend
    useEffect(() => {
        const fetchHitListItems = async () => {
            try {
                const response = await fetch(apiEndpoint, {
                    credentials: 'include'
                })

                if (response.ok) {
                    const data = await response.json()
                    const convertedItems = data.map(item => ({
                        id: item.id,
                        subject: item.title,
                        bulletPoints: item.description
                            ? item.description.split('\n').filter(point => point.trim())
                            : [''],
                        isEditing: false,
                        priority: item.priority,
                        status: item.status,
                        category: item.category,
                        sortOrder: item.sortOrder
                    }))
                    setItems(convertedItems)
                }
            } catch (error) {
                console.error('Error fetching hit list items:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (projectId || trackId) {
            fetchHitListItems()
        }
    }, [apiEndpoint, projectId, trackId])

    // Filter and sort items
    const filterAndSortItems = (itemList) => {
        let filtered = itemList

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item => item.category === parseInt(selectedCategory))
        }

        // Filter by priority
        if (selectedPriority !== 'all') {
            filtered = filtered.filter(item => item.priority === parseInt(selectedPriority))
        }

        // Sort items
        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === 'priority') {
                return b.priority - a.priority // High to low
            } else if (sortBy === 'created') {
                return a.id - b.id // Oldest first
            }
            // Default: sortOrder
            return a.sortOrder - b.sortOrder
        })

        return sorted
    }

    const doingItems = filterAndSortItems(items.filter(item => item.status !== 3))
    const doneItems = items.filter(item => item.status === 3)
    const completionRate = items.length > 0
        ? Math.round((doneItems.length / items.length) * 100)
        : 0

    const addNewItem = () => {
        const tempId = `temp-${Date.now()}`
        const newItem = {
            id: tempId,
            subject: '',
            bulletPoints: [''],
            isEditing: true,
            isNew: true,
            status: 1,
            priority: 2,
            category: 0,
            sortOrder: items.length
        }

        setItems([newItem, ...items])
    }

    const updateItem = (itemId, field, value) => {
        setItems(items.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
        ))
    }

    const addBulletPoint = (itemId) => {
        setItems(items.map(item =>
            item.id === itemId
                ? { ...item, bulletPoints: [...item.bulletPoints, ''] }
                : item
        ))
        const newIndex = items.find(item => item.id === itemId)?.bulletPoints.length || 0
        setFocusKey(`${itemId}-${newIndex}`)
    }

    const updateBulletPoint = (itemId, bulletIndex, value) => {
        setItems(items.map(item =>
            item.id === itemId
                ? {
                    ...item,
                    bulletPoints: item.bulletPoints.map((bullet, index) =>
                        index === bulletIndex ? value : bullet
                    )
                }
                : item
        ))
    }

    const removeBulletPoint = (itemId, bulletIndex) => {
        setItems(items.map(item =>
            item.id === itemId
                ? {
                    ...item,
                    bulletPoints: item.bulletPoints.filter((_, index) => index !== bulletIndex)
                }
                : item
        ))
    }

    const saveItem = async (item) => {
        const bulletPointsText = item.bulletPoints.filter(point => point.trim()).join('\n')

        // Don't save if subject is empty
        if (!item.subject.trim()) {
            // Remove the item if it's new and has no content
            if (item.isNew) {
                setItems(items.filter(i => i.id !== item.id))
            }
            return
        }

        try {
            if (item.isNew) {
                // Create new item
                const response = await fetch('http://localhost:5000/api/hitlistitems', {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: item.subject,
                        description: bulletPointsText,
                        projectId: parseInt(projectId),
                        trackId: trackId ? parseInt(trackId) : null,
                        priority: item.priority,
                        category: item.category,
                        status: item.status
                    })
                })

                if (response.ok) {
                    const savedItem = await response.json()
                    setItems(items.map(i =>
                        i.id === item.id
                            ? {
                                ...i,
                                id: savedItem.id,
                                isEditing: false,
                                isNew: false,
                                sortOrder: savedItem.sortOrder
                            }
                            : i
                    ))

                    // Focus next editing item
                    focusNextEditingItem(item.id)
                }
            } else {
                // Update existing item
                const response = await fetch(`http://localhost:5000/api/hitlistitems/${item.id}`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: item.subject,
                        description: bulletPointsText,
                        status: item.status,
                        category: item.category,
                        priority: item.priority
                    })
                })

                if (response.ok) {
                    setItems(items.map(i =>
                        i.id === item.id ? { ...i, isEditing: false } : i
                    ))

                    // Focus next editing item
                    focusNextEditingItem(item.id)
                }
            }
        } catch (error) {
            console.error('Error saving item:', error)
        }
    }

    const focusNextEditingItem = (currentItemId) => {
        // Find the next item that is in editing mode
        const currentIndex = items.findIndex(i => i.id === currentItemId)
        const nextEditingItem = items
            .slice(currentIndex + 1)
            .find(i => i.isEditing && i.status !== 3)

        if (nextEditingItem) {
            // Focus on the subject input of the next editing item
            setTimeout(() => {
                const nextInput = document.querySelector(`input[data-item-id="${nextEditingItem.id}"]`)
                if (nextInput) {
                    nextInput.focus()
                }
            }, 100)
        }
    }

    const markItemDone = async (itemId) => {
        const item = items.find(i => i.id === itemId)

        try {
            const bulletPointsText = item.bulletPoints.filter(point => point.trim()).join('\n')
            const response = await fetch(`http://localhost:5000/api/hitlistitems/${itemId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: item.subject,
                    description: bulletPointsText,
                    status: 3
                })
            })

            if (response.ok) {
                setItems(items.map(i =>
                    i.id === itemId ? { ...i, status: 3, isEditing: false } : i
                ))
            }
        } catch (error) {
            console.error('Error marking item done:', error)
        }
    }

    const moveBackToDoing = async (itemId) => {
        const item = items.find(i => i.id === itemId)

        try {
            const bulletPointsText = item.bulletPoints.filter(point => point.trim()).join('\n')
            const response = await fetch(`http://localhost:5000/api/hitlistitems/${itemId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: item.subject,
                    description: bulletPointsText,
                    status: 1
                })
            })

            if (response.ok) {
                setItems(items.map(i =>
                    i.id === itemId ? { ...i, status: 1 } : i
                ))
            }
        } catch (error) {
            console.error('Error moving item back to doing:', error)
        }
    }

    const removeItem = async (itemId) => {
        const item = items.find(i => i.id === itemId)

        if (item && !item.isNew) {
            try {
                const response = await fetch(`http://localhost:5000/api/hitlistitems/${itemId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                })

                if (!response.ok) return
            } catch (error) {
                console.error('Error deleting item:', error)
                return
            }
        }

        setItems(items.filter(item => item.id !== itemId))
    }

    const editItem = (itemId) => {
        setItems(items.map(item =>
            item.id === itemId ? { ...item, isEditing: true } : item
        ))
    }

    const updateItemField = async (itemId, field, value) => {
        const item = items.find(i => i.id === itemId)
        if (!item || item.isNew) return

        try {
            const bulletPointsText = item.bulletPoints.filter(point => point.trim()).join('\n')
            const response = await fetch(`http://localhost:5000/api/hitlistitems/${itemId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: item.subject,
                    description: bulletPointsText,
                    status: field === 'status' ? value : item.status,
                    category: field === 'category' ? value : item.category,
                    priority: field === 'priority' ? value : item.priority
                })
            })

            if (response.ok) {
                setItems(items.map(i =>
                    i.id === itemId ? { ...i, [field]: value } : i
                ))
            }
        } catch (error) {
            console.error(`Error updating ${field}:`, error)
        }
    }

    if (isLoading) {
        return <div className="kanban-loading">Loading...</div>
    }

    const cycleCategory = () => {
        // Exclude General (0) from filter options - those live in "All"
        const categories = ['all', '2', '3', '4', '5']
        const currentIndex = categories.indexOf(selectedCategory)
        const nextIndex = (currentIndex + 1) % categories.length
        setSelectedCategory(categories[nextIndex])
    }

    const cyclePriority = () => {
        const priorities = ['all', ...Object.keys(PRIORITIES)]
        const currentIndex = priorities.indexOf(selectedPriority)
        const nextIndex = (currentIndex + 1) % priorities.length
        setSelectedPriority(priorities[nextIndex])
    }

    const cycleSortBy = () => {
        const sortOptions = ['sortOrder', 'priority', 'created']
        const currentIndex = sortOptions.indexOf(sortBy)
        const nextIndex = (currentIndex + 1) % sortOptions.length
        setSortBy(sortOptions[nextIndex])
    }

    const getCategoryLabel = () => {
        if (selectedCategory === 'all') return 'All'
        if (selectedCategory === '0') return 'All' // General items show in All
        return CATEGORIES[selectedCategory]?.name || 'All'
    }

    const getPriorityLabel = () => {
        if (selectedPriority === 'all') return 'All'
        return PRIORITIES[selectedPriority]?.name || 'All'
    }

    const getSortByLabel = () => {
        if (sortBy === 'sortOrder') return 'Custom Order'
        if (sortBy === 'priority') return 'Priority'
        if (sortBy === 'created') return 'Date Created'
        return 'Custom Order'
    }

    return (
        <div className="kanban-hitlist">
            {/* Filters and Sorting */}
            <div className="kanban-filters">
                <div className="filter-group">
                    <label>Category:</label>
                    <button
                        className="filter-cycle-btn"
                        onClick={(e) => {
                            if (e.metaKey || e.ctrlKey) {
                                setSelectedCategory('all')
                            } else {
                                cycleCategory()
                            }
                        }}
                        title="Click to cycle | Cmd/Ctrl+Click to reset"
                    >
                        {getCategoryLabel()}
                    </button>
                </div>

                <div className="filter-group">
                    <label>Priority:</label>
                    <button
                        className="filter-cycle-btn"
                        onClick={(e) => {
                            if (e.metaKey || e.ctrlKey) {
                                setSelectedPriority('all')
                            } else {
                                cyclePriority()
                            }
                        }}
                        title="Click to cycle | Cmd/Ctrl+Click to reset"
                    >
                        {getPriorityLabel()}
                    </button>
                </div>

                <div className="filter-group">
                    <label>Sort by:</label>
                    <button
                        className="filter-cycle-btn"
                        onClick={(e) => {
                            if (e.metaKey || e.ctrlKey) {
                                setSortBy('sortOrder')
                            } else {
                                cycleSortBy()
                            }
                        }}
                        title="Click to cycle | Cmd/Ctrl+Click to reset"
                    >
                        {getSortByLabel()}
                    </button>
                </div>

                {/* Quick Add */}
                <button className="quick-add-btn" onClick={addNewItem}>+</button>

                {/* Track Navigation - only show at track level */}
                {isTrackLevel && allTracks && allTracks.length > 0 && onNavigateTrack && (
                    <div className="track-navigation-filters">
                        <button
                            className="nav-track-btn"
                            onClick={() => onNavigateTrack('prev')}
                            title="Previous track (wraps around)"
                        >
                            ← Prev
                        </button>
                        <span className="track-counter">
                            {currentTrackIndex + 1} / {allTracks.length}
                        </span>
                        <button
                            className="nav-track-btn"
                            onClick={() => onNavigateTrack('next')}
                            title="Next track (wraps around)"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>

            <div className="kanban-board">
                {/* DOING Column */}
                <div className="kanban-column doing-column">
                    <h3 className="column-title">DOING <span className="count">({doingItems.length})</span></h3>

                    <div className="cards-grid">
                        {doingItems.map((item) => (
                            <Card
                                key={item.id}
                                item={item}
                                onEdit={editItem}
                                onDelete={removeItem}
                                onMarkDone={markItemDone}
                                onSave={saveItem}
                                onUpdateItem={updateItem}
                                onAddBulletPoint={addBulletPoint}
                                onUpdateBulletPoint={updateBulletPoint}
                                onRemoveBulletPoint={removeBulletPoint}
                                focusKey={focusKey}
                                setFocusKey={setFocusKey}
                                updateItemField={updateItemField}
                                onOpenComments={setSelectedItem}
                            />
                        ))}
                    </div>
                </div>

                {/* DONE Column - Stacked Display */}
                <div className="kanban-column done-column">
                    <h3 className="column-title">DONE <span className="count">({doneItems.length})</span></h3>

                    {/* Progress Bar */}
                    <div className="done-progress">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                        <span className="progress-text">
                            {doneItems.length} / {items.length} ({completionRate}%)
                        </span>
                    </div>

                    {doneItems.length > 0 ? (
                        <div className="done-stack">
                            <div
                                className="stack-visual"
                                onClick={() => setShowCompletedStack(!showCompletedStack)}
                            >
                                {doneItems.slice(0, 3).reverse().map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="stacked-card"
                                        style={{
                                            transform: `translateY(${index * -8}px) rotate(${(index - 1) * 2}deg)`,
                                            zIndex: 3 - index,
                                            opacity: 1 - (index * 0.15)
                                        }}
                                    >
                                        <h4>{item.subject}</h4>
                                    </div>
                                ))}
                                <div className="stack-count">
                                    {doneItems.length} completed item{doneItems.length !== 1 ? 's' : ''}
                                </div>
                                <div className="stack-hint">
                                    Click to {showCompletedStack ? 'collapse' : 'expand'}
                                </div>
                            </div>

                            {showCompletedStack && (
                                <div className="expanded-done-list">
                                    {doneItems.map(item => {
                                        const itemCategory = CATEGORIES[item.category] || CATEGORIES[0]
                                        return (
                                            <div key={item.id} className="done-card">
                                                <div className="done-card-header">
                                                    <span className="category-badge-small">
                                                        {itemCategory.name}
                                                    </span>
                                                    <h4>✓ {item.subject}</h4>
                                                    <div className="done-card-actions">
                                                        <button
                                                            className="back-btn"
                                                            onClick={() => moveBackToDoing(item.id)}
                                                            title="Move back to doing"
                                                        >
                                                            ←
                                                        </button>
                                                        <button
                                                            className="delete-btn"
                                                            onClick={() => removeItem(item.id)}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                                {item.bulletPoints.filter(b => b.trim()).length > 0 && (
                                                    <ul className="bullet-list">
                                                        {item.bulletPoints.filter(bullet => bullet.trim()).map((bullet, index) => (
                                                            <li key={index}>{bullet}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-done">
                            <p>Mark items as done to see them here</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Comments Modal */}
            {selectedItem && (
                <CommentsModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    )
}

export default KanbanHitList
