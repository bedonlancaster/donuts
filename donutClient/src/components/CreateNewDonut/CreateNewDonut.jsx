import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import InviteCollaboratorModal from '../InviteCollaborator/InviteCollaboratorModal'
import './CreateNewDonut.css'

// Color palettes for theme preview and creation
const COLOR_PALETTES = {
    Coral: {
        light: { primary: '#E87A7A', secondary: '#FFE5E5', accent: '#D66B6B', background: '#FFFFFF', text: '#4A4A4A' },
        dark: { primary: '#FFE5E5', secondary: '#F0B8B8', accent: '#FFF0F0', background: '#8B4A4A', text: '#FFFFFF' }
    },
    Peach: {
        light: { primary: '#F4A688', secondary: '#F7C4A0', accent: '#F19A7B', background: '#FDF7F3', text: '#3D2B1F' },
        dark: { primary: '#F7C4A0', secondary: '#E6B89A', accent: '#F5D4C4', background: '#8B5A42', text: '#FFFFFF' }
    },
    Sage: {
        light: { primary: '#8B9D77', secondary: '#A8B89A', accent: '#98A888', background: '#F4F6F1', text: '#2D3A24' },
        dark: { primary: '#A8B89A', secondary: '#9BAA88', accent: '#B8C7A5', background: '#556B47', text: '#FFFFFF' }
    },
    Clay: {
        light: { primary: '#C49B7C', secondary: '#D4B5A0', accent: '#CC9F85', background: '#FAF6F2', text: '#3E2723' },
        dark: { primary: '#D4B5A0', secondary: '#C2A693', accent: '#E0C4B0', background: '#7A5A47', text: '#FFFFFF' }
    },
    Slate: {
        light: { primary: '#7A8B99', secondary: '#A0B1BE', accent: '#8A9BAA', background: '#F2F4F6', text: '#2C3E50' },
        dark: { primary: '#A0B1BE', secondary: '#8FA0AD', accent: '#B5C6D3', background: '#4A5B69', text: '#FFFFFF' }
    }
}

// Helper function for theme preview
const getThemePreview = (mode, palette) => {
    return COLOR_PALETTES[palette] ? COLOR_PALETTES[palette][mode.toLowerCase()] : COLOR_PALETTES.Coral.light
}

// Theme display names and descriptions
// Theme palette display names for UI
const PALETTE_INFO = {
    coral: 'Coral Vibes',
    peach: 'Warm Peach',
    sage: 'Sage Green',
    clay: 'Terracotta Clay',
    slate: 'Dusty Slate',
    salmon: 'Soft Salmon',
    moss: 'Forest Moss',
    dusk: 'Evening Dusk',
    stone: 'Natural Stone',
    mist: 'Morning Mist'
}

