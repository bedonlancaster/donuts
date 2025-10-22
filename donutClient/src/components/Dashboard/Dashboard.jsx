import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import donutLogo from '../../assets/donut.logo.actual.png'
import './Dashboard.css'

function Dashboard({ user, onLogout }) {
    const { resetToDefaultTheme } = useTheme();
    const navigate = useNavigate()
    const [selectedSection, setSelectedSection] = useState('donuts')
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Fetch user's projects from the API and reset theme on mount
    useEffect(() => {
        resetToDefaultTheme();
        const fetchProjects = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/projects', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                if (response.ok) {
                    const projectsData = await response.json()
                    setProjects(projectsData)
                } else {
                    setError('Failed to load projects')
                }
            } catch (err) {
                console.error('Error fetching projects:', err)
                setError('Network error loading projects')
            } finally {
                setLoading(false)
            }
        }
        fetchProjects()
    }, [resetToDefaultTheme])

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

    const renderDonutCard = (project) => (
        <div
            key={project.id}
            className="donut-card"
            onClick={() => navigate(`/project/${project.id}`)}
        >
            <div className="donut-artwork">
                <img
                    src={project.artworkUrl ? `http://localhost:5000${project.artworkUrl}` : donutLogo}
                    alt={project.title}
                    className="donut-logo"
                />
                <div className="donut-status">{project.status}</div>
            </div>
            <div className="donut-info">
                <h3 className="donut-title">{project.title}</h3>
                <p className="donut-artist">{project.artistName || 'No artist name'}</p>
            </div>
        </div>
    )

    return (
        <div className="dashboard">
            {/* Main Content Area */}
            <div className="dashboard-main">
                <div className="content-header">
                    <h1>My DONUTS</h1>
                    <p className="content-subtitle">
                        {user.isProducer
                            ? "Your collaborative projects with artists"
                            : "Projects you're working on with producers"
                        }
                    </p>
                </div>

                <div className="donuts-grid">
                    {loading ? (
                        <div className="loading-message">Loading your DONUTs...</div>
                    ) : error ? (
                        <div className="error-message">{error}</div>
                    ) : projects.length > 0 ? (
                        projects.map(renderDonutCard)
                    ) : (
                        <div className="empty-state">
                            <h3>No DONUTs yet!</h3>
                            <p>Click "Create" to start your first collaborative project.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar Navigation */}
            <div className="dashboard-sidebar">
                <div className="sidebar-header">
                    <div className="logo">DONUTS</div>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${selectedSection === 'donuts' ? 'active' : ''}`}
                        onClick={() => setSelectedSection('donuts')}
                    >
                        My DONUTS
                    </button>
                    <button
                        className={`nav-item ${selectedSection === 'sessions' ? 'active' : ''}`}
                        onClick={() => setSelectedSection('sessions')}
                    >
                        Sessions
                    </button>
                    <button
                        className={`nav-item ${selectedSection === 'hitlist' ? 'active' : ''}`}
                        onClick={() => setSelectedSection('hitlist')}
                    >
                        Hit List
                    </button>
                </nav>

                <div className="sidebar-actions">
                    <button
                        className="create-btn"
                        onClick={() => navigate('/create')}
                    >
                        + Create
                    </button>
                </div>

                <div className="sidebar-footer">
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
        </div>
    )
}

export default Dashboard