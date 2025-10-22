// Utility to map backend palette enum to palette string
export function getPaletteStringFromEnum(enumValue) {
    const paletteMap = {
        1: 'Coral',
        2: 'Peach',
        3: 'Sage',
        4: 'Clay',
        5: 'Slate',
        6: 'Salmon',
        7: 'Moss',
        8: 'Dusk',
        9: 'Stone',
        10: 'Mist'
    }
    return paletteMap[enumValue] || 'Coral'
}
