import { useNavigate } from 'react-router-dom'
import donutLogo from '../../assets/donut.logo.actual.png'
import './ProjectHeader.css'

function ProjectHeader({
    project,
    onStatusUpdate,
    onBack,
    activeTheme,
    children // For tabs or other header actions
}) {
    const navigate = useNavigate()

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            navigate('/dashboard')
        }
    }

    return (
        <div className="project-header" style={{ background: activeTheme.background, color: activeTheme.text }}>
            <button onClick={handleBack} className="back-btn">
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

                <div className="project-details" style={{ color: activeTheme.text }}>
                    <h1 className="project-title">{project.title}</h1>
                    {project.artistName && (
                        <p className="project-artist">by {project.artistName}</p>
                    )}
                    <p className="project-description">{project.description}</p>
                    <div
                        className="project-status"
                        onClick={onStatusUpdate}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        title="Click to toggle status"
                    >
                        Status: {project.status === 1 ? 'Doing' : project.status === 2 ? 'Done' : project.status}
                    </div>
                </div>
            </div>

            {children && (
                <div className="header-actions">
                    {children}
                </div>
            )}
        </div>
    )
}

export default ProjectHeader
