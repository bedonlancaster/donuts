import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ThemeContext = createContext()

// Color palette definitions with improved dark mode text contrast
const COLOR_PALETTES = {
    Coral: {
        light: { primary: '#E87A7A', secondary: '#FFE5E5', accent: '#D66B6B', background: '#FFFFFF', text: '#4A4A4A' },
        dark: { primary: '#FFE5E5', secondary: '#F0B8B8', accent: '#FFF0F0', background: '#8B4A4A', text: '#FFFFFF' }
    },
    Peach: {
        light: { primary: '#F4A688', secondary: '#F7C4A0', accent: '#F19A7B', background: '#FDF7F3', text: '#3D2B1F' },
        dark: { primary: '#F7C4A0', secondary: '#E6B89A', accent: '#F5D4C4', background: '#8B5A42', text: '#FFFFFF' }
    },
    Sage: {
        light: { primary: '#8B9D77', secondary: '#A8B89A', accent: '#98A888', background: '#F4F6F1', text: '#2D3A24' },
        dark: { primary: '#A8B89A', secondary: '#9BAA88', accent: '#B8C7A5', background: '#556B47', text: '#FFFFFF' }
    },
    Clay: {
        light: { primary: '#C49B7C', secondary: '#D4B5A0', accent: '#CC9F85', background: '#FAF6F2', text: '#3E2723' },
        dark: { primary: '#D4B5A0', secondary: '#C2A693', accent: '#E0C4B0', background: '#7A5A47', text: '#FFFFFF' }
    },
    Slate: {
        light: { primary: '#7A8B99', secondary: '#A0B1BE', accent: '#8A9BAA', background: '#F2F4F6', text: '#2C3E50' },
        dark: { primary: '#A0B1BE', secondary: '#8FA0AD', accent: '#B5C6D3', background: '#4A5B69', text: '#FFFFFF' }
    },
    Salmon: {
        light: { primary: '#E68B8B', secondary: '#F2B5B5', accent: '#EBA0A0', background: '#FEF6F6', text: '#3A1F1F' },
        dark: { primary: '#F2B5B5', secondary: '#E09999', accent: '#F5C8C8', background: '#A85555', text: '#FFFFFF' }
    },
    Moss: {
        light: { primary: '#7D8471', secondary: '#A3A895', accent: '#909682', background: '#F6F7F4', text: '#2A2F25' },
        dark: { primary: '#A3A895', secondary: '#919584', accent: '#B6B8A5', background: '#4A5441', text: '#FFFFFF' }
    },
    Dusk: {
        light: { primary: '#A89B9B', secondary: '#C4BABA', accent: '#B6ABAB', background: '#F9F7F7', text: '#3E2A2A' },
        dark: { primary: '#C4BABA', secondary: '#B2A8A8', accent: '#D0C6C6', background: '#6B5B5B', text: '#FFFFFF' }
    },
    Stone: {
        light: { primary: '#9B8B82', secondary: '#BFB0A7', accent: '#ADA095', background: '#F8F6F4', text: '#2F2520' },
        dark: { primary: '#BFB0A7', secondary: '#AD9E95', accent: '#CFC0B7', background: '#5B4B42', text: '#FFFFFF' }
    },
    Mist: {
        light: { primary: '#A8B5B2', secondary: '#C6D0CE', accent: '#B7C3C0', background: '#F7F9F8', text: '#2A3532' },
        dark: { primary: '#C6D0CE', secondary: '#B4BEBC', accent: '#D8E2E0', background: '#586562', text: '#FFFFFF' }
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

    const resetToDefaultTheme = useCallback(() => {
        setCurrentTheme({
            mode: 'Light',
            palette: 'Coral',
            isPreview: false
        })
    }, [])

    const setPreviewTheme = useCallback((theme) => {
        const previewTheme = {
            ...theme,
            isPreview: true
        }
        setCurrentTheme(previewTheme)
    }, [])

    const setProjectTheme = useCallback((theme) => {
        const projectTheme = {
            ...theme,
            isPreview: false
        }
        setCurrentTheme(projectTheme)
    }, [])

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