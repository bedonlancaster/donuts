import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import './CreateNewDonut.css'

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
        description: '',
        artwork: null, // File object for album artwork
        theme: {
            mode: 'Light',
            palette: 'Coral',
            emotionalTone: '',
            visualDescription: ''
        },
        collaborators: [] // Array of selected collaborators
    })

    const [artworkPreview, setArtworkPreview] = useState(null) // Preview URL for artwork

    const [collaboratorSearch, setCollaboratorSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isSearching, setIsSearching] = useState(false)

    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    // Theme palette order for cycling
    const PALETTE_ORDER = ['coral', 'peach', 'sage', 'clay', 'slate', 'salmon', 'moss', 'dusk', 'stone', 'mist']

    // Convert frontend palette names to backend enum values
    const getPaletteEnumValue = (paletteName) => {
        const paletteMap = {
            'coral': 1, 'peach': 1, // Map both coral and peach to Coral
            'sage': 3, 'moss': 3,   // Map both to Forest
            'clay': 7, 'stone': 7,  // Map both to Earth
            'slate': 9, 'mist': 9,  // Map both to Monochrome 
            'salmon': 4, 'dusk': 5  // Map salmon to Sunset, dusk to Lavender
        }
        return paletteMap[paletteName.toLowerCase()] || 1 // Default to Coral
    }

    const cycleToNextTheme = () => {
        const currentIndex = PALETTE_ORDER.indexOf(formData.theme.palette.toLowerCase())
        const nextIndex = (currentIndex + 1) % PALETTE_ORDER.length
        const nextPalette = PALETTE_ORDER[nextIndex]

        handleThemeChange('palette', nextPalette.charAt(0).toUpperCase() + nextPalette.slice(1))
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

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, artwork: 'Image must be smaller than 10MB' }))
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

        // Apply theme preview to DOM in real-time
        setPreviewTheme({
            mode: updatedTheme.mode,
            palette: updatedTheme.palette
        })
    }

    // Apply initial theme on mount and reset on unmount
    useEffect(() => {
        // Apply initial theme preview only on mount
        setPreviewTheme({
            mode: formData.theme.mode,
            palette: formData.theme.palette
        })

        // Reset theme when component unmounts
        return () => {
            resetToDefaultTheme()
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    const searchUsers = async (query) => {
        if (query.length < 2) {
            setSearchResults([])
            return
        }

        setIsSearching(true)
        try {
            const response = await fetch(`http://localhost:5000/api/projects/search-users?query=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // Use cookies for authentication instead of Bearer token
            })

            if (response.ok) {
                const users = await response.json()
                setSearchResults(users || [])
            } else {
                console.error('User search failed:', response.status, response.statusText)
                setSearchResults([])
            }
        } catch (error) {
            console.error('Error searching users:', error)
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }

    const handleCollaboratorSearchChange = (e) => {
        const query = e.target.value
        setCollaboratorSearch(query)
        searchUsers(query)
    }

    const addCollaborator = (user) => {
        if (!formData.collaborators.find(c => c.userId === user.id)) {
            setFormData(prev => ({
                ...prev,
                collaborators: [...prev.collaborators, {
                    userId: user.id,
                    username: user.username,
                    displayName: user.displayName,
                    role: 'Collaborator'
                }]
            }))
        }
        setCollaboratorSearch('')
        setSearchResults([]) // Clear search results after adding
    }

    const removeCollaborator = (userId) => {
        setFormData(prev => ({
            ...prev,
            collaborators: prev.collaborators.filter(c => c.userId !== userId)
        }))
    }

    const updateCollaboratorRole = (userId, role) => {
        setFormData(prev => ({
            ...prev,
            collaborators: prev.collaborators.map(c =>
                c.userId === userId ? { ...c, role } : c
            )
        }))
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
            const projectData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                theme: {
                    mode: formData.theme.mode === 'Light' ? 1 : 2, // ThemeMode enum values
                    palette: getPaletteEnumValue(formData.theme.palette),
                    emotionalTone: formData.theme.emotionalTone.trim() || null,
                    visualDescription: formData.theme.visualDescription.trim() || null
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

                // TODO: Add collaborators if any were selected
                // Need to implement email-based collaborator system or modify API
                if (formData.collaborators.length > 0) {
                    console.log('Collaborators selected but not implemented yet:', formData.collaborators)
                }

                console.log('DONUT created successfully!', newProject)
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
                    <button className="back-btn" onClick={() => {
                        resetToDefaultTheme()
                        onBack()
                    }}>← Back</button>
                    <h1>Create New DONUT</h1>
                    <p className="create-subtitle">
                        {user.isProducer
                            ? "Start a new collaborative project with an artist"
                            : "Propose a new project idea to work on with producers"
                        }
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="create-form">
                    {errors.general && (
                        <div className="error-message general-error">
                            {errors.general}
                        </div>
                    )}

                    {/* Left Section - Basic Info */}
                    <div className="form-section">
                        <h3 className="section-title">Project Details</h3>

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

                        {/* Album Artwork Upload */}
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
                                        <div className="upload-icon">📷</div>
                                        <div className="upload-text">
                                            <strong>Click to upload artwork</strong>
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
                                onClick={cycleToNextTheme}
                                disabled={isLoading}
                                title="Click to cycle through color themes"
                            >
                            </button>
                        </div>

                        {/* Synesthesia Support Fields */}
                        <div className="form-group">
                            <label htmlFor="emotionalTone" className="form-label">Emotional Tone (Optional)</label>
                            <input
                                type="text"
                                id="emotionalTone"
                                value={formData.theme.emotionalTone}
                                onChange={(e) => handleThemeChange('emotionalTone', e.target.value)}
                                className="form-input"
                                placeholder="e.g., Energetic, Melancholic, Dreamy..."
                                disabled={isLoading}
                            />
                            <small className="form-hint">How does this project feel to you?</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="visualDescription" className="form-label">Visual Description (Optional)</label>
                            <textarea
                                id="visualDescription"
                                value={formData.theme.visualDescription}
                                onChange={(e) => handleThemeChange('visualDescription', e.target.value)}
                                className="form-textarea"
                                placeholder="Describe the colors, shapes, or visuals you see when you hear this music..."
                                rows={3}
                                disabled={isLoading}
                            />
                            <small className="form-hint">For artists with synesthesia - paint the sounds with words</small>
                        </div>
                    </div>

                    {/* Right Section - Collaborators */}
                    <div className="form-section">
                        <h3 className="section-title">Collaboration</h3>

                        <div className="form-group">
                            <label htmlFor="collaboratorSearch" className="form-label">
                                Add Collaborators (Optional)
                            </label>
                            <input
                                type="text"
                                id="collaboratorSearch"
                                value={collaboratorSearch}
                                onChange={handleCollaboratorSearchChange}
                                className="form-input collaborator-search"
                                placeholder="Search by username or display name..."
                                disabled={isLoading}
                            />

                            {isSearching && (
                                <div className="search-loading">
                                    <span>Searching users...</span>
                                </div>
                            )}

                            {errors.collaborator && (
                                <div className="error-message">
                                    {errors.collaborator}
                                </div>
                            )}

                            {searchResults.length > 0 && (
                                <div className="search-results">
                                    {searchResults.map(user => (
                                        <div
                                            key={user.id}
                                            className="search-result-item"
                                            onClick={() => addCollaborator(user)}
                                        >
                                            <div className="user-info">
                                                <div className="user-name">
                                                    <strong>{user.displayName || user.username}</strong>
                                                    <span className="username">@{user.username}</span>
                                                </div>
                                                <span className="user-role-badge">{user.userRole}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {formData.collaborators.length > 0 && (
                                <div className="selected-collaborators">
                                    <h4>Selected Collaborators:</h4>
                                    {formData.collaborators.map(collaborator => (
                                        <div key={collaborator.userId} className="collaborator-item">
                                            <div className="collaborator-info">
                                                <div className="collaborator-name">
                                                    <strong>{collaborator.displayName || collaborator.username}</strong>
                                                    <span className="username">@{collaborator.username}</span>
                                                </div>
                                                <select
                                                    value={collaborator.role}
                                                    onChange={(e) => updateCollaboratorRole(collaborator.userId, e.target.value)}
                                                    className="role-select"
                                                    disabled={isLoading}
                                                >
                                                    <option value="Producer">Producer</option>
                                                    <option value="Artist">Artist</option>
                                                    <option value="Engineer">Engineer</option>
                                                    <option value="Songwriter">Songwriter</option>
                                                    <option value="Vocalist">Vocalist</option>
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => removeCollaborator(collaborator.userId)}
                                                    className="remove-collaborator"
                                                    disabled={isLoading}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <small className="form-hint">
                                Search for existing DONUTS users to add as collaborators
                            </small>
                        </div>
                    </div>

                    {/* Submit Button - Full Width */}
                    <div className="form-section full-width">
                        <button
                            type="submit"
                            className={`submit-btn ${!isFormValid() || isLoading ? 'disabled' : ''}`}
                            disabled={!isFormValid() || isLoading}
                        >
                            {isLoading ? 'Creating DONUT...' : 'Create DONUT'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateNewDonut