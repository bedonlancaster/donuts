using System.ComponentModel.DataAnnotations;

namespace DonutAPI.Models
{
    public enum ThemeMode
    {
        Light = 1,
        Dark = 2
    }

    public enum ColorPalette
    {
        Coral = 1,        // Default DONUTS coral/pink - matches frontend
        Peach = 2,        // Warm peach/orange tones - matches frontend
        Sage = 3,         // Sage green tones - matches frontend  
        Clay = 4,         // Clay/terracotta tones - matches frontend
        Slate = 5,        // Slate blue-gray tones - matches frontend
        Ocean = 6,        // Blues and teals
        Forest = 7,       // Greens and mint
        Sunset = 8,       // Warm oranges and reds
        Lavender = 9,     // Purples and lilacs
        Sunshine = 10,    // Yellows and golds
        Earth = 11,       // Browns and tans
        Aurora = 12,      // Multi-color gradients
        Monochrome = 13,  // Grays and blacks
        Neon = 14         // Bright electric colors
    }

    public class ProjectTheme
    {
        public int Id { get; set; }

        [Required]
        public ThemeMode Mode { get; set; } = ThemeMode.Light;

        [Required]
        public ColorPalette Palette { get; set; } = ColorPalette.Coral;

        // Custom color overrides for advanced users
        [StringLength(7)]
        public string? PrimaryColor { get; set; }

        [StringLength(7)]
        public string? SecondaryColor { get; set; }

        [StringLength(7)]
        public string? AccentColor { get; set; }

        [StringLength(7)]
        public string? BackgroundColor { get; set; }

        [StringLength(7)]
        public string? TextColor { get; set; }

        // Synesthesia support - emotional/sensory associations
        public string? EmotionalTone { get; set; } // "Energetic", "Calm", "Intense", etc.
        public string? VisualDescription { get; set; } // User's description of how the music "looks"

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public virtual Project Project { get; set; } = null!;
    }

