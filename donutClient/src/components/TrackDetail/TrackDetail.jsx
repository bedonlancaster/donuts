import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAudioPlayer } from '../../context/AudioPlayerContext'
import HitList from '../HitList/HitList'
import donutLogo from '../../assets/donut.logo.actual.png'
import './TrackDetail.css'

// Import the same color palettes and helper functions from ProjectDetail
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
    },
    Salmon: {
        light: { primary: '#E68B8B', secondary: '#F2B5B5', accent: '#EBA0A0', background: '#FEF6F6', text: '#3A1F1F' },
        dark: { primary: '#F2B5B5', secondary: '#E09999', accent: '#F5C8C8', background: '#A85555', text: '#FFFFFF' }
    },
    Moss: {
        light: { primary: '#7D8471', secondary: '#A3A895', accent: '#909682', background: '#F6F7F4', text: '#2A2F25' },
        dark: { primary: '#A3A895', secondary: '#919584', accent: '#B6B8A5', background: '#4A5441', text: '#FFFFFF' }
    },
    Dusk: {
        light: { primary: '#A89B9B', secondary: '#C4BABA', accent: '#B6ABAB', background: '#F9F7F7', text: '#3E2A2A' },
        dark: { primary: '#C4BABA', secondary: '#B2A8A8', accent: '#D0C6C6', background: '#6B5B5B', text: '#FFFFFF' }
    },
    Stone: {
        light: { primary: '#9B8B82', secondary: '#BFB0A7', accent: '#ADA095', background: '#F8F6F4', text: '#2F2520' },
        dark: { primary: '#BFB0A7', secondary: '#AD9E95', accent: '#CFC0B7', background: '#5B4B42', text: '#FFFFFF' }
    },
    Mist: {
        light: { primary: '#A8B5B2', secondary: '#C6D0CE', accent: '#B7C3C0', background: '#F7F9F8', text: '#2A3532' },
        dark: { primary: '#C6D0CE', secondary: '#B4BEBC', accent: '#D8E2E0', background: '#586562', text: '#FFFFFF' }
    }
}

