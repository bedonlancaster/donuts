using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonutAPI.Models
{
    public enum CollaboratorRole
    {
        Artist = 1,
        Producer = 2,
        Songwriter = 3,
        Engineer = 4,
        MixingEngineer = 5,
        MasteringEngineer = 6,
        Management = 7,
        Label = 8
    }

    public enum CollaboratorStatus
    {
        Active = 1,
        Inactive = 2,
        Removed = 3
    }

    public class ProjectCollaborator
    {
        public int Id { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public CollaboratorRole Role { get; set; }

        [Required]
        public CollaboratorStatus Status { get; set; } = CollaboratorStatus.Active;

        [Required]
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public int AddedById { get; set; } // Who added this collaborator

        public DateTime? RemovedAt { get; set; }
        public int? RemovedById { get; set; }

        // Navigation Properties
        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("AddedById")]
        public virtual User AddedBy { get; set; } = null!;

        [ForeignKey("RemovedById")]
        public virtual User? RemovedBy { get; set; }
    }
}