    // Static class for predefined color palettes
    public static class ColorPalettes
    {
        public static readonly Dictionary<ColorPalette, Dictionary<ThemeMode, ThemeColors>> Palettes = new()
        {
            {
                ColorPalette.Coral,
                new Dictionary<ThemeMode, ThemeColors>
                {
                    { ThemeMode.Light, new ThemeColors("#E87A7A", "#FFE5E5", "#D66B6B", "#FFFFFF", "#4A4A4A") },
                    { ThemeMode.Dark, new ThemeColors("#FFE5E5", "#F0B8B8", "#FFF0F0", "#8B4A4A", "#FFFFFF") }
                }
            },
            {
                ColorPalette.Peach,
                new Dictionary<ThemeMode, ThemeColors>
                {
                    { ThemeMode.Light, new ThemeColors("#F4A688", "#F7C4A0", "#F19A7B", "#FDF7F3", "#3D2B1F") },
                    { ThemeMode.Dark, new ThemeColors("#F7C4A0", "#E6B89A", "#F5D4C4", "#8B5A42", "#FFFFFF") }
                }
            },
            {
                ColorPalette.Sage,
                new Dictionary<ThemeMode, ThemeColors>
                {
                    { ThemeMode.Light, new ThemeColors("#8B9D77", "#A8B89A", "#98A888", "#F4F6F1", "#2D3A24") },
                    { ThemeMode.Dark, new ThemeColors("#A8B89A", "#9BAA88", "#B8C7A5", "#556B47", "#FFFFFF") }
                }
            },
            {
                ColorPalette.Clay,
                new Dictionary<ThemeMode, ThemeColors>
                {
                    { ThemeMode.Light, new ThemeColors("#C49B7C", "#D4B5A0", "#CC9F85", "#FAF6F2", "#3E2723") },
                    { ThemeMode.Dark, new ThemeColors("#D4B5A0", "#C2A693", "#E0C4B0", "#7A5A47", "#FFFFFF") }
                }
            },
            {
                ColorPalette.Slate,
                new Dictionary<ThemeMode, ThemeColors>
                {
                    { ThemeMode.Light, new ThemeColors("#7A8B99", "#A0B1BE", "#8A9BAA", "#F2F4F6", "#2C3E50") },
                    { ThemeMode.Dark, new ThemeColors("#A0B1BE", "#8FA0AD", "#B5C6D3", "#4A5B69", "#FFFFFF") }
                }
            },
            {
                ColorPalette.Ocean,
                new Dictionary<ThemeMode, ThemeColors>
                {
                    { ThemeMode.Light, new ThemeColors("#00B4D8", "#90E0EF", "#48CAE4", "#F0FAFF", "#2C3E50") },
                    { ThemeMode.Dark, new ThemeColors("#00B4D8", "#005577", "#48CAE4", "#0A1929", "#E8F4F8") }
                }
            },
            {
                ColorPalette.Forest,
                new Dictionary<ThemeMode, ThemeColors>
                {
                    { ThemeMode.Light, new ThemeColors("#52B788", "#95D5B2", "#74C69D", "#F8FFF9", "#2C3E50") },
                    { ThemeMode.Dark, new ThemeColors("#52B788", "#2F5233", "#74C69D", "#0D1B0F", "#E8F5E8") }
                }
            },
            {
                ColorPalette.Sunset,
                new Dictionary<ThemeMode, ThemeColors>
                {
                    { ThemeMode.Light, new ThemeColors("#FF6B35", "#FFB3A7", "#FF8E53", "#FFF8F5", "#2C3E50") },
                    { ThemeMode.Dark, new ThemeColors("#FF6B35", "#8B3A1F", "#FF8E53", "#1F0F0A", "#FFE8E0") }
                }
            },
            {
                ColorPalette.Lavender,
                new Dictionary<ThemeMode, ThemeColors>
                {
                    { ThemeMode.Light, new ThemeColors("#9D4EDD", "#C77DFF", "#B565A7", "#FAF7FF", "#2C3E50") },
                    { ThemeMode.Dark, new ThemeColors("#9D4EDD", "#5A2E72", "#B565A7", "#1A0D1F", "#F0E8FF") }
                }
            },
            {
                ColorPalette.Sunshine,
                new Dictionary<ThemeMode, ThemeColors>
                {
                    { ThemeMode.Light, new ThemeColors("#FFD60A", "#FFE066", "#FFDD33", "#FFFBF0", "#2C3E50") },
                    { ThemeMode.Dark, new ThemeColors("#FFD60A", "#996A00", "#FFDD33", "#1F1A00", "#FFF8E1") }
                }
            },
            {
                ColorPalette.Earth,
                new Dictionary<ThemeMode, ThemeColors>
                {
                    { ThemeMode.Light, new ThemeColors("#8B4513", "#D2B48C", "#A0522D", "#F9F6F2", "#2C3E50") },
                    { ThemeMode.Dark, new ThemeColors("#8B4513", "#4A250A", "#A0522D", "#1A1510", "#E8E0D0") }
                }
            },
            {
                ColorPalette.Aurora,
                new Dictionary<ThemeMode, ThemeColors>
                {
                    { ThemeMode.Light, new ThemeColors("#FF6B9D", "#00B4D8", "#52B788", "#FFFFFF", "#2C3E50") },
                    { ThemeMode.Dark, new ThemeColors("#FF8FAB", "#48CAE4", "#74C69D", "#1A1A1A", "#FFFFFF") }
                }
            },
            {
                ColorPalette.Monochrome,
                new Dictionary<ThemeMode, ThemeColors>
                {
                    { ThemeMode.Light, new ThemeColors("#6C757D", "#ADB5BD", "#868E96", "#F8F9FA", "#212529") },
                    { ThemeMode.Dark, new ThemeColors("#ADB5BD", "#495057", "#868E96", "#212529", "#F8F9FA") }
                }
            },
            {
                ColorPalette.Neon,
                new Dictionary<ThemeMode, ThemeColors>
                {
                    { ThemeMode.Light, new ThemeColors("#FF0080", "#00FFFF", "#FFFF00", "#000000", "#FFFFFF") },
                    { ThemeMode.Dark, new ThemeColors("#FF0080", "#00FFFF", "#FFFF00", "#0A0A0A", "#FFFFFF") }
                }
            }
        };
    }

    public record ThemeColors(
        string Primary,
        string Secondary,
        string Accent,
        string Background,
        string Text
    );
}