using System.ComponentModel.DataAnnotations;
using DonutAPI.Models;

namespace DonutAPI.DTOs
{
    // For uploading/creating a new track
    public class CreateTrackDto
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public int ProjectId { get; set; }

        public int OrderIndex { get; set; } = 0;
        public TrackStatus Status { get; set; } = TrackStatus.Demo;
    }

    // For updating track metadata (not file)
    public class UpdateTrackDto
    {
        [StringLength(200, MinimumLength = 1)]
        public string? Title { get; set; }

        public int? OrderIndex { get; set; }
        public TrackStatus? Status { get; set; }
    }

    // For track file upload
    public class TrackFileUploadDto
    {
        [Required]
        public IFormFile AudioFile { get; set; } = null!;
    }

    // For single-step track upload (metadata + file)
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
        public TrackStatus Status { get; set; } = TrackStatus.Demo;
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

    // Complete track response (already in ProjectDTOs.cs, but here for reference)
    public class TrackDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? FileUrl { get; set; }
        public string? FileType { get; set; }
        public TimeSpan? Duration { get; set; }
        public int OrderIndex { get; set; }
        public TrackStatus Status { get; set; }
        public UserDto UploadedBy { get; set; } = null!;
        public ProjectDto Project { get; set; } = null!;
        public List<HitListItemDto> HitListItems { get; set; } = new();
    }
}