using System.ComponentModel.DataAnnotations;
using DonutAPI.Models;

namespace DonutAPI.DTOs
{
    // ===== TRACK DTOs (Container) =====

    // For creating a new track container (without file initially)
    public class CreateTrackDto
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public int ProjectId { get; set; }

        public int OrderIndex { get; set; } = 0;
        public TrackStatus Status { get; set; } = TrackStatus.Doing;
    }

    // For creating track + uploading first version in one step
    public class CreateTrackWithVersionDto
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public int ProjectId { get; set; }

        [Required]
        public IFormFile AudioFile { get; set; } = null!;

        public int OrderIndex { get; set; } = 0;
        public TrackStatus Status { get; set; } = TrackStatus.Doing;
        public string? Notes { get; set; }
    }

    // For updating track metadata
    public class UpdateTrackDto
    {
        [StringLength(200, MinimumLength = 1)]
        public string? Title { get; set; }

        public int? OrderIndex { get; set; }
        public TrackStatus? Status { get; set; }
    }

    // For reordering tracks
    public class ReorderTracksDto
    {
        [Required]
        public List<TrackOrderDto> TrackOrders { get; set; } = new();
    }

    public class TrackOrderDto
    {
        [Required]
        public int TrackId { get; set; }

        [Required]
        public int OrderIndex { get; set; }
    }

    // Track response with current version info
    public class TrackDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public TrackStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public UserDto CreatedBy { get; set; } = null!;

        // Project info
        public ProjectDto Project { get; set; } = null!;

        // Current version info (for convenience)
        public TrackVersionDto? CurrentVersion { get; set; }

        // All versions
        public List<TrackVersionDto> Versions { get; set; } = new();

        // HitList items for this track
        public List<HitListItemDto> HitListItems { get; set; } = new();
    }

    // ===== TRACK VERSION DTOs =====

    // For uploading a new version to an existing track
    public class CreateTrackVersionDto
    {
        [Required]
        public IFormFile AudioFile { get; set; } = null!;

        [StringLength(500)]
        public string? Notes { get; set; }
    }

    // Track version response
    public class TrackVersionDto
    {
        public int Id { get; set; }
        public int TrackId { get; set; }
        public int VersionNumber { get; set; }
        public string? FileUrl { get; set; }
        public string FileType { get; set; } = string.Empty;
        public TimeSpan? Duration { get; set; }
        public DateTime UploadedAt { get; set; }
        public bool IsCurrentVersion { get; set; }
        public string? Notes { get; set; }
        public UserDto UploadedBy { get; set; } = null!;
    }

    // ===== LEGACY SUPPORT (for backwards compatibility during transition) =====

    // Legacy upload format (will be converted to CreateTrackWithVersionDto)
    public class UploadTrackDto
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public int ProjectId { get; set; }

        [Required]
        public IFormFile AudioFile { get; set; } = null!;

        public int OrderIndex { get; set; } = 0;
        public TrackStatus Status { get; set; } = TrackStatus.Doing;
    }
}
