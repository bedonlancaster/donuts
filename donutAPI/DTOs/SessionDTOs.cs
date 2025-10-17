using System.ComponentModel.DataAnnotations;
using DonutAPI.Models;

namespace DonutAPI.DTOs
{
    // For booking/creating a new session
    public class CreateSessionDto
    {
        [Required]
        [StringLength(200, MinimumLength = 1)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public int ProducerId { get; set; }

        [Required]
        public int ArtistId { get; set; }

        // Optional: project-specific session
        public int? ProjectId { get; set; }

        [Required]
        public DateTime ScheduledDate { get; set; }

        [Required]
        public TimeSpan Duration { get; set; }

        public string? Location { get; set; }
    }

    // For updating session details
    public class UpdateSessionDto
    {
        [StringLength(200, MinimumLength = 1)]
        public string? Title { get; set; }

        public string? Description { get; set; }
        public DateTime? ScheduledDate { get; set; }
        public TimeSpan? Duration { get; set; }
        public string? Location { get; set; }
        public SessionStatus? Status { get; set; }
    }

    // For session responses
    public class SessionDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime ScheduledDate { get; set; }
        public TimeSpan Duration { get; set; }
        public string? Location { get; set; }
        public SessionStatus Status { get; set; }

        // Participants
        public UserDto Producer { get; set; } = null!;
        public UserDto Artist { get; set; } = null!;
        public UserDto BookedBy { get; set; } = null!;

        // Optional project reference
        public int? ProjectId { get; set; }
        public string? ProjectTitle { get; set; } // for convenience
    }

    // For quick status updates
    public class UpdateSessionStatusDto
    {
        [Required]
        public SessionStatus Status { get; set; }
    }
}