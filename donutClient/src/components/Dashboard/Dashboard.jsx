import { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { getAuthHeaders } from '../../utils/auth'
import donutLogo from '../../assets/donut.logo.actual.png'
import donutsText from '../../assets/donuts.text.actual.png'
import InvitationNotifications from '../InvitationNotifications/InvitationNotifications'
import './Dashboard.css'

function Dashboard({ user, onLogout }) {
    const { resetToDefaultTheme } = useTheme();
    const navigate = useNavigate()
    const [selectedSection, setSelectedSection] = useState('donuts')
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showInvitations, setShowInvitations] = useState(false)
    const [invitationCount, setInvitationCount] = useState(0)

    // Fetch user's projects from the API and reset theme on mount
    useEffect(() => {
        resetToDefaultTheme();
        const fetchProjects = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/projects', {
                    method: 'GET',
                    headers: getAuthHeaders()
                })
                if (response.ok) {
                    const projectsData = await response.json()
                    setProjects(projectsData)
                } else if (response.status === 401) {
                    // Unauthorized - likely a new user or session issue, just show empty state
                    setProjects([])
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
        fetchInvitationCount()
    }, [resetToDefaultTheme])

    // Fetch pending invitation count
    const fetchInvitationCount = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/invitations/count/pending', {
                method: 'GET',
                headers: getAuthHeaders()
            })
            if (response.ok) {
                const data = await response.json()
                setInvitationCount(data.count)
            }
        } catch (err) {
            console.error('Error fetching invitation count:', err)
        }
    }

    const handleInvitationsClose = () => {
        setShowInvitations(false)
        fetchInvitationCount() // Refresh count when closing
        // Optionally refresh projects if invitations were accepted
        const fetchProjects = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/projects', {
                    method: 'GET',
                    headers: getAuthHeaders()
                })
                if (response.ok) {
                    const projectsData = await response.json()
                    setProjects(projectsData)
                }
            } catch (err) {
                console.error('Error fetching projects:', err)
            }
        }
        fetchProjects()
    }

    const handleInvitationAccepted = async () => {
        // Refresh projects to show the newly accepted project
        try {
            const response = await fetch('http://localhost:5000/api/projects', {
                method: 'GET',
                headers: getAuthHeaders()
            })
            if (response.ok) {
                const projectsData = await response.json()
                setProjects(projectsData)
            }
        } catch (err) {
            console.error('Error refreshing projects:', err)
        }

        // Refresh invitation count
        fetchInvitationCount()
    }

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                headers: getAuthHeaders()
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
            className="card"
            onClick={() => navigate(`/project/${project.id}`)}
        >
            <div className="donut-artwork">
                <img
                    src={project.artworkUrl ? `http://localhost:5000${project.artworkUrl}` : donutLogo}
                    alt={project.title}
                    className="donut-logo"
                />
                {/* <div className="donut-status">{project.status === 1 ? 'Doing' : project.status === 2 ? 'Done' : project.status}</div> */}
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
                    <div className="header-logo-container">
                        <img src={donutsText} alt="DONUTS" className="dashboard-title-logo" />
                        <img src={donutLogo} alt="Donut Logo" className="dashboard-donut-logo" />
                    </div>
                    <p className="content-subtitle">
                        Collaborative projects with people
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
                            <h3>Ready to start your first DONUT?</h3>
                            <p>Click "+ Create" to begin a new collaborative project.</p>
                        </div>
                    )}
                </div>

                <InvitationNotifications
                    isOpen={showInvitations}
                    onClose={handleInvitationsClose}
                    onInvitationAccepted={handleInvitationAccepted}
                />
            </div>

            {/* Right Sidebar Navigation */}
            <div className="dashboard-sidebar">
                <div className="sidebar-header">
                    <div className="logo"></div>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={`nav-item ${selectedSection === 'donuts' ? 'active' : ''}`}
                        onClick={() => setSelectedSection('donuts')}
                    >
                        My DONUTS
                    </button>
                    <button
                        className="nav-item nav-item-sub invitations-btn"
                        onClick={() => setShowInvitations(true)}
                    >
                        Invitations
                        {invitationCount > 0 && (
                            <span className="invitation-badge">{invitationCount}</span>
                        )}
                    </button>
                    {/* <button
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
                    </button> */}
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
                        <div className="avatar avatar-brand">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-info">
                            <div className="profile-name">{user.username}</div>
                            <div className="profile-role">Collaborator</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Dashboard