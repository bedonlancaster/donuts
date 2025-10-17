import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import donutLogo from '../../assets/donut.logo.actual.png'
import './Dashboard.css'

function Dashboard({ user, onLogout }) {
    const navigate = useNavigate()
    const [selectedSection, setSelectedSection] = useState('donuts')

    // Mock data for DONUTS (projects) - will be replaced with API calls
    const mockDonuts = [
        {
            id: 1,
            title: "Midnight Vibes",
            artistName: "Sarah Chen",
            artwork: null, // placeholder for now
            status: "In Progress"
        },
        {
            id: 2,
            title: "Summer Breeze",
            artistName: "Mike Rodriguez",
            artwork: null,
            status: "Mixing"
        },
        {
            id: 3,
            title: "City Lights",
            artistName: "Alex Johnson",
            artwork: null,
            status: "Recording"
        },
        {
            id: 4,
            title: "Ocean Dreams",
            artistName: "Taylor Swift",
            artwork: null,
            status: "Complete"
        },
        {
            id: 5,
            title: "Neon Nights",
            artistName: "Chris Martin",
            artwork: null,
            status: "In Progress"
        }
    ]

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

    const renderDonutCard = (donut) => (
        <div key={donut.id} className="donut-card">
            <div className="donut-artwork">
                <img
                    src={donutLogo}
                    alt={donut.title}
                    className="donut-logo"
                />
                <div className="donut-status">{donut.status}</div>
            </div>
            <div className="donut-info">
                <h3 className="donut-title">{donut.title}</h3>
                <p className="donut-artist">{donut.artistName}</p>
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
                    {mockDonuts.map(renderDonutCard)}
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