import { useState } from 'react';
import './VersionUploadModal.css';

function VersionUploadModal({ track, onClose, onSuccess }) {
    const [audioFile, setAudioFile] = useState(null);
    const [notes, setNotes] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/x-m4a', 'audio/aac', 'audio/ogg'];
            if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|flac|m4a|aac|ogg)$/i)) {
                setError('Please select a valid audio file (MP3, WAV, FLAC, M4A, AAC, or OGG)');
                return;
            }

            // Validate file size (100MB max)
            if (file.size > 100 * 1024 * 1024) {
                setError('File size must be less than 100MB');
                return;
            }

            setError('');
            setAudioFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!audioFile) {
            setError('Please select an audio file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('audioFile', audioFile);
            if (notes.trim()) {
                formData.append('notes', notes.trim());
            }

            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:5000/api/tracks/${track.id}/versions`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload version');
            }

            // Fetch updated track data
            const trackResponse = await fetch(
                `http://localhost:5000/api/tracks/${track.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!trackResponse.ok) {
                throw new Error('Failed to fetch updated track');
            }

            const updatedTrack = await trackResponse.json();
            onSuccess(updatedTrack);
        } catch (err) {
            console.error('Error uploading version:', err);
            setError(err.message || 'Failed to upload version');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content version-upload-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Version</h2>
                    <button className="close-btn" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <div className="track-info-header">
                        <h3>{track.title}</h3>
                        <p className="current-version-info">
                            Current: v{track.currentVersionNumber || 1} ({track.versionCount || 1} version
                            {track.versionCount !== 1 ? 's' : ''} total)
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="audioFile">Audio File *</label>
                            <input
                                type="file"
                                id="audioFile"
                                accept=".mp3,.wav,.flac,.m4a,.aac,.ogg,audio/*"
                                onChange={handleFileChange}
                                disabled={uploading}
                                required
                            />
                            {audioFile && (
                                <p className="file-selected">
                                    Selected: {audioFile.name} ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                                </p>
                            )}
                            <p className="file-hint">
                                Supported formats: MP3, WAV, FLAC, M4A, AAC, OGG (Max 100MB)
                            </p>
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Version Notes (Optional)</label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="What changed in this version? (e.g., 'Added reverb to vocals', 'Fixed timing issue')"
                                rows="3"
                                disabled={uploading}
                                maxLength="500"
                            />
                            <p className="char-count">{notes.length}/500</p>
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={uploading || !audioFile}
                            >
                                {uploading ? 'Uploading...' : `Upload v${(track.currentVersionNumber || 1) + 1}`}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default VersionUploadModal;
