import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAuthHeaders, getAuthHeadersForFormData } from '../../utils/auth';
import donutLogo from '../../assets/donut.logo.actual.png';
import './UploadTrack.css';

function UploadTrack({ user, onLogout, onBack, onSuccess }) {
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    audioFile: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch project details to show context
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/projects/${projectId}`,
          {
            method: 'GET',
            headers: getAuthHeaders(),
          }
        );

        if (response.ok) {
          const projectData = await response.json();
          setProject(projectData);
        } else {
          setError('Failed to load project details');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Network error loading project');
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (audio files)
      const validTypes = [
        'audio/mpeg',
        'audio/wav',
        'audio/mp3',
        'audio/ogg',
        'audio/aac',
        'audio/flac',
      ];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid audio file (MP3, WAV, OGG, AAC, FLAC)');
        return;
      }

      // Validate file size (max 100MB for example)
      const maxSize = 100 * 1024 * 1024; // 100MB in bytes
      if (file.size > maxSize) {
        setError('File size must be less than 100MB');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        audioFile: file,
      }));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Please enter a track title');
      return;
    }

    if (!formData.audioFile) {
      setError('Please select an audio file');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('title', formData.title.trim());
      uploadData.append('audioFile', formData.audioFile);
      uploadData.append('projectId', projectId);
      uploadData.append('orderIndex', '0'); // Let backend auto-calculate
      uploadData.append('status', 'Doing'); // Default status

      const response = await fetch(`http://localhost:5000/api/tracks/upload`, {
        method: 'POST',
        headers: getAuthHeadersForFormData(),
        body: uploadData, // Don't set Content-Type header for FormData
      });

      if (response.ok) {
        const newTrack = await response.json();
        setSuccess('Track uploaded successfully!');
        setTimeout(() => {
          onSuccess(projectId); // Navigate back to project
        }, 1000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload track');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Network error during upload');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      onLogout();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!project) {
    return (
      <div className="upload-track-container">
        <div className="loading">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="upload-track-container">
      {/* Header */}
      <div className="upload-header">
        <div className="header-left">
          <img src={donutLogo} alt="DONUTS" className="logo" />
          <div className="project-context">
            <h1>Upload Track</h1>
            <p>to "{project.name}"</p>
          </div>
        </div>
        <div className="header-right">
          <span className="user-name">{user.username}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="upload-content">
        <div className="upload-form-container">
          <div className="form-header">
            <button className="back-btn" onClick={onBack}>
              ← Back to Project
            </button>
          </div>

          <form onSubmit={handleSubmit} className="upload-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Track Title */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Track Title *
              </label>
              <input
                type="text"
                id="title"
                className="form-input"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter track title..."
                disabled={isUploading}
                required
              />
            </div>

            {/* File Upload */}
            <div className="form-group">
              <label htmlFor="audioFile" className="form-label">
                Audio File *
              </label>
              <div className="file-upload-area">
                <input
                  type="file"
                  id="audioFile"
                  accept="audio/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="file-input"
                />
                <div className="file-upload-display">
                  {formData.audioFile ? (
                    <div className="file-info">
                      <div className="file-name">
                        📁 {formData.audioFile.name}
                      </div>
                      <div className="file-size">
                        {formatFileSize(formData.audioFile.size)}
                      </div>
                    </div>
                  ) : (
                    <div className="file-placeholder">
                      <div className="upload-icon">🎵</div>
                      <div className="upload-text">
                        <p>Click to select an audio file</p>
                        <p className="file-types">
                          Supports MP3, WAV, OGG, AAC, FLAC
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="upload-progress">
                <div className="progress-label">Uploading...</div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="progress-text">{uploadProgress}%</div>
              </div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-theme-outline"
                onClick={onBack}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-theme-primary"
                disabled={
                  isUploading || !formData.title.trim() || !formData.audioFile
                }
              >
                {isUploading ? 'Uploading...' : 'Upload Track'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UploadTrack;
