using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonutAPI.Models
{
    public enum TrackStatus
    {
        Doing = 1,
        Done = 2
    }

    public class Track
    {
        public int Id { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public int OrderIndex { get; set; }

        [Required]
        public int CreatedById { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public TrackStatus Status { get; set; } = TrackStatus.Doing;

        // Navigation Properties
        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; } = null!;

        [ForeignKey("CreatedById")]
        public virtual User CreatedBy { get; set; } = null!;

        public virtual ICollection<TrackVersion> Versions { get; set; } = new List<TrackVersion>();
        public virtual ICollection<HitListItem> HitListItems { get; set; } = new List<HitListItem>();
    }
}