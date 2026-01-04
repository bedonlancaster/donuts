import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import KanbanHitList from '../HitList/KanbanHitList';
import ProjectHeader from '../ProjectHeader/ProjectHeader';
// import donutLogo from '../../assets/donut.logo.actual.png'
import './TrackDetail.css';

// Import the same color palettes and helper functions from ProjectDetail
const COLOR_PALETTES = {
  Coral: {
    light: {
      primary: '#E87A7A',
      secondary: '#FFE5E5',
      accent: '#D66B6B',
      background: '#FFFFFF',
      text: '#4A4A4A',
    },
    dark: {
      primary: '#FFE5E5',
      secondary: '#F0B8B8',
      accent: '#FFF0F0',
      background: '#8B4A4A',
      text: '#FFFFFF',
    },
  },
  Peach: {
    light: {
      primary: '#F4A688',
      secondary: '#F7C4A0',
      accent: '#F19A7B',
      background: '#FDF7F3',
      text: '#3D2B1F',
    },
    dark: {
      primary: '#F7C4A0',
      secondary: '#E6B89A',
      accent: '#F5D4C4',
      background: '#8B5A42',
      text: '#FFFFFF',
    },
  },
  Sage: {
    light: {
      primary: '#8B9D77',
      secondary: '#A8B89A',
      accent: '#98A888',
      background: '#F4F6F1',
      text: '#2D3A24',
    },
    dark: {
      primary: '#A8B89A',
      secondary: '#9BAA88',
      accent: '#B8C7A5',
      background: '#556B47',
      text: '#FFFFFF',
    },
  },
  Clay: {
    light: {
      primary: '#C49B7C',
      secondary: '#D4B5A0',
      accent: '#CC9F85',
      background: '#FAF6F2',
      text: '#3E2723',
    },
    dark: {
      primary: '#D4B5A0',
      secondary: '#C2A693',
      accent: '#E0C4B0',
      background: '#7A5A47',
      text: '#FFFFFF',
    },
  },
  Slate: {
    light: {
      primary: '#7A8B99',
      secondary: '#A0B1BE',
      accent: '#8A9BAA',
      background: '#F2F4F6',
      text: '#2C3E50',
    },
    dark: {
      primary: '#A0B1BE',
      secondary: '#8FA0AD',
      accent: '#B5C6D3',
      background: '#4A5B69',
      text: '#FFFFFF',
    },
  },
  Salmon: {
    light: {
      primary: '#E68B8B',
      secondary: '#F2B5B5',
      accent: '#EBA0A0',
      background: '#FEF6F6',
      text: '#3A1F1F',
    },
    dark: {
      primary: '#F2B5B5',
      secondary: '#E09999',
      accent: '#F5C8C8',
      background: '#A85555',
      text: '#FFFFFF',
    },
  },
  Moss: {
    light: {
      primary: '#7D8471',
      secondary: '#A3A895',
      accent: '#909682',
      background: '#F6F7F4',
      text: '#2A2F25',
    },
    dark: {
      primary: '#A3A895',
      secondary: '#919584',
      accent: '#B6B8A5',
      background: '#4A5441',
      text: '#FFFFFF',
    },
  },
  Dusk: {
    light: {
      primary: '#A89B9B',
      secondary: '#C4BABA',
      accent: '#B6ABAB',
      background: '#F9F7F7',
      text: '#3E2A2A',
    },
    dark: {
      primary: '#C4BABA',
      secondary: '#B2A8A8',
      accent: '#D0C6C6',
      background: '#6B5B5B',
      text: '#FFFFFF',
    },
  },
  Stone: {
    light: {
      primary: '#9B8B82',
      secondary: '#BFB0A7',
      accent: '#ADA095',
      background: '#F8F6F4',
      text: '#2F2520',
    },
    dark: {
      primary: '#BFB0A7',
      secondary: '#AD9E95',
      accent: '#CFC0B7',
      background: '#5B4B42',
      text: '#FFFFFF',
    },
  },
  Mist: {
    light: {
      primary: '#A8B5B2',
      secondary: '#C6D0CE',
      accent: '#B7C3C0',
      background: '#F7F9F8',
      text: '#2A3532',
    },
    dark: {
      primary: '#C6D0CE',
      secondary: '#B4BEBC',
      accent: '#D8E2E0',
      background: '#586562',
      text: '#FFFFFF',
    },
  },
};

