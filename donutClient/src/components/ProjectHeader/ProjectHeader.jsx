import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { getAuthHeaders } from '../../utils/auth'
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
    const [showArtworkModal, setShowArtworkModal] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else {
            navigate('/dashboard')
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setSelectedFile(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const handleUploadArtwork = async () => {
        if (!selectedFile) return

        const formData = new FormData()
        formData.append('artwork', selectedFile)

        try {
            const response = await fetch(`http://localhost:5000/api/projects/${project.id}/artwork`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: formData
            })

            if (response.ok) {
                window.location.reload() // Reload to show new artwork
            } else {
                alert('Failed to upload artwork')
            }
        } catch (err) {
            console.error('Error uploading artwork:', err)
            alert('Failed to upload artwork')
        }
    }

    const closeModal = () => {
        setShowArtworkModal(false)
        setSelectedFile(null)
        setPreviewUrl(null)
    }

    return (
        <>
            <div className="project-header" style={{ background: activeTheme.background, color: activeTheme.text }}>
                <button onClick={handleBack} className="back-btn">
                    ←
                </button>

                <div className="project-info">
                    <div className="project-artwork" onClick={() => setShowArtworkModal(true)} style={{ cursor: 'pointer' }} title="Click to view/change artwork">
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

            {/* Artwork Modal - Outside of header container */}
            {showArtworkModal && (
                <div className="artwork-modal-overlay" onClick={closeModal}>
                    <div className="artwork-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="artwork-modal-header">
                            <h2>Album Artwork</h2>
                            <button className="modal-close-btn" onClick={closeModal}>×</button>
                        </div>

                        <div className="artwork-modal-body">
                            <div className="artwork-preview-large">
                                <img
                                    src={previewUrl || (project.artworkUrl ? `http://localhost:5000${project.artworkUrl}` : donutLogo)}
                                    alt={project.title}
                                />
                            </div>

                            <div className="artwork-upload-section">
                                <label htmlFor="artwork-upload" className="artwork-upload-label">
                                    Choose New Artwork
                                </label>
                                <input
                                    id="artwork-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />

                                {selectedFile && (
                                    <div className="upload-actions">
                                        <p>Selected: {selectedFile.name}</p>
                                        <button className="upload-btn" onClick={handleUploadArtwork}>
                                            Upload
                                        </button>
                                        <button className="cancel-btn" onClick={() => {
                                            setSelectedFile(null)
                                            setPreviewUrl(null)
                                        }}>
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default ProjectHeader
