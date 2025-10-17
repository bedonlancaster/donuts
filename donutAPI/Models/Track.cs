using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonutAPI.Models
{
    public enum TrackStatus
    {
        Demo = 1,
        InProgress = 2,
        Review = 3,
        Final = 4
    }

    public class Track
    {
        public int Id { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? FileUrl { get; set; }
        public string? FileType { get; set; } // MP3, WAV, FLAC, etc.
        public TimeSpan? Duration { get; set; }

        [Required]
        public int OrderIndex { get; set; }

        [Required]
        public int UploadedById { get; set; }

        [Required]
        public TrackStatus Status { get; set; } = TrackStatus.Demo;

        // Navigation Properties
        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; } = null!;

        [ForeignKey("UploadedById")]
        public virtual User UploadedBy { get; set; } = null!;

        public virtual ICollection<HitListItem> HitListItems { get; set; } = new List<HitListItem>();
    }
}