function TrackDetail({ user, onLogout }) {
  // Delete track handler
  const handleDeleteTrack = async () => {
    if (!trackId) return;
    if (
      !window.confirm(
        'Are you sure you want to delete this track? This action cannot be undone.'
      )
    )
      return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/tracks/${trackId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
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

  const handleUpdateTrackStatus = async () => {
    if (!track) return;

    const newStatus = track.status === 1 ? 2 : 1;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/tracks/${trackId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (response.ok) {
        setTrack({ ...track, status: newStatus });
      } else {
        console.error('Failed to update track status:', response.status);
      }
    } catch (error) {
      console.error('Error updating track status:', error);
    }
  };

  const handleUpdateProjectStatus = async () => {
    if (!project) return;

    const newStatus = project.status === 1 ? 2 : 1;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: project.title,
            artistName: project.artistName,
            description: project.description,
            status: newStatus,
          }),
        }
      );

      if (response.ok) {
        setProject({ ...project, status: newStatus });
      } else {
        console.error('Failed to update project status:', response.status);
      }
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const { projectId, trackId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentTheme } = useTheme();
  const { playTrack, currentTrack, isPlaying, togglePlayPause } =
    useAudioPlayer();

  const [track, setTrack] = useState(null);
  const [project, setProject] = useState(null); // We need project info for theme and display
  const [allTracks, setAllTracks] = useState([]); // All project tracks for navigation
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  // Theme is now set by ThemeLoader; no local theme state needed
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false); // Separate state for track navigation
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') || 'hitlist'
  );

  // Theme is set by ThemeLoader; no need to set theme here

  // Palette mapping is now centralized in themeUtils

  // Fetch track details (which includes project info)
  useEffect(() => {
    const fetchTrack = async () => {
      try {
        // Only show full loading on initial load, not when navigating between tracks
        if (!allTracks.length) {
          setLoading(true);
        } else {
          setIsNavigating(true);
        }

        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:5000/api/tracks/${trackId}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const trackData = await response.json();
          setTrack(trackData);

          // Only update project if it's not already set or if it's a different project
          if (!project || project.id !== trackData.project.id) {
            setProject(trackData.project);
          }

          // Only fetch full project data if we don't have tracks yet
          if (
            allTracks.length === 0 &&
            trackData.project &&
            trackData.project.id
          ) {
            const token = localStorage.getItem('token');
            const projectResponse = await fetch(
              `http://localhost:5000/api/projects/${trackData.project.id}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (projectResponse.ok) {
              const fullProjectData = await projectResponse.json();
              if (fullProjectData.tracks && fullProjectData.tracks.length > 0) {
                const tracks = fullProjectData.tracks.sort(
                  (a, b) => a.orderIndex - b.orderIndex
                );
                setAllTracks(tracks);
                const index = tracks.findIndex(
                  (t) => t.id === parseInt(trackId)
                );
                setCurrentTrackIndex(index);
              }
            }
          } else if (allTracks.length > 0) {
            // Just update the index if we already have tracks
            const index = allTracks.findIndex(
              (t) => t.id === parseInt(trackId)
            );
            setCurrentTrackIndex(index);
          }
        } else if (response.status === 404) {
          setError('Track not found');
        } else if (response.status === 403) {
          setError("You don't have access to this track");
        } else if (response.status === 401) {
          setError('Please log in to view this track');
        } else {
          const errorText = await response.text();
          console.error('API error:', response.status, errorText);
          setError(`Failed to load track: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching track:', err);
        setError('Network error loading track');
      } finally {
        setLoading(false);
        setIsNavigating(false);
      }
    };

    if (trackId) {
      fetchTrack();
    }
  }, [trackId]);

  const handlePlayTrack = () => {
    if (!track) return;

    // Check if this track is already playing
    if (currentTrack && currentTrack.id === track.id) {
      // Toggle play/pause for current track
      togglePlayPause();
    } else {
      // Get the full project tracks for playlist context
      // We need to fetch this from the project since track response may not include all tracks
      if (project && project.tracks && project.tracks.length > 0) {
        const trackList = project.tracks;
        playTrack(track, trackList);
      } else {
        // Fallback: fetch project tracks to get full playlist
        fetchProjectTracks().then((tracks) => {
          if (tracks && tracks.length > 0) {
            playTrack(track, tracks);
          } else {
            playTrack(track); // Play just this track if no playlist available
          }
        });
      }
    }
  };

  // Helper function to fetch project tracks for playlist context
  const fetchProjectTracks = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${projectId}`,
        {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
        }
      );

      if (response.ok) {
        const projectData = await response.json();
        return projectData.tracks || [];
      }
    } catch (error) {
      console.error('Error fetching project tracks:', error);
    }
    return [];
  };

  const handleNavigateTrack = (direction) => {
    if (!allTracks || allTracks.length === 0) return;

    let newIndex = currentTrackIndex;
    if (direction === 'prev') {
      // Wrap to last track if at beginning
      newIndex =
        currentTrackIndex <= 0 ? allTracks.length - 1 : currentTrackIndex - 1;
    } else if (direction === 'next') {
      // Wrap to first track if at end
      newIndex =
        currentTrackIndex >= allTracks.length - 1 ? 0 : currentTrackIndex + 1;
    }

    if (newIndex !== currentTrackIndex) {
      const targetTrack = allTracks[newIndex];
      navigate(`/project/${projectId}/track/${targetTrack.id}?tab=hitlist`);
    }
  };

  const formatDuration = (duration) => {
    if (!duration) return '--:--';

    // Handle different duration formats from the API

    // If duration is already a number (seconds), use it directly
    if (typeof duration === 'number') {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // If duration is a string (TimeSpan format from C#), parse it
    if (typeof duration === 'string') {
      // Handle TimeSpan format: "00:04:14" or "00:04:14.5000000"
      const timeParts = duration.split(':');
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0], 10) || 0;
        const minutes = parseInt(timeParts[1], 10) || 0;
        const secondsParts = timeParts[2] ? timeParts[2].split('.')[0] : '0';
        const seconds = parseInt(secondsParts, 10) || 0;

        const totalMinutes = hours * 60 + minutes;
        return `${totalMinutes}:${seconds.toString().padStart(2, '0')}`;
      }

      // Handle ISO 8601 duration format: "PT4M14S"
      const iso8601Match = duration.match(
        /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/
      );
      if (iso8601Match) {
        const hours = parseInt(iso8601Match[1], 10) || 0;
        const minutes = parseInt(iso8601Match[2], 10) || 0;
        const seconds = Math.floor(parseFloat(iso8601Match[3]) || 0);

        const totalMinutes = hours * 60 + minutes;
        return `${totalMinutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }

    // If duration is an object (some JSON serialization formats)
    if (typeof duration === 'object' && duration !== null) {
      const totalSeconds =
        (duration.hours || 0) * 3600 +
        (duration.minutes || 0) * 60 +
        (duration.seconds || 0);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return '--:--';
  };

  if (loading) {
    return (
      <div className="track-detail">
        <div className="loading-state">
          <p>Loading track...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="track-detail">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(`/project/${projectId}`)}></button>
        </div>
      </div>
    );
  }

  if (!track || !project) {
    return (
      <div className="track-detail">
        <div className="error-state">
          <h2>Track not found</h2>
          <button onClick={() => navigate(`/project/${projectId}`)}></button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="track-detail"
      style={{
        opacity: isNavigating ? 0.6 : 1,
        transition: 'opacity 0.15s ease',
      }}
    >
      {/* Header - Using shared ProjectHeader component */}
      <ProjectHeader
        project={project}
        onStatusUpdate={handleUpdateProjectStatus}
        onBack={() => navigate(`/project/${projectId}`)}
        activeTheme={currentTheme}
      >
        {/* Track-specific tabs */}
        <div className="project-tabs-inline">
          <button
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
            style={{
              color:
                activeTab === 'details'
                  ? 'var(--theme-primary)'
                  : 'var(--theme-text)',
              borderBottom:
                activeTab === 'details'
                  ? '2px solid var(--theme-primary)'
                  : 'none',
            }}
          >
            Track Details
          </button>
          <button
            className={`tab-btn ${activeTab === 'hitlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('hitlist')}
            style={{
              color:
                activeTab === 'hitlist'
                  ? 'var(--theme-primary)'
                  : 'var(--theme-text)',
              borderBottom:
                activeTab === 'hitlist'
                  ? '2px solid var(--theme-primary)'
                  : 'none',
            }}
          >
            Hit List
            {track.hitListItems && track.hitListItems.length > 0 && (
              <span className="tab-badge">({track.hitListItems.length})</span>
            )}
          </button>
        </div>

        <div className="user-profile">
          <div className="avatar avatar-theme">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <div className="profile-name">{user.username}</div>
            <div className="profile-role">Collaborator</div>
          </div>
        </div>
      </ProjectHeader>

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
                <div
                  className="track-artist"
                  style={{
                    fontSize: '1.1rem',
                    color: 'var(--theme-text)',
                    marginBottom: '0.5rem',
                    fontStyle: 'italic',
                  }}
                >
                  By {project.ArtistName || project.artistName}
                </div>
              )}
              <p className="track-meta">
                Track #{track.orderIndex} • Created by{' '}
                {track.createdBy?.username}
                {track.currentVersion?.duration && ` • ${formatDuration(track.currentVersion.duration)}`}
                {track.currentVersion && ` • v${track.currentVersion.versionNumber}`}
              </p>
              <button
                className="play-btn track-play-btn"
                onClick={handlePlayTrack}
                title={
                  currentTrack && currentTrack.id === track.id && isPlaying
                    ? 'Pause'
                    : 'Play'
                }
              >
                {currentTrack && currentTrack.id === track.id && isPlaying
                  ? '⏸'
                  : '▶'}
              </button>
            </div>

            <div className="track-details-grid">
              <div className="detail-item">
                <label>File Type</label>
                <span>{track.currentVersion?.fileType?.toUpperCase() || 'Unknown'}</span>
              </div>

              <div className="detail-item">
                <label>Duration</label>
                <span>
                  {track.currentVersion?.duration ? formatDuration(track.currentVersion.duration) : 'Unknown'}
                </span>
              </div>

              <div className="detail-item">
                <label>Versions</label>
                <span>{track.versionCount || 1} version{track.versionCount !== 1 ? 's' : ''}</span>
              </div>

              <div className="detail-item">
                <label>Status</label>
                <span
                  className="status-badge"
                  onClick={handleUpdateTrackStatus}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title="Click to toggle status"
                >
                  {track.status === 1
                    ? 'Doing'
                    : track.status === 2
                      ? 'Done'
                      : track.status}
                </span>
              </div>

              <div className="detail-item">
                <label>Order</label>
                <span>Track #{track.orderIndex}</span>
              </div>

              <div className="detail-item">
                <label>Uploaded By</label>
                <span>{track.uploadedBy?.username || 'Unknown'}</span>
              </div>
            </div>

            {/* Removed embedded audio player. Use global PlaybackBar only. */}
            <div style={{ marginTop: '2rem' }}>
              <button
                className="delete-btn track-delete-btn"
                style={{
                  background: 'var(--theme-primary)',
                  color: 'white',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
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
              <div className="header-with-play">
                <button
                  className="track-title-play-btn"
                  onClick={handlePlayTrack}
                  title={
                    currentTrack && currentTrack.id === track.id && isPlaying
                      ? 'Pause'
                      : 'Play'
                  }
                >
                  {currentTrack && currentTrack.id === track.id && isPlaying
                    ? '⏸'
                    : '▶'}
                </button>
                <h2>{track.title}</h2>
              </div>
              <p>Create a Hit List to get things DONE</p>
            </div>
            <KanbanHitList
              trackId={trackId}
              projectId={project.id}
              allTracks={allTracks}
              currentTrackIndex={currentTrackIndex}
              onNavigateTrack={handleNavigateTrack}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackDetail;
