using System.ComponentModel.DataAnnotations;
using DonutAPI.Models;

namespace DonutAPI.DTOs
{
    // For creating a new project
    public class CreateProjectDto
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        [StringLength(100)]
        public string? ArtistName { get; set; }

        public string? Description { get; set; }

        // Theme settings
        public CreateProjectThemeDto? Theme { get; set; }

        // Optional: Add collaborators at creation time
        public List<CreateCollaboratorDto>? Collaborators { get; set; } = new List<CreateCollaboratorDto>();
    }

    // For creating project themes
    public class CreateProjectThemeDto
    {
        public ThemeMode Mode { get; set; } = ThemeMode.Light;
        public ColorPalette Palette { get; set; } = ColorPalette.Coral;

        // Custom color overrides
        public string? PrimaryColor { get; set; }
        public string? SecondaryColor { get; set; }
        public string? AccentColor { get; set; }
        public string? BackgroundColor { get; set; }
        public string? TextColor { get; set; }

        // Synesthesia support
        public string? EmotionalTone { get; set; }
        public string? VisualDescription { get; set; }
    }

    // For adding collaborators to projects
    public class CreateCollaboratorDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public CollaboratorRole Role { get; set; }
    }

    // For updating a project
    public class UpdateProjectDto
    {
        [StringLength(100, MinimumLength = 1)]
        public string? Title { get; set; }

        [StringLength(100)]
        public string? ArtistName { get; set; }

        public string? Description { get; set; }

        // Theme updates
        public UpdateProjectThemeDto? Theme { get; set; }

        public ProjectStatus? Status { get; set; }
    }

    // For updating project themes
    public class UpdateProjectThemeDto
    {
        public ThemeMode? Mode { get; set; }
        public ColorPalette? Palette { get; set; }

        // Custom color overrides
        public string? PrimaryColor { get; set; }
        public string? SecondaryColor { get; set; }
        public string? AccentColor { get; set; }
        public string? BackgroundColor { get; set; }
        public string? TextColor { get; set; }

        // Synesthesia support
        public string? EmotionalTone { get; set; }
        public string? VisualDescription { get; set; }
    }

    // For project responses
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? ArtistName { get; set; }
        public string? Description { get; set; }
        public string? ArtworkUrl { get; set; }
        public ProjectStatus Status { get; set; }
        public UserDto CreatedBy { get; set; } = null!;
        public ProjectThemeDto? Theme { get; set; }
        public List<CollaboratorDto> Collaborators { get; set; } = new();
        public List<TrackDto> Tracks { get; set; } = new();
        public int TrackCount { get; set; }
        public int HitListItemCount { get; set; }
        public TimeSpan? TotalDuration { get; set; }

        // Helper properties for easy frontend access
        public List<UserDto> Producers =>
            Collaborators.Where(c => c.Role == CollaboratorRole.Producer && c.Status == CollaboratorStatus.Active)
                         .Select(c => c.User).ToList();

        public List<UserDto> Artists =>
            Collaborators.Where(c => c.Role == CollaboratorRole.Artist && c.Status == CollaboratorStatus.Active)
                         .Select(c => c.User).ToList();
    }

    // For theme responses
    public class ProjectThemeDto
    {
        public int Id { get; set; }
        public ThemeMode Mode { get; set; }
        public ColorPalette Palette { get; set; }

        // Computed colors from palette or custom overrides
        public string PrimaryColor { get; set; } = string.Empty;
        public string SecondaryColor { get; set; } = string.Empty;
        public string AccentColor { get; set; } = string.Empty;
        public string BackgroundColor { get; set; } = string.Empty;
        public string TextColor { get; set; } = string.Empty;

        // Synesthesia support
        public string? EmotionalTone { get; set; }
        public string? VisualDescription { get; set; }

        // Metadata
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    // For collaborator responses
    public class CollaboratorDto
    {
        public int Id { get; set; }
        public UserDto User { get; set; } = null!;
        public CollaboratorRole Role { get; set; }
        public CollaboratorStatus Status { get; set; }
        public DateTime JoinedAt { get; set; }
        public UserDto AddedBy { get; set; } = null!;
    }

    // For track responses in project context (simplified, with current version info)
    public class TrackDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public TrackStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public UserDto CreatedBy { get; set; } = null!;

        // Current version info (convenience fields from current version)
        public string? FileUrl { get; set; }
        public string? FileType { get; set; }
        public TimeSpan? Duration { get; set; }
        public int? CurrentVersionNumber { get; set; }
        public int VersionCount { get; set; }
    }
}