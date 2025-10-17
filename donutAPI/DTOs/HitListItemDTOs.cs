using System.ComponentModel.DataAnnotations;
using DonutAPI.Models;

namespace DonutAPI.DTOs
{
    // For creating a new hit list item
    public class CreateHitListItemDto
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public int ProjectId { get; set; }

        // Optional: track-specific item (null = project-level)
        public int? TrackId { get; set; }

        public HitListPriority Priority { get; set; } = HitListPriority.Medium;
        public DateTime? DueDate { get; set; }
    }

    // For updating a hit list item
    public class UpdateHitListItemDto
    {
        [StringLength(200, MinimumLength = 1)]
        public string? Title { get; set; }

        public string? Description { get; set; }
        public HitListPriority? Priority { get; set; }
        public HitListStatus? Status { get; set; }
        public DateTime? DueDate { get; set; }
    }

    // For hit list item responses
    public class HitListItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public HitListPriority Priority { get; set; }
        public HitListStatus Status { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }

        // References
        public int ProjectId { get; set; }
        public int? TrackId { get; set; } // null = project-level item
        public string? TrackTitle { get; set; } // for convenience

        public UserDto CreatedBy { get; set; } = null!;
    }

    // For marking items complete
    public class CompleteHitListItemDto
    {
        public DateTime? CompletedAt { get; set; } = DateTime.UtcNow;
    }
}