import React from 'react'
import { useAudioPlayer } from '../../context/AudioPlayerContext'
import './PlaybackBar.css'

function PlaybackBar() {
    const {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        togglePlayPause,
        playNext,
        playPrevious,
        seekTo,
        setPlayerVolume,
        toggleMute,
        formatTime
    } = useAudioPlayer()

    // Don't render if no track is loaded
    if (!currentTrack) {
        return null
    }

    const handleProgressClick = (e) => {
        const progressBar = e.currentTarget
        const rect = progressBar.getBoundingClientRect()
        const percent = (e.clientX - rect.left) / rect.width
        const newTime = percent * duration
        seekTo(newTime)
    }

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value)
        setPlayerVolume(newVolume)
    }

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
        <div className="playback-bar">
            <div className="playback-content">
                {/* Track Info */}
                <div className="track-info">
                    <div className="track-details">
                        <div className="track-title">{currentTrack.title}</div>
                        <div className="track-artist">
                            {currentTrack.uploadedBy?.displayName || 'Unknown Artist'}
                        </div>
                    </div>
                </div>

                {/* Playback Controls */}
                <div className="playback-controls">
                    <div className="control-buttons">
                        <button
                            className="control-btn previous-btn"
                            onClick={playPrevious}
                            title="Previous track"
                        >
                            ⏮
                        </button>

                        <button
                            className="control-btn play-pause-btn"
                            onClick={togglePlayPause}
                            title={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? '⏸' : '▶'}
                        </button>

                        <button
                            className="control-btn next-btn"
                            onClick={playNext}
                            title="Next track"
                        >
                            ⏭
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-section">
                        <span className="time-display current-time">
                            {formatTime(currentTime)}
                        </span>

                        <div
                            className="progress-bar"
                            onClick={handleProgressClick}
                        >
                            <div className="progress-track">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${progressPercent}%` }}
                                />
                                <div
                                    className="progress-thumb"
                                    style={{ left: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        <span className="time-display total-time">
                            {formatTime(duration)}
                        </span>
                    </div>
                </div>

                {/* Volume Controls */}
                <div className="volume-controls">
                    <button
                        className="volume-btn"
                        onClick={toggleMute}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? '▁' : volume > 0.7 ? '▇' : volume > 0.3 ? '▅' : '▃'}
                    </button>

                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="volume-slider"
                        title="Volume"
                    />
                </div>
            </div>
        </div>
    )
}

export default PlaybackBar