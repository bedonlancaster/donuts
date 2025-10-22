import React, { useState, useEffect } from 'react'
import './HitList.css'

function HitList({ projectId, trackId }) {
    const [items, setItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [focusKey, setFocusKey] = useState(null) // To trigger focus on specific input

    // Determine the API endpoint based on props
    const isTrackLevel = trackId !== undefined
    const apiEndpoint = isTrackLevel
        ? `http://localhost:5000/api/hitlistitems/track/${trackId}`
        : `http://localhost:5000/api/hitlistitems/project/${projectId}`

    // Load hit list items from backend
    useEffect(() => {
        const fetchHitListItems = async () => {
            try {
                const response = await fetch(apiEndpoint, {
                    credentials: 'include'
                })

                if (response.ok) {
                    const data = await response.json()
                    // Convert backend format to our frontend format
                    const convertedItems = data.map(item => ({
                        id: item.id,
                        subject: item.title,
                        bulletPoints: item.description ? item.description.split('\n').filter(point => point.trim()) : [''],
                        isEditing: false,
                        priority: item.priority,
                        status: item.status
                    }))
                    setItems(convertedItems)
                } else {
                    console.error('Failed to fetch hit list items')
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

    const addNewItem = () => {
        const newItem = {
            id: `temp-${Date.now()}`, // Temporary ID
            subject: '',
            bulletPoints: [''],
            isEditing: true,
            isNew: true
        }
        setItems([...items, newItem])
    }

    const updateItem = (itemId, field, value) => {
        setItems(items.map(item =>
            item.id === itemId
                ? { ...item, [field]: value }
                : item
        ))
    }

    const addBulletPoint = (itemId) => {
        setItems(items.map(item =>
            item.id === itemId
                ? { ...item, bulletPoints: [...item.bulletPoints, ''] }
                : item
        ))

        // Set focus key to trigger focus on the new bullet point
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

    const removeItem = async (itemId) => {
        const item = items.find(i => i.id === itemId)

        if (item && !item.isNew) {
            // Delete from backend
            try {
                const response = await fetch(`http://localhost:5000/api/hitlistitems/${itemId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                })

                if (!response.ok) {
                    console.error('Failed to delete item')
                    return
                }
            } catch (error) {
                console.error('Error deleting item:', error)
                return
            }
        }

        setItems(items.filter(item => item.id !== itemId))
    }

    const saveItem = async (item) => {
        try {
            const bulletPointsText = item.bulletPoints.filter(point => point.trim()).join('\n')

            if (item.isNew) {
                // Create new item
                const response = await fetch('http://localhost:5000/api/hitlistitems', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: item.subject,
                        description: bulletPointsText,
                        projectId: parseInt(projectId),
                        trackId: trackId ? parseInt(trackId) : null,
                        priority: 2 // Medium priority
                    })
                })

                if (response.ok) {
                    const newItem = await response.json()
                    setItems(items.map(i =>
                        i.id === item.id
                            ? {
                                id: newItem.id,
                                subject: newItem.title,
                                bulletPoints: newItem.description ? newItem.description.split('\n').filter(point => point.trim()) : [''],
                                isEditing: false,
                                isNew: false
                            }
                            : i
                    ))
                } else {
                    console.error('Failed to create item')
                }
            } else {
                // Update existing item
                const response = await fetch(`http://localhost:5000/api/hitlistitems/${item.id}`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: item.subject,
                        description: bulletPointsText
                    })
                })

                if (response.ok) {
                    setItems(items.map(i =>
                        i.id === item.id
                            ? { ...i, isEditing: false }
                            : i
                    ))
                } else {
                    console.error('Failed to update item')
                }
            }
        } catch (error) {
            console.error('Error saving item:', error)
        }
    }

    const editItem = (itemId) => {
        setItems(items.map(item =>
            item.id === itemId
                ? { ...item, isEditing: true }
                : item
        ))
    }

    if (isLoading) {
        return (
            <div className="hit-list">
                <div className="hit-list-header">
                    <h3>Hit List</h3>
                </div>
                <div className="loading-state">
                    <p>Loading hit list items...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="hit-list">
            <div className="hit-list-header">
                <h3>{isTrackLevel ? 'Track Hit List' : 'Hit List'}</h3>
                <button className="add-item-btn" onClick={addNewItem}>
                    + Add Item
                </button>
            </div>

            <div className="hit-list-items">
                {items.map(item => (
                    <div key={item.id} className="hit-list-item">
                        {item.isEditing ? (
                            <div className="hit-item-edit">
                                <input
                                    type="text"
                                    className="subject-input"
                                    placeholder="Subject/Topic..."
                                    value={item.subject}
                                    onChange={(e) => updateItem(item.id, 'subject', e.target.value)}
                                />

                                <div className="bullet-points">
                                    {item.bulletPoints.map((bullet, index) => (
                                        <div key={index} className="bullet-point-input">
                                            <span className="bullet">•</span>
                                            <input
                                                type="text"
                                                placeholder="Add a point..."
                                                value={bullet}
                                                onChange={(e) => updateBulletPoint(item.id, index, e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && bullet.trim()) {
                                                        addBulletPoint(item.id)
                                                    }
                                                }}
                                                ref={(input) => {
                                                    // Auto-focus when this is the newly added bullet point
                                                    if (focusKey === `${item.id}-${index}` && input) {
                                                        setTimeout(() => {
                                                            input.focus()
                                                            setFocusKey(null) // Clear focus key after focusing
                                                        }, 0)
                                                    }
                                                }}
                                            />
                                            {item.bulletPoints.length > 1 && (
                                                <button
                                                    className="remove-bullet-btn"
                                                    onClick={() => removeBulletPoint(item.id, index)}
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        className="add-bullet-btn"
                                        onClick={() => addBulletPoint(item.id)}
                                    >
                                        + Add point
                                    </button>
                                </div>

                                <div className="item-actions">
                                    <button
                                        className="save-btn"
                                        onClick={() => saveItem(item)}
                                        disabled={!item.subject.trim()}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="cancel-btn"
                                        onClick={() => removeItem(item.id)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="hit-item-display">
                                <div className="item-header">
                                    <h4 className="item-subject">{item.subject}</h4>
                                    <div className="item-controls">
                                        <button
                                            className="edit-btn"
                                            onClick={() => editItem(item.id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>

                                <ul className="bullet-list">
                                    {item.bulletPoints.filter(bullet => bullet.trim()).map((bullet, index) => (
                                        <li key={index}>{bullet}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {items.length === 0 && (
                <div className="empty-state">
                    <p>No items in your {isTrackLevel ? 'track' : 'project'} hit list yet.</p>
                    <p>Click "Add Item" to create your first discussion point!</p>
                </div>
            )}
        </div>
    )
}

export default HitList