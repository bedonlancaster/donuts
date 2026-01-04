import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getPaletteStringFromEnum } from '../utils/themeUtils';
import { getAuthHeaders } from '../utils/auth';

// This loader fetches project or track data, sets the theme, and only renders children after theme is set
export default function ThemeLoader({ children }) {
    const { id: projectId, projectId: routeProjectId, trackId } = useParams();
    const location = useLocation();
    const { setProjectTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchAndSetTheme() {
            setLoading(true);
            setError(null);
            try {
                let themeData;
                if (location.pathname.includes('/track/')) {
                    // Track detail: fetch track, get project from track
                    const res = await fetch(`http://localhost:5000/api/tracks/${trackId}`, { headers: getAuthHeaders() });
                    if (!res.ok) throw new Error('Track not found');
                    const track = await res.json();
                    themeData = track.project?.theme;
                } else {
                    // Project detail: fetch project
                    const pid = projectId || routeProjectId;
                    const res = await fetch(`http://localhost:5000/api/projects/${pid}`, { headers: getAuthHeaders() });
                    if (!res.ok) throw new Error('Project not found');
                    const project = await res.json();
                    themeData = project.theme;
                }
                if (themeData) {
                    const modeString = themeData.mode === 1 ? 'Light' : 'Dark';
                    const paletteString = getPaletteStringFromEnum(themeData.palette);
                    setProjectTheme({ mode: modeString, palette: paletteString });
                } else {
                    setProjectTheme({ mode: 'Light', palette: 'Coral' });
                }
            } catch (err) {
                setError(err.message);
                setProjectTheme({ mode: 'Light', palette: 'Coral' });
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchAndSetTheme();
        return () => { isMounted = false; };
        // eslint-disable-next-line
    }, [projectId, routeProjectId, trackId, location.pathname]);

    if (loading) return <div style={{ minHeight: '40vh' }} />;
    if (error) return <div style={{ color: 'red' }}>Theme error: {error}</div>;
    return children;
}