function TrackDetail({ user, onLogout }) {
    // Delete track handler
    const handleDeleteTrack = async () => {
        if (!trackId) return;
        if (!window.confirm('Are you sure you want to delete this track? This action cannot be undone.')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/tracks/${trackId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                navigate(`/project/${projectId}`);
            } else {
                alert('Failed to delete track.');
            }
        } catch (error) {
            console.error('Error deleting track:', error);
            alert('Error deleting track.');
        }
    };
    const { projectId, trackId } = useParams()
    const navigate = useNavigate()
    const { currentTheme } = useTheme()
    const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudioPlayer()

    const [track, setTrack] = useState(null)
    const [project, setProject] = useState(null) // We need project info for theme and display
    // Theme is now set by ThemeLoader; no local theme state needed
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('details')

    // Debug logging
    console.log('TrackDetail component mounted')
    console.log('Project ID from URL:', projectId)
    console.log('Track ID from URL:', trackId)
    console.log('Current theme:', currentTheme)

    // Theme is set by ThemeLoader; no need to set theme here

    // Palette mapping is now centralized in themeUtils

    // Fetch track details (which includes project info)
    useEffect(() => {
        const fetchTrack = async () => {
            try {
                setLoading(true)
                console.log('Fetching track with ID:', trackId)

                const response = await fetch(`http://localhost:5000/api/tracks/${trackId}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                if (response.ok) {
                    const trackData = await response.json()
                    console.log('Track data:', trackData)
                    setTrack(trackData)
                    setProject(trackData.project) // Extract project info from track response
                } else if (response.status === 404) {
                    setError('Track not found')
                } else if (response.status === 403) {
                    setError('You don\'t have access to this track')
                } else if (response.status === 401) {
                    setError('Please log in to view this track')
                } else {
                    const errorText = await response.text()
                    console.error('API error:', response.status, errorText)
                    setError(`Failed to load track: ${response.status}`)
                }
            } catch (err) {
                console.error('Error fetching track:', err)
                setError('Network error loading track')
            } finally {
                setLoading(false)
            }
        }

        if (trackId) {
            fetchTrack()
        }
    }, [trackId])

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

    const handlePlayTrack = () => {
        if (!track) return

        // Check if this track is already playing
        if (currentTrack && currentTrack.id === track.id) {
            // Toggle play/pause for current track
            togglePlayPause()
        } else {
            // Get the full project tracks for playlist context
            // We need to fetch this from the project since track response may not include all tracks
            if (project && project.tracks && project.tracks.length > 0) {
                const trackList = project.tracks
                playTrack(track, trackList)
                console.log('Playing track with project playlist:', trackList.map(t => t.title))
            } else {
                // Fallback: fetch project tracks to get full playlist
                fetchProjectTracks().then(tracks => {
                    if (tracks && tracks.length > 0) {
                        playTrack(track, tracks)
                        console.log('Playing track with fetched playlist:', tracks.map(t => t.title))
                    } else {
                        playTrack(track) // Play just this track if no playlist available
                    }
                })
            }
        }
    }

    // Helper function to fetch project tracks for playlist context
    const fetchProjectTracks = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            })

            if (response.ok) {
                const projectData = await response.json()
                return projectData.tracks || []
            }
        } catch (error) {
            console.error('Error fetching project tracks:', error)
        }
        return []
    }

    const formatDuration = (duration) => {
        if (!duration) return '--:--'
        const minutes = Math.floor(duration / 60)
        const seconds = duration % 60
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    if (loading) {
        return (
            <div className="track-detail">
                <div className="loading-state">
                    <p>Loading track...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="track-detail">
                <div className="error-state">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate(`/project/${projectId}`)}>

                    </button>
                </div>
            </div>
        )
    }

    if (!track || !project) {
        return (
            <div className="track-detail">
                <div className="error-state">
                    <h2>Track not found</h2>
                    <button onClick={() => navigate(`/project/${projectId}`)}>

                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="track-detail">
            {/* Header - Same structure as ProjectDetail */}
            <div className="project-header">
                <button
                    className="back-btn"
                    onClick={() => navigate(`/project/${projectId}`)}
                >
                    ←
                </button>

                <div className="project-info">
                    <div className="project-artwork">
                        <img
                            src={project.artworkUrl ? `http://localhost:5000${project.artworkUrl}` : donutLogo}
                            alt={project.title}
                            className="artwork-image"
                        />
                    </div>

                    <div className="project-details">
                        <h1 className="project-title">{project.title}</h1>
                        {project.artistName && (
                            <p className="project-artist">by {project.artistName}</p>
                        )}
                        <p className="project-description">{project.description}</p>
                        <div className="project-status">Status: {project.status}</div>
                    </div>
                </div>

                <div className="header-actions">
                    <div className="user-profile">
                        <div className="profile-avatar">
                            {user.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-info">
                            <div className="profile-name">{user.displayName}</div>
                            <div className="profile-role">
                                {user.isProducer && user.isArtist ? 'Producer & Artist' :
                                    user.isProducer ? 'Producer' : 'Artist'}
                            </div>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation - Similar to ProjectDetail but track-specific */}
            <div className="project-tabs">
                <button
                    className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveTab('details')}
                >
                    Track Details
                </button>
                <button
                    className={`tab-btn ${activeTab === 'hitlist' ? 'active' : ''}`}
                    onClick={() => setActiveTab('hitlist')}
                >
                    Hit List
                    {track.hitListItems && track.hitListItems.length > 0 && (
                        <span className="tab-badge">({track.hitListItems.length})</span>
                    )}
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'details' && (
                    <div className="details-section">
                        <div className="section-header">
                            <h2>Track Information</h2>
                        </div>

                        {/* Track Header Info */}
                        <div className="track-header-info">
                            <h2 className="track-title">
                                <span className="track-indicator"></span>
                                {track.title}
                            </h2>
                            {(project?.ArtistName || project?.artistName) && (
                                <div className="track-artist" style={{ fontSize: '1.1rem', color: 'var(--theme-text)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                                    By {project.ArtistName || project.artistName}
                                </div>
                            )}
                            <p className="track-meta">
                                Track #{track.orderIndex} • Uploaded by {track.uploadedBy?.displayName}
                                {track.duration && ` • ${formatDuration(track.duration)}`}
                            </p>
                            <button
                                className="play-btn track-play-btn"
                                onClick={handlePlayTrack}
                                title={currentTrack && currentTrack.id === track.id && isPlaying ? 'Pause' : 'Play'}
                            >
                                {currentTrack && currentTrack.id === track.id && isPlaying ? '⏸' : '▶'}

                            </button>
                        </div>

                        <div className="track-details-grid">
                            <div className="detail-item">
                                <label>File Type</label>
                                <span>{track.fileType?.toUpperCase() || 'Unknown'}</span>
                            </div>

                            <div className="detail-item">
                                <label>Duration</label>
                                <span>{track.duration ? formatDuration(track.duration) : 'Unknown'}</span>
                            </div>

                            <div className="detail-item">
                                <label>Status</label>
                                <span className="status-badge">{track.status}</span>
                            </div>

                            <div className="detail-item">
                                <label>Order</label>
                                <span>Track #{track.orderIndex}</span>
                            </div>

                            <div className="detail-item">
                                <label>Uploaded By</label>
                                <span>{track.uploadedBy?.displayName || 'Unknown'}</span>
                            </div>
                        </div>

                        {/* Removed embedded audio player. Use global PlaybackBar only. */}
                        <div style={{ marginTop: '2rem' }}>
                            <button
                                className="delete-btn track-delete-btn"
                                style={{ background: 'var(--theme-primary)', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                onClick={handleDeleteTrack}
                            >
                                Delete Track
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'hitlist' && (
                    <div className="hitlist-section">
                        <div className="section-header">
                            <h2>Track Hit List</h2>
                            <p>Create a to-do list to get things done</p>
                        </div>
                        <HitList trackId={trackId} projectId={project.id} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default TrackDetail