import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAudioPlayer } from '../../context/AudioPlayerContext'
import KanbanHitList from '../HitList/KanbanHitList'
import ProjectHeader from '../ProjectHeader/ProjectHeader'
import InviteCollaboratorModal from '../InviteCollaborator/InviteCollaboratorModal'
import donutLogo from '../../assets/donut.logo.actual.png'
import './ProjectDetail.css'

// Collaborator roles - mapping enum values to display names
const COLLABORATOR_ROLES = {
    1: { key: 'Artist', label: 'Artist' },
    2: { key: 'Producer', label: 'Producer' },
    3: { key: 'Songwriter', label: 'Songwriter' },
    4: { key: 'Engineer', label: 'Engineer' },
    5: { key: 'MixingEngineer', label: 'Mixing Engineer' },
    6: { key: 'MasteringEngineer', label: 'Mastering Engineer' },
    7: { key: 'Management', label: 'Management' },
    8: { key: 'Label', label: 'Label' }
}

// Helper to get role name from enum value
const getRoleLabel = (roleValue) => {
    return COLLABORATOR_ROLES[roleValue]?.label || 'Unknown'
}

// Color palette definitions with improved dark mode text contrast
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

// Helper functions for theme management
const getThemePreview = (mode, palette) => {
    return COLOR_PALETTES[palette] ? COLOR_PALETTES[palette][mode.toLowerCase()] : COLOR_PALETTES.Coral.light
}

const PALETTE_ORDER = ['Coral', 'Peach', 'Sage', 'Clay', 'Slate']

