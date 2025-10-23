import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'

const AudioPlayerContext = createContext()

export const AudioPlayerProvider = ({ children }) => {
    // Playback state
    const [currentTrack, setCurrentTrack] = useState(null)
    const [currentProject, setCurrentProject] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [playlist, setPlaylist] = useState([])
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1)

    // Audio element ref
    const audioRef = useRef(null)
    const shouldAutoPlayRef = useRef(false) // Track if we should auto-play when ready
    const playNextRef = useRef(null) // Store playNext function for event handlers

    // Initialize audio element
    useEffect(() => {
        const audio = new Audio()
        audioRef.current = audio

        // Audio event listeners
        const handleLoadedMetadata = () => {
            setDuration(audio.duration)
        }

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime)
        }

        const handleEnded = () => {
            console.log('Track ended, attempting to play next track')
            if (playNextRef.current) {
                playNextRef.current()
            }
        }

        const handleCanPlay = () => {
            // Auto-play if we should auto-play (when track was just selected)
            if (shouldAutoPlayRef.current) {
                audio.play().catch(console.error)
                shouldAutoPlayRef.current = false // Reset flag
            }
        }

        const handleError = (e) => {
            console.error('Audio playback error:', e)
            setIsPlaying(false)
        }

        audio.addEventListener('loadedmetadata', handleLoadedMetadata)
        audio.addEventListener('timeupdate', handleTimeUpdate)
        audio.addEventListener('ended', handleEnded)
        audio.addEventListener('canplay', handleCanPlay)
        audio.addEventListener('error', handleError)

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
            audio.removeEventListener('timeupdate', handleTimeUpdate)
            audio.removeEventListener('ended', handleEnded)
            audio.removeEventListener('canplay', handleCanPlay)
            audio.removeEventListener('error', handleError)
            audio.pause()
        }
    }, [])

    // Update audio src when current track changes
    useEffect(() => {
        if (currentTrack && audioRef.current) {
            const audio = audioRef.current
            // Construct full URL for audio file
            const audioUrl = `http://localhost:5000${currentTrack.fileUrl}`
            console.log('Setting audio URL:', audioUrl)
            console.log('Current track:', currentTrack)

            // Only reload if it's a different track
            if (audio.src !== audioUrl) {
                audio.src = audioUrl
                audio.load() // Explicitly load the new source
            }

            audio.volume = isMuted ? 0 : volume
        }
    }, [currentTrack, isMuted, volume]) // Add back dependencies since we handle them properly now

    // Add/remove body class for proper spacing when playback bar is visible
    useEffect(() => {
        if (currentTrack) {
            document.body.classList.add('playback-active')
        } else {
            document.body.classList.remove('playback-active')
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('playback-active')
        }
    }, [currentTrack])

    // Play specific track
    const playTrack = useCallback((track, trackList = null, project = null) => {
        setCurrentTrack(track)
        if (project) {
            setCurrentProject(project)
        }

        if (trackList) {
            setPlaylist(trackList)
            const index = trackList.findIndex(t => t.id === track.id)
            setCurrentTrackIndex(index)
        }

        setIsPlaying(true)
        shouldAutoPlayRef.current = true // Set flag to auto-play when ready

        // If audio element is ready and has the same source, play immediately
        if (audioRef.current && audioRef.current.src.includes(track.fileUrl)) {
            audioRef.current.play().catch(console.error)
        }
    }, [])

    // Toggle play/pause
    const togglePlayPause = useCallback(() => {
        if (!audioRef.current || !currentTrack) return

        const audio = audioRef.current

        if (isPlaying) {
            audio.pause()
            setIsPlaying(false)
        } else {
            audio.play().catch(console.error)
            setIsPlaying(true)
        }
    }, [isPlaying, currentTrack])

    // Play next track
    const playNext = useCallback(() => {
        console.log('playNext called:', {
            playlistLength: playlist.length,
            currentTrackIndex,
            playlist: playlist.map(t => t.title)
        })

        if (playlist.length === 0 || currentTrackIndex === -1) {
            console.log('Cannot play next: no playlist or invalid index')
            return
        }

        const nextIndex = (currentTrackIndex + 1) % playlist.length
        const nextTrack = playlist[nextIndex]

        console.log('Playing next track:', { nextIndex, nextTrack: nextTrack?.title })

        if (nextTrack) {
            setCurrentTrackIndex(nextIndex)
            playTrack(nextTrack, playlist)
        }
    }, [playlist, currentTrackIndex, playTrack])

    // Update the ref whenever playNext changes so event handlers have access
    useEffect(() => {
        playNextRef.current = playNext
    }, [playNext])

    // Play previous track
    const playPrevious = useCallback(() => {
        console.log('playPrevious called:', {
            playlistLength: playlist.length,
            currentTrackIndex,
            playlist: playlist.map(t => t.title)
        })

        if (playlist.length === 0 || currentTrackIndex === -1) {
            console.log('Cannot play previous: no playlist or invalid index')
            return
        }

        const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1
        const prevTrack = playlist[prevIndex]

        console.log('Previous track:', { prevIndex, prevTrack: prevTrack?.title })

        if (prevTrack) {
            setCurrentTrackIndex(prevIndex)
            playTrack(prevTrack, playlist)
        }
    }, [playlist, currentTrackIndex, playTrack])

    // Seek to specific time
    const seekTo = useCallback((time) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time
            setCurrentTime(time)
        }
    }, [])

    // Set volume
    const setPlayerVolume = useCallback((newVolume) => {
        setVolume(newVolume)
        if (audioRef.current && !isMuted) {
            audioRef.current.volume = newVolume
        }
    }, [isMuted])

    // Toggle mute
    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const newMuted = !prev
            if (audioRef.current) {
                audioRef.current.volume = newMuted ? 0 : volume
            }
            return newMuted
        })
    }, [volume])

    // Stop playback
    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
        setIsPlaying(false)
        setCurrentTime(0)
    }, [])

    // Clear current track and playlist
    const clearPlaylist = useCallback(() => {
        stop()
        setCurrentTrack(null)
        setPlaylist([])
        setCurrentTrackIndex(-1)
        setDuration(0)
    }, [stop])

    // Format time helper
    const formatTime = useCallback((seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00'

        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }, [])

    const value = {
        // State
        currentTrack,
        currentProject,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playlist,
        currentTrackIndex,

        // Actions
        playTrack,
        togglePlayPause,
        playNext,
        playPrevious,
        seekTo,
        setPlayerVolume,
        toggleMute,
        stop,
        clearPlaylist,

        // Helpers
        formatTime
    }

    return (
        <AudioPlayerContext.Provider value={value}>
            {children}
        </AudioPlayerContext.Provider>
    )
}

export const useAudioPlayer = () => {
    const context = useContext(AudioPlayerContext)
    if (!context) {
        throw new Error('useAudioPlayer must be used within an AudioPlayerProvider')
    }
    return context
}