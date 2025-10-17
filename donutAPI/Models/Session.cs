using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonutAPI.Models
{
    public enum SessionStatus
    {
        Scheduled = 1,
        InProgress = 2,
        Completed = 3,
        Cancelled = 4
    }

    public class Session
    {
        public int Id { get; set; }

        [Required]
        public int ProducerId { get; set; }

        [Required]
        public int ArtistId { get; set; }

        // Optional: Can be project-specific or general collaboration
        public int? ProjectId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public DateTime ScheduledDate { get; set; }

        [Required]
        public TimeSpan Duration { get; set; }

        public string? Location { get; set; }

        [Required]
        public SessionStatus Status { get; set; } = SessionStatus.Scheduled;

        [Required]
        public int BookedById { get; set; } // Who initiated the booking

        // Navigation Properties
        [ForeignKey("ProducerId")]
        public virtual User Producer { get; set; } = null!;

        [ForeignKey("ArtistId")]
        public virtual User Artist { get; set; } = null!;

        [ForeignKey("ProjectId")]
        public virtual Project? Project { get; set; }

        [ForeignKey("BookedById")]
        public virtual User BookedBy { get; set; } = null!;
    }
}