function ProjectDetail({ user, onLogout }) {
    const { id: projectId } = useParams()
    const navigate = useNavigate()
    const { currentTheme, setPreviewTheme, resetToDefaultTheme } = useTheme()
    const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudioPlayer()
    const [project, setProject] = useState(null)
    // Local theme preview state for cycling and mode switching
    const [themePreview, setThemePreview] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('tracks')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [draggedTrack, setDraggedTrack] = useState(null)
    const [dragOverIndex, setDragOverIndex] = useState(null)
    const [openRoleDropdown, setOpenRoleDropdown] = useState(null)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const roleDropdownRef = useRef(null)

    // Theme is set by ThemeLoader; no need to set theme here

    // Palette mapping is now centralized in themeUtils

    // Theme management functions (local preview)
    const cycleProjectTheme = () => {
        if (!themePreview) return
        const currentIndex = PALETTE_ORDER.indexOf(themePreview.palette)
        const nextIndex = (currentIndex + 1) % PALETTE_ORDER.length
        const nextPalette = PALETTE_ORDER[nextIndex]
        setThemePreview(prev => ({ ...prev, palette: nextPalette }))
    }

    const handleProjectThemeMode = (isChecked) => {
        if (!themePreview) return
        const newMode = isChecked ? 'Dark' : 'Light'
        setThemePreview(prev => ({ ...prev, mode: newMode }))
    }
    // Sync themePreview with project data when loaded
    useEffect(() => {
        if (project && project.theme) {
            setThemePreview({
                mode: project.theme.mode === 2 ? 'Dark' : 'Light',
                palette: PALETTE_ORDER[project.theme.palette - 1] || 'Coral'
            })
        }
    }, [project])

    // Click outside handler for role dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
                setOpenRoleDropdown(null)
            }
        }

        if (openRoleDropdown !== null) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [openRoleDropdown])

    // Update preview theme in context for live preview
    useEffect(() => {
        if (themePreview) {
            setPreviewTheme(themePreview)
        }
        // No reset here; only reset when leaving ProjectDetail page
    }, [themePreview, setPreviewTheme])

    // Fetch project details
    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true)

                const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                if (response.ok) {
                    const projectData = await response.json()
                    setProject(projectData)
                } else if (response.status === 404) {
                    setError('Project not found')
                } else if (response.status === 403) {
                    setError('You don\'t have access to this project')
                } else if (response.status === 401) {
                    setError('Please log in to view this project')
                } else {
                    const errorText = await response.text()
                    console.error('API error:', response.status, errorText)
                    setError(`Failed to load project: ${response.status}`)
                }
            } catch (err) {
                console.error('Error fetching project:', err)
                setError('Network error loading project')
            } finally {
                setLoading(false)
            }
        }

        if (projectId) {
            fetchProject()
        }
    }, [projectId])

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            onLogout()
        }
    }

    const handleRoleChange = async (collaboratorId, newRole) => {
        try {
            console.log('Updating role for collaborator:', collaboratorId, 'to role:', newRole)

            const response = await fetch(`http://localhost:5000/api/projects/${projectId}/collaborators/${collaboratorId}/role`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newRole)
            })

            if (response.ok) {
                const updatedCollaborator = await response.json()
                console.log('Successfully updated collaborator:', updatedCollaborator)
                // Update the project state with the new role
                setProject(prev => ({
                    ...prev,
                    collaborators: prev.collaborators.map(c =>
                        c.id === collaboratorId ? updatedCollaborator : c
                    )
                }))
            } else {
                const errorText = await response.text()
                console.error('Failed to update role:', response.status, errorText)
            }
        } catch (error) {
            console.error('Error updating role:', error)
        }
    }

    const handlePlayTrack = (track) => {
        // Check if this track is already playing
        if (currentTrack && currentTrack.id === track.id) {
            // Toggle play/pause for current track
            togglePlayPause()
        } else {
            // Play new track with project tracks as playlist
            const trackList = project.tracks || []
            playTrack(track, trackList, project)
        }
    }

    // Drag and drop handlers - memoized to prevent re-creation
    const handleDragStart = useCallback((e, track, index) => {
        setDraggedTrack({ track, index })
        e.dataTransfer.effectAllowed = 'move'
    }, [])

    const handleDragEnd = useCallback((e) => {
        setDraggedTrack(null)
        setDragOverIndex(null)
    }, [])

    const handleDragOver = useCallback((e, index) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverIndex(prevIndex => prevIndex === index ? prevIndex : index)
    }, [])

    const handleDragLeave = useCallback((e) => {
        // Only clear if we're actually leaving the track item
        if (e.currentTarget.contains(e.relatedTarget)) {
            return
        }
        setDragOverIndex(null)
    }, [])

    const handleDrop = async (e, dropIndex) => {
        e.preventDefault()

        if (!draggedTrack || draggedTrack.index === dropIndex) {
            setDraggedTrack(null)
            setDragOverIndex(null)
            return
        }

        const tracks = [...project.tracks]
        const draggedItem = tracks[draggedTrack.index]

        // Remove dragged item and insert at new position
        tracks.splice(draggedTrack.index, 1)
        tracks.splice(dropIndex, 0, draggedItem)

        // Update order indices
        const updatedTracks = tracks.map((track, index) => ({
            ...track,
            orderIndex: index + 1
        }))

        // Optimistically update UI
        setProject(prev => ({ ...prev, tracks: updatedTracks }))

        // Save to backend
        try {
            await updateTrackOrder(updatedTracks)
        } catch (error) {
            console.error('Failed to update track order:', error)
            // Revert on error - you might want to refetch the project here
        }

        setDraggedTrack(null)
        setDragOverIndex(null)
    }

    const updateTrackOrder = async (tracks) => {
        const updates = tracks.map(track => ({
            trackId: track.id,
            orderIndex: track.orderIndex
        }))

        const response = await fetch(`http://localhost:5000/api/projects/${projectId}/tracks/reorder`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ trackOrders: updates })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Error response:', errorText)
            throw new Error('Failed to update track order')
        }
    }

    const handleUpdateProjectTheme = async (themeSettings) => {
        try {
            // Get the color values for this theme
            const colors = getThemePreview(themeSettings.mode, themeSettings.palette)

            // Convert mode string to enum (1 = Light, 2 = Dark)
            const modeEnum = themeSettings.mode === 'Light' ? 1 : 2

            // Convert palette string to enum
            const getPaletteEnum = (palette) => {
                const paletteMap = { 'Coral': 1, 'Peach': 2, 'Sage': 3, 'Clay': 4, 'Slate': 5 }
                return paletteMap[palette] || 1
            }

            const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    theme: {
                        mode: modeEnum,
                        palette: getPaletteEnum(themeSettings.palette),
                        primaryColor: colors.primary,
                        secondaryColor: colors.secondary,
                        accentColor: colors.accent,
                        backgroundColor: colors.background,
                        textColor: colors.text
                    }
                })
            })

            if (response.ok) {
                // Refresh project data to get updated theme
                window.location.reload()
            } else {
                console.error('Failed to update project theme:', response.status)
            }
        } catch (error) {
            console.error('Error updating project theme:', error)
        }
    }

    const handleDeleteProject = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (response.ok) {
                resetToDefaultTheme();
                navigate('/') // Navigate back to home/dashboard
            } else {
                console.error('Failed to delete project:', response.status)
                setError('Failed to delete project')
            }
        } catch (error) {
            console.error('Error deleting project:', error)
            setError('Error deleting project')
        }
        setShowDeleteConfirm(false)
    }

    const handleUpdateProjectStatus = async () => {
        if (!project) return

        const newStatus = project.status === 1 ? 2 : 1

        try {
            const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: project.title,
                    artistName: project.artistName,
                    description: project.description,
                    status: newStatus
                })
            })

            if (response.ok) {
                setProject({ ...project, status: newStatus })
            } else {
                console.error('Failed to update project status:', response.status)
            }
        } catch (error) {
            console.error('Error updating project status:', error)
        }
    }

    if (loading) {
        return (
            <div className="project-detail">
                <div className="loading-container">
                    <div className="loading-message">Loading project...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="project-detail">
                <div className="error-container">
                    <div className="error-message">{error}</div>
                    <button onClick={() => {
                        resetToDefaultTheme();
                        navigate('/dashboard');
                    }} className="back-btn">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    // Get current preview theme colors (with fallback)
    const activeTheme = themePreview
        ? getThemePreview(themePreview.mode, themePreview.palette)
        : getThemePreview('Light', 'Coral')

    return (
        <div
            className="project-detail"
            style={{
                '--primary-coral': activeTheme.primary,
                '--light-pink': activeTheme.secondary,
                '--dark-coral': activeTheme.accent,
                '--text-dark': activeTheme.text,
                '--background': activeTheme.background,
                backgroundColor: activeTheme.background,
                color: activeTheme.text,
                minHeight: '100vh'
            }}
        >
            {/* Header */}
            <ProjectHeader
                project={project}
                onStatusUpdate={handleUpdateProjectStatus}
                onBack={() => {
                    resetToDefaultTheme();
                    navigate('/dashboard');
                }}
                activeTheme={activeTheme}
            >
                {/* Tabs Navigation */}
                <div className="project-tabs-inline" style={{ borderBottom: `2px solid ${activeTheme.primary}` }}>
                    <button
                        className={`tab-btn ${activeTab === 'tracks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tracks')}
                        style={{
                            color: activeTab === 'tracks' ? activeTheme.primary : activeTheme.text,
                            borderBottom: activeTab === 'tracks' ? `2px solid ${activeTheme.primary}` : 'none'
                        }}
                    >
                        Tracks
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'hitlist' ? 'active' : ''}`}
                        onClick={() => setActiveTab('hitlist')}
                        style={{
                            color: activeTab === 'hitlist' ? activeTheme.primary : activeTheme.text,
                            borderBottom: activeTab === 'hitlist' ? `2px solid ${activeTheme.primary}` : 'none'
                        }}
                    >
                        Hit List
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'collaborators' ? 'active' : ''}`}
                        onClick={() => setActiveTab('collaborators')}
                        style={{
                            color: activeTab === 'collaborators' ? activeTheme.primary : activeTheme.text,
                            borderBottom: activeTab === 'collaborators' ? `2px solid ${activeTheme.primary}` : 'none'
                        }}
                    >
                        Collaborators
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                        style={{
                            color: activeTab === 'settings' ? activeTheme.primary : activeTheme.text,
                            borderBottom: activeTab === 'settings' ? `2px solid ${activeTheme.primary}` : 'none'
                        }}
                    >
                        Settings
                    </button>
                </div>

                <div className="user-profile">
                    <div className="profile-avatar" style={{ background: activeTheme.primary, color: activeTheme.text }}>
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <div className="profile-name" style={{ color: activeTheme.text }}>{user.username}</div>
                        <div className="profile-role">
                            Collaborator
                        </div>
                    </div>
                </div>
            </ProjectHeader>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'tracks' && (
                    <div className="tracks-section">
                        <div className="section-header">
                            <div className="section-title-group">
                                {/* <h2>Tracks</h2> */}
                                {project.totalDuration && (
                                    <span className="total-duration">
                                        Runtime: {formatDuration(project.totalDuration)}
                                    </span>
                                )}
                            </div>
                            <button
                                className="add-btn"
                                onClick={() => navigate(`/project/${projectId}/upload-track`)}
                            >
                                + Upload Track
                            </button>
                        </div>

                        {project.tracks && project.tracks.length > 0 ? (
                            <div className="tracks-list">
                                {project.tracks.map((track, index) => (
                                    <div
                                        key={track.id}
                                        className={`track-item ${dragOverIndex === index ? 'drag-over' : ''} ${draggedTrack?.index === index ? 'dragging' : ''}`}
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, track, index)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                    >
                                        <div className="track-number">{index + 1}</div>
                                        <div className="track-info">
                                            <h4
                                                className="track-title-link"
                                                onClick={() => navigate(`/project/${projectId}/track/${track.id}?tab=hitlist`)}
                                                title="View track hit list"
                                            >
                                                {track.title}
                                            </h4>
                                            <p className="track-artist">{project.artistName || track.uploadedBy.username}</p>
                                        </div>
                                        <div className="track-duration">
                                            {track.duration ? formatDuration(track.duration) : '--:--'}
                                        </div>
                                        <div className="track-actions">
                                            <button
                                                className="play-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handlePlayTrack(track)
                                                }}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                title={currentTrack && currentTrack.id === track.id && isPlaying ? 'Pause' : 'Play'}
                                            >
                                                {currentTrack && currentTrack.id === track.id && isPlaying ? '⏸' : '▶'}
                                            </button>
                                            <button
                                                className="more-btn"
                                                onMouseDown={(e) => e.stopPropagation()}
                                            >⋯</button>
                                            <div
                                                className="drag-handle"
                                                title="Drag to reorder"
                                            >
                                                ⋮⋮
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <h3>No tracks yet</h3>
                                <p>Upload your first track to get started</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'hitlist' && (
                    <div className="hitlist-section">
                        <KanbanHitList projectId={projectId} />
                    </div>
                )}

                {activeTab === 'collaborators' && (
                    <div className="collaborators-section">
                        <div className="section-header">
                            <h2>Collaborators</h2>
                            <button
                                className="add-btn"
                                onClick={() => setShowInviteModal(true)}
                            >
                                + Add Collaborator
                            </button>
                        </div>

                        {project.collaborators && project.collaborators.length > 0 ? (
                            <div className="collaborators-list">
                                {project.collaborators.map((collaborator, index) => (
                                    <div key={collaborator.id} className="collaborator-item">
                                        <div className="collaborator-avatar">
                                            {collaborator.user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="collaborator-info">
                                            <h4>{collaborator.user.username}</h4>
                                        </div>
                                        <div
                                            className="role-badge-wrapper"
                                            ref={openRoleDropdown === index ? roleDropdownRef : null}
                                        >
                                            <span
                                                className="role-badge clickable"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setOpenRoleDropdown(openRoleDropdown === index ? null : index)
                                                }}
                                                title="Click to change role"
                                            >
                                                {getRoleLabel(collaborator.role)}
                                            </span>
                                            {openRoleDropdown === index && (
                                                <div className="role-dropdown">
                                                    {Object.entries(COLLABORATOR_ROLES).map(([roleValue, roleInfo]) => (
                                                        <div
                                                            key={roleValue}
                                                            className={`role-option ${collaborator.role === parseInt(roleValue) ? 'active' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleRoleChange(collaborator.id, parseInt(roleValue))
                                                                setOpenRoleDropdown(null)
                                                            }}
                                                        >
                                                            {roleInfo.label}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <h3>Just you for now</h3>
                                <p>Add collaborators to work together on this project</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="settings-section">
                        <div className="section-header">
                            <h2>Project Settings</h2>
                        </div>
                        <div className="settings-content">
                            <div className="setting-group">
                                <h4>Project Information</h4>
                                <p><strong>Created:</strong> {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}</p>
                                <p><strong>Created by:</strong> {project.createdBy.username}</p>
                                <p><strong>Project ID:</strong> {project.id}</p>
                            </div>

                            <div className="setting-group">
                                <h4>Project Theme</h4>

                                {/* Theme Preview */}
                                <div className="theme-preview-box" style={{
                                    backgroundColor: activeTheme.background,
                                    color: activeTheme.text,
                                    border: `2px solid ${activeTheme.primary}`,
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginTop: '1rem'
                                }}>
                                    <strong style={{ color: activeTheme.primary }}>
                                        {themePreview ? `${themePreview.palette} - ${themePreview.mode} Mode` : 'Loading theme...'}
                                    </strong>
                                    <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                                        This is how your project theme will look with text and backgrounds.
                                    </p>
                                </div>

                                {/* Theme Controls */}
                                <div className="theme-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem', marginTop: '1.5rem' }}>
                                    {/* Light/Dark Mode Switch */}
                                    <div className="theme-mode-switch" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span className="mode-label">Light</span>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={themePreview?.mode === 'Dark'}
                                                onChange={e => handleProjectThemeMode(e.target.checked)}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                        <span className="mode-label">Dark</span>
                                    </div>

                                    {/* Theme Cycle Button Centered & Circular */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                        <button
                                            type="button"
                                            className="theme-cycle-btn"
                                            onClick={cycleProjectTheme}
                                            title={`Current: ${themePreview?.palette} • Click to cycle themes`}
                                            style={{
                                                background: activeTheme.primary,
                                                borderColor: activeTheme.accent,
                                                color: activeTheme.text,
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '50%',
                                                border: '2px solid',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.5rem',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
                                            }}
                                        >
                                            {/* Optionally add an icon or emoji for cycling */}
                                        </button>
                                        <small className="theme-indicator" style={{ textAlign: 'center', minWidth: '60px', fontWeight: '500' }}>{themePreview?.palette}</small>
                                    </div>
                                </div>

                                {/* Save Theme Button */}
                                <button
                                    className="save-theme-btn"
                                    style={{
                                        marginTop: '1.5rem',
                                        background: activeTheme.primary,
                                        color: activeTheme.text,
                                        border: 'none',
                                        padding: '0.7rem 1.5rem',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleUpdateProjectTheme(themePreview)}
                                >
                                    Save Theme
                                </button>
                            </div>

                            <div className="setting-group">
                                <h4>Maintenance</h4>
                                <p style={{ marginBottom: '1rem' }}>
                                    Update track durations for all tracks in this project.
                                </p>
                                <button
                                    className="update-durations-btn"
                                    onClick={async () => {
                                        try {
                                            const response = await fetch('http://localhost:5000/api/maintenance/update-track-durations', {
                                                method: 'POST',
                                                credentials: 'include',
                                                headers: { 'Content-Type': 'application/json' }
                                            })
                                            const result = await response.json()
                                            alert(`Updated ${result.updated} tracks, ${result.failed} failed`)
                                            // Refresh the page to see updated durations
                                            window.location.reload()
                                        } catch (error) {
                                            console.error('Error updating durations:', error)
                                            alert('Failed to update durations')
                                        }
                                    }}
                                    style={{
                                        backgroundColor: activeTheme.primary,
                                        color: activeTheme.text,
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    Update Track Durations
                                </button>
                            </div>

                            <div className="setting-group">
                                <h4>Danger Zone</h4>
                                <p style={{ marginBottom: '1rem', color: '#e74c3c' }}>
                                    Deleting this project will permanently remove all tracks, collaborators, and data. This action cannot be undone.
                                </p>
                                <button
                                    className="delete-project-btn"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    style={{
                                        backgroundColor: '#e74c3c',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.75rem 1.5rem',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    Delete Project
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal-overlay" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                    }}>
                        <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>Delete Project</h3>
                        <p style={{ marginBottom: '2rem', color: '#333' }}>
                            Are you sure you want to delete "{project?.title}"?
                            <br />
                            <strong>This action cannot be undone.</strong>
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    border: '1px solid #ccc',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteProject}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#e74c3c',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <InviteCollaboratorModal
                projectId={project.id}
                isOpen={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                onInviteSent={() => {
                    // Close modal when invite is sent
                    setShowInviteModal(false)
                }}
            />
        </div>
    )
}

// Helper function to format duration
const formatDuration = (duration) => {
    if (!duration) return '--:--'

    // Handle different duration formats from the API

    // If duration is already a number (seconds), use it directly
    if (typeof duration === 'number') {
        const minutes = Math.floor(duration / 60)
        const seconds = Math.floor(duration % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    // If duration is a string (TimeSpan format from C#), parse it
    if (typeof duration === 'string') {
        // Handle TimeSpan format: "00:04:14" or "00:04:14.5000000"
        const timeParts = duration.split(':')
        if (timeParts.length >= 2) {
            const hours = parseInt(timeParts[0], 10) || 0
            const minutes = parseInt(timeParts[1], 10) || 0
            const secondsParts = timeParts[2] ? timeParts[2].split('.')[0] : '0'
            const seconds = parseInt(secondsParts, 10) || 0

            const totalMinutes = hours * 60 + minutes
            return `${totalMinutes}:${seconds.toString().padStart(2, '0')}`
        }

        // Handle ISO 8601 duration format: "PT4M14S"
        const iso8601Match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/)
        if (iso8601Match) {
            const hours = parseInt(iso8601Match[1], 10) || 0
            const minutes = parseInt(iso8601Match[2], 10) || 0
            const seconds = Math.floor(parseFloat(iso8601Match[3]) || 0)

            const totalMinutes = hours * 60 + minutes
            return `${totalMinutes}:${seconds.toString().padStart(2, '0')}`
        }
    }

    // If duration is an object (some JSON serialization formats)
    if (typeof duration === 'object' && duration !== null) {
        const totalSeconds = (duration.hours || 0) * 3600 + (duration.minutes || 0) * 60 + (duration.seconds || 0)
        const minutes = Math.floor(totalSeconds / 60)
        const seconds = Math.floor(totalSeconds % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    return '--:--'
}

export default ProjectDetail