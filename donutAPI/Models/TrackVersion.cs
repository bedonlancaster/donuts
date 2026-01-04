using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonutAPI.Models
{
    public class TrackVersion
    {
        public int Id { get; set; }

        [Required]
        public int TrackId { get; set; }

        [Required]
        public int VersionNumber { get; set; }

        [Required]
        public string? FileUrl { get; set; }

        [Required]
        [StringLength(50)]
        public string FileType { get; set; } = string.Empty; // MP3, WAV, FLAC, etc.

        public TimeSpan? Duration { get; set; }

        [Required]
        public int UploadedById { get; set; }

        [Required]
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public bool IsCurrentVersion { get; set; } = false;

        [StringLength(500)]
        public string? Notes { get; set; } // Optional notes about this version

        // Navigation Properties
        [ForeignKey("TrackId")]
        public virtual Track Track { get; set; } = null!;

        [ForeignKey("UploadedById")]
        public virtual User UploadedBy { get; set; } = null!;
    }
}
