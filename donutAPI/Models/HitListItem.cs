using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonutAPI.Models
{
    public enum HitListPriority
    {
        Low = 1,
        Medium = 2,
        High = 3,
        Critical = 4
    }

    public enum HitListStatus
    {
        Todo = 1,
        InProgress = 2,
        Complete = 3
    }

    public enum HitListCategory
    {
        General = 0,
        Tracking = 1,
        Production = 2,
        Mixing = 3,
        Mastering = 4,
        Songwriting = 5,
        Arrangement = 6
    }

    public class HitListItem
    {
        public int Id { get; set; }

        // Either track-specific OR project-wide
        public int? TrackId { get; set; }  // null = project-level hit list item

        [Required]
        public int ProjectId { get; set; }  // always belongs to a project

        [Required]
        public int CreatedById { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public HitListPriority Priority { get; set; } = HitListPriority.Medium;

        [Required]
        public HitListStatus Status { get; set; } = HitListStatus.Todo;

        [Required]
        public HitListCategory Category { get; set; } = HitListCategory.General;

        public int SortOrder { get; set; } = 0;

        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }

        // Navigation Properties
        [ForeignKey("TrackId")]
        public virtual Track? Track { get; set; }  // null for project-level items

        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; } = null!;

        [ForeignKey("CreatedById")]
        public virtual User CreatedBy { get; set; } = null!;

        public virtual ICollection<HitListItemComment> Comments { get; set; } = new List<HitListItemComment>();
    }
}