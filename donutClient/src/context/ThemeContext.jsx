import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

// Color palette definitions with sophisticated, earthy tones and inverted pairings
const COLOR_PALETTES = {
    Coral: {
        light: { primary: '#FF6B9D', secondary: '#FFB3C6', accent: '#FF8FAB', background: '#FFF5F8', text: '#2C3E50' },
        dark: { primary: '#FFF5F8', secondary: '#FFB3C6', accent: '#FF8FAB', background: '#FF6B9D', text: '#FFFFFF' }
    },
    Peach: {
        light: { primary: '#F4A688', secondary: '#F7C4A0', accent: '#F19A7B', background: '#FDF7F3', text: '#3D2B1F' },
        dark: { primary: '#FDF7F3', secondary: '#F7C4A0', accent: '#F19A7B', background: '#F4A688', text: '#FFFFFF' }
    },
    Sage: {
        light: { primary: '#8B9D77', secondary: '#A8B89A', accent: '#98A888', background: '#F4F6F1', text: '#2D3A24' },
        dark: { primary: '#F4F6F1', secondary: '#A8B89A', accent: '#98A888', background: '#8B9D77', text: '#FFFFFF' }
    },
    Clay: {
        light: { primary: '#C49B7C', secondary: '#D4B5A0', accent: '#CC9F85', background: '#FAF6F2', text: '#3E2723' },
        dark: { primary: '#FAF6F2', secondary: '#D4B5A0', accent: '#CC9F85', background: '#C49B7C', text: '#FFFFFF' }
    },
    Slate: {
        light: { primary: '#7A8B99', secondary: '#A0B1BE', accent: '#8A9BAA', background: '#F2F4F6', text: '#2C3E50' },
        dark: { primary: '#F2F4F6', secondary: '#A0B1BE', accent: '#8A9BAA', background: '#7A8B99', text: '#FFFFFF' }
    },
    Salmon: {
        light: { primary: '#E68B8B', secondary: '#F2B5B5', accent: '#EBA0A0', background: '#FEF6F6', text: '#3A1F1F' },
        dark: { primary: '#FEF6F6', secondary: '#F2B5B5', accent: '#EBA0A0', background: '#E68B8B', text: '#FFFFFF' }
    },
    Moss: {
        light: { primary: '#7D8471', secondary: '#A3A895', accent: '#909682', background: '#F6F7F4', text: '#2A2F25' },
        dark: { primary: '#F6F7F4', secondary: '#A3A895', accent: '#909682', background: '#7D8471', text: '#FFFFFF' }
    },
    Dusk: {
        light: { primary: '#A89B9B', secondary: '#C4BABA', accent: '#B6ABAB', background: '#F9F7F7', text: '#3E2A2A' },
        dark: { primary: '#F9F7F7', secondary: '#C4BABA', accent: '#B6ABAB', background: '#A89B9B', text: '#FFFFFF' }
    },
    Stone: {
        light: { primary: '#9B8B82', secondary: '#BFB0A7', accent: '#ADA095', background: '#F8F6F4', text: '#2F2520' },
        dark: { primary: '#F8F6F4', secondary: '#BFB0A7', accent: '#ADA095', background: '#9B8B82', text: '#FFFFFF' }
    },
    Mist: {
        light: { primary: '#A8B5B2', secondary: '#C6D0CE', accent: '#B7C3C0', background: '#F7F9F8', text: '#2A3532' },
        dark: { primary: '#F7F9F8', secondary: '#C6D0CE', accent: '#B7C3C0', background: '#A8B5B2', text: '#FFFFFF' }
    }
}

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState({
        mode: 'Light',
        palette: 'Coral',
        isPreview: false // Flag to distinguish between preview and actual project themes
    })

    const applyThemeToDOM = (theme) => {
        const { mode, palette } = theme
        const colors = COLOR_PALETTES[palette]?.[mode.toLowerCase()] || COLOR_PALETTES.Coral.light

        // Apply CSS custom properties to the document root
        const root = document.documentElement
        root.style.setProperty('--theme-primary', colors.primary)
        root.style.setProperty('--theme-secondary', colors.secondary)
        root.style.setProperty('--theme-accent', colors.accent)
        root.style.setProperty('--theme-background', colors.background)
        root.style.setProperty('--theme-text', colors.text)

        // Add theme class to body for additional styling
        document.body.className = document.body.className.replace(/theme-\w+-\w+/g, '')
        document.body.classList.add(`theme-${palette.toLowerCase()}-${mode.toLowerCase()}`)
    }

    const resetToDefaultTheme = () => {
        setCurrentTheme({
            mode: 'Light',
            palette: 'Coral',
            isPreview: false
        })
    }

    const setPreviewTheme = (theme) => {
        const previewTheme = {
            ...theme,
            isPreview: true
        }
        setCurrentTheme(previewTheme)
    }

    const setProjectTheme = (theme) => {
        const projectTheme = {
            ...theme,
            isPreview: false
        }
        setCurrentTheme(projectTheme)
    }

    // Apply theme changes to DOM
    useEffect(() => {
        applyThemeToDOM(currentTheme)
    }, [currentTheme])

    const value = {
        currentTheme,
        setPreviewTheme,
        setProjectTheme,
        resetToDefaultTheme,
        colorPalettes: COLOR_PALETTES
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}