function CreateNewDonut({ user, onBack, onSuccess }) {
    const { setPreviewTheme, resetToDefaultTheme } = useTheme()

    const [formData, setFormData] = useState({
        title: '',
        artistName: '',
        description: '',
        artwork: null, // File object for album artwork
        theme: {
            mode: 'Light',
            palette: 'Coral'
        }
    })

    const [artworkPreview, setArtworkPreview] = useState(null) // Preview URL for artwork
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [pendingInvitations, setPendingInvitations] = useState([]) // Track pending invitations

    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    // Theme palette order for cycling
    const PALETTE_ORDER = ['Coral', 'Peach', 'Sage', 'Clay', 'Slate']

    // Convert frontend palette names to backend enum values
    const getPaletteEnumValue = (paletteName) => {
        const paletteMap = { 'Coral': 1, 'Peach': 2, 'Sage': 3, 'Clay': 4, 'Slate': 5 }
        return paletteMap[paletteName] || 1 // Default to Coral
    }

    const cyclePalette = () => {
        const currentIndex = PALETTE_ORDER.indexOf(formData.theme.palette)
        const nextIndex = (currentIndex + 1) % PALETTE_ORDER.length
        const nextPalette = PALETTE_ORDER[nextIndex]

        handleThemeChange('palette', nextPalette)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }))
    }

    const handleArtworkChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, artwork: 'Please select a valid image file (JPEG, PNG, GIF, WebP)' }))
                return
            }

            // Validate file size (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, artwork: 'Image must be smaller than 50MB' }))
                return
            }

            // Clear any existing artwork errors
            setErrors(prev => ({ ...prev, artwork: '' }))

            // Create preview URL
            const previewUrl = URL.createObjectURL(file)
            setArtworkPreview(previewUrl)

            setFormData(prev => ({
                ...prev,
                artwork: file
            }))
        }
    }

    const removeArtwork = () => {
        if (artworkPreview) {
            URL.revokeObjectURL(artworkPreview)
        }
        setArtworkPreview(null)
        setFormData(prev => ({
            ...prev,
            artwork: null
        }))
    }

    const handleThemeChange = (field, value) => {
        const updatedTheme = {
            ...formData.theme,
            [field]: value
        }

        setFormData(prevData => ({
            ...prevData,
            theme: updatedTheme
        }))
    }



    // Apply initial theme on mount and track changes
    useEffect(() => {
        setPreviewTheme({
            mode: formData.theme.mode,
            palette: formData.theme.palette
        })
    }, [formData.theme.mode, formData.theme.palette]) // eslint-disable-line react-hooks/exhaustive-deps

    // Reset theme when component unmounts
    useEffect(() => {
        return () => {
            resetToDefaultTheme()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const handleAddInvitation = (invitation) => {
        // Add the invitation to pending list
        setPendingInvitations(prev => [...prev, invitation])
    }

    const removeInvitation = (invitedUserId) => {
        setPendingInvitations(prev => prev.filter(inv => inv.invitedUserId !== invitedUserId))
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.title.trim()) {
            newErrors.title = 'DONUT title is required'
        } else if (formData.title.length < 2) {
            newErrors.title = 'Title must be at least 2 characters'
        }

        if (formData.description.length > 500) {
            newErrors.description = 'Description must be 500 characters or less'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        setErrors({})

        try {
            // Create the project first
            // Get the actual colors for the selected theme
            const themeColors = getThemePreview(formData.theme.mode, formData.theme.palette)

            const projectData = {
                title: formData.title.trim(),
                artistName: formData.artistName.trim() || null,
                description: formData.description.trim(),
                theme: {
                    mode: formData.theme.mode === 'Light' ? 1 : 2, // ThemeMode enum values
                    palette: getPaletteEnumValue(formData.theme.palette),
                    primaryColor: themeColors.primary,
                    secondaryColor: themeColors.secondary,
                    accentColor: themeColors.accent,
                    backgroundColor: themeColors.background,
                    textColor: themeColors.text
                }
            }

            const response = await fetch('http://localhost:5000/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(projectData),
            })

            if (response.ok) {
                const newProject = await response.json()

                // Upload artwork if provided
                if (formData.artwork) {
                    try {
                        const artworkFormData = new FormData()
                        artworkFormData.append('artworkFile', formData.artwork)

                        const artworkResponse = await fetch(`http://localhost:5000/api/projects/${newProject.id}/artwork`, {
                            method: 'POST',
                            credentials: 'include',
                            body: artworkFormData
                        })

                        if (!artworkResponse.ok) {
                            const artworkError = await artworkResponse.text()
                            console.error('Failed to upload artwork:', artworkError)
                            setErrors(prev => ({
                                ...prev,
                                artwork: 'Project created but artwork upload failed. You can add artwork later.'
                            }))
                        }
                    } catch (artworkError) {
                        console.error('Artwork upload error:', artworkError)
                        setErrors(prev => ({
                            ...prev,
                            artwork: 'Project created but artwork upload failed. You can add artwork later.'
                        }))
                    }
                }

                // Send invitations if any were queued
                if (pendingInvitations.length > 0) {
                    for (const invitation of pendingInvitations) {
                        try {
                            const inviteResponse = await fetch('http://localhost:5000/api/invitations/send', {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    projectId: newProject.id,
                                    invitedUserId: invitation.invitedUserId,
                                    message: invitation.message || ''
                                })
                            })

                            if (!inviteResponse.ok) {
                                console.error(`Failed to send invitation:`, await inviteResponse.text())
                            }
                        } catch (error) {
                            console.error(`Error sending invitation:`, error)
                        }
                    }
                }

                onSuccess(newProject)
            } else {
                const errorData = await response.json()
                if (response.status === 400) {
                    // Handle validation errors from server
                    if (errorData.errors) {
                        setErrors(errorData.errors)
                    } else {
                        setErrors({ general: errorData.message || 'Failed to create DONUT' })
                    }
                } else {
                    setErrors({ general: 'Failed to create DONUT. Please try again.' })
                }
            }
        } catch (error) {
            console.error('Create DONUT error:', error)
            setErrors({ general: 'Network error. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const isFormValid = () => {
        return formData.title.trim().length >= 2 &&
            formData.description.trim().length > 0
    }

    return (
        <div className="create-donut">
            <div className="create-donut-container">
                <div className="create-header">
                    <button
                        className="back-btn"
                        onClick={() => {
                            resetToDefaultTheme()
                            onBack()
                        }}
                    >← Back</button>
                    <h1>Create New DONUT</h1>
                    <p className="create-subtitle">
                        Start a new collaborative project
                    </p>
                </div>

                {/* Album Artwork and Basic Info - Top Section */}
                <div className="artwork-section">
                    {/* Left: Album Artwork */}
                    <div className="artwork-container">
                        <div className="form-group">
                            <label className="form-label">Album Artwork (Optional)</label>

                            {!formData.artwork ? (
                                <div className="artwork-upload">
                                    <input
                                        type="file"
                                        id="artwork"
                                        accept="image/*"
                                        onChange={handleArtworkChange}
                                        className="artwork-input"
                                        disabled={isLoading}
                                    />
                                    <label htmlFor="artwork" className="artwork-upload-label">
                                        <div className="upload-text">
                                            <strong>Upload Album Artwork here</strong>
                                            <small>JPEG, PNG, GIF, WebP • Max 10MB</small>
                                        </div>
                                    </label>
                                </div>
                            ) : (
                                <div className="artwork-preview">
                                    <img src={artworkPreview} alt="Album artwork preview" className="artwork-image" />
                                    <div className="artwork-actions">
                                        <span className="artwork-filename">{formData.artwork.name}</span>
                                        <button
                                            type="button"
                                            onClick={removeArtwork}
                                            className="remove-artwork-btn"
                                            disabled={isLoading}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            )}

                            {errors.artwork && <span className="error-message">{errors.artwork}</span>}
                        </div>
                    </div>

                    {/* Right: Title and Artist Name */}
                    <div className="basic-info-container">
                        <div className="form-group">
                            <label htmlFor="title" className="form-label">DONUT Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className={`form-input ${errors.title ? 'error' : ''}`}
                                placeholder="Enter your project title"
                                disabled={isLoading}
                            />
                            {errors.title && <span className="error-message">{errors.title}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="artistName" className="form-label">Artist Name</label>
                            <input
                                type="text"
                                id="artistName"
                                name="artistName"
                                value={formData.artistName || ''}
                                onChange={handleInputChange}
                                className={`form-input ${errors.artistName ? 'error' : ''}`}
                                placeholder="Enter artist name"
                                disabled={isLoading}
                            />
                            {errors.artistName && <span className="error-message">{errors.artistName}</span>}
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="create-form">
                    {errors.general && (
                        <div className="error-message general-error">
                            {errors.general}
                        </div>
                    )}

                    {/* Left Section - Project Details */}
                    <div className="form-section">
                        <h3 className="section-title">Project Details</h3>

                        <div className="form-group">
                            <label htmlFor="description" className="form-label">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className={`form-textarea ${errors.description ? 'error' : ''}`}
                                placeholder="Describe your musical vision, style, or what you're looking to create..."
                                rows={6}
                                disabled={isLoading}
                            />
                            {errors.description && <span className="error-message">{errors.description}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Project Theme</label>

                            {/* Light/Dark Mode Switch */}
                            <div className="theme-mode-switch">
                                <span className="mode-label">Light</span>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={formData.theme.mode === 'Dark'}
                                        onChange={(e) => handleThemeChange('mode', e.target.checked ? 'Dark' : 'Light')}
                                        disabled={isLoading}
                                    />
                                    <span className="slider"></span>
                                </label>
                                <span className="mode-label">Dark</span>
                            </div>

                            {/* Single Theme Cycle Button */}
                            <button
                                type="button"
                                className="theme-cycle-btn"
                                onClick={cyclePalette}
                                disabled={isLoading}
                                title={`Current: ${formData.theme.palette} • Click to cycle themes`}
                                style={{
                                    background: getThemePreview(formData.theme.mode, formData.theme.palette).primary,
                                    borderColor: getThemePreview(formData.theme.mode, formData.theme.palette).accent
                                }}
                            >
                            </button>
                            <small className="theme-indicator">{formData.theme.palette} Theme</small>
                        </div>


                    </div>

                    {/* Right Section - Collaborators */}
                    <div className="form-section">
                        <h3 className="section-title">Collaboration</h3>

                        <div className="form-group">
                            <label className="form-label">
                                Invite Collaborators (Optional)
                            </label>

                            <button
                                type="button"
                                className="invite-collaborator-btn"
                                onClick={() => setShowInviteModal(true)}
                                disabled={isLoading}
                            >
                                + Invite Collaborator
                            </button>

                            {pendingInvitations.length > 0 && (
                                <div className="pending-invitations">
                                    <h4>Pending Invitations ({pendingInvitations.length}):</h4>
                                    <p className="invite-note">These invitations will be sent after the DONUT is created</p>
                                    {pendingInvitations.map((invitation, index) => (
                                        <div key={index} className="invitation-item">
                                            <div className="invitation-info">
                                                <div className="invitation-user">
                                                    <strong>{invitation.username}</strong>
                                                    <span className="username">@{invitation.username}</span>
                                                </div>
                                                {invitation.message && (
                                                    <div className="invitation-message">{invitation.message}</div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeInvitation(invitation.invitedUserId)}
                                                className="remove-invitation"
                                                disabled={isLoading}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <small className="form-hint">
                                Invite DONUTS users to collaborate on this project
                            </small>
                        </div>
                    </div>

                    {/* Submit Button - Full Width */}
                    <div className="form-section full-width">
                        <button
                            type="submit"
                            className="btn-theme-primary submit-btn"
                            disabled={!isFormValid() || isLoading}
                        >
                            {isLoading ? 'Creating DONUT...' : 'Create DONUT'}
                        </button>
                    </div>
                </form>

                {/* Invite Collaborator Modal */}
                <InviteCollaboratorModal
                    projectId={null}
                    isOpen={showInviteModal}
                    onClose={() => setShowInviteModal(false)}
                    onInviteSent={(invitation) => {
                        handleAddInvitation(invitation)
                        setShowInviteModal(false)
                    }}
                />
            </div>
        </div>
    )
}

export default CreateNewDonut