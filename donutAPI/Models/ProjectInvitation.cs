using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonutAPI.Models
{
    public enum InvitationStatus
    {
        Pending = 1,
        Accepted = 2,
        Declined = 3,
        Cancelled = 4
    }

    public class ProjectInvitation
    {
        public int Id { get; set; }

        [Required]
        public int ProjectId { get; set; }

        [Required]
        public int InvitedUserId { get; set; } // The user being invited

        [Required]
        public int InvitedById { get; set; } // The user sending the invitation

        [Required]
        public InvitationStatus Status { get; set; } = InvitationStatus.Pending;

        [StringLength(500)]
        public string? Message { get; set; } // "come collab with me bro"

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? RespondedAt { get; set; }

        // Navigation Properties
        [ForeignKey("ProjectId")]
        public virtual Project Project { get; set; } = null!;

        [ForeignKey("InvitedUserId")]
        public virtual User InvitedUser { get; set; } = null!;

        [ForeignKey("InvitedById")]
        public virtual User InvitedBy { get; set; } = null!;
    }
}
