using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonutAPI.Models
{
    public enum ProjectStatus
    {
        Active = 1,
        Completed = 2,
        Archived = 3
    }

    public class Project
    {
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Title { get; set; } = string.Empty;

        [StringLength(100)]
        public string? ArtistName { get; set; }

        public string? Description { get; set; }
        public string? ArtworkUrl { get; set; }

        // Theme relationship
        public int? ThemeId { get; set; }

        [Required]
        public int CreatedById { get; set; }

        [Required]
        public ProjectStatus Status { get; set; } = ProjectStatus.Active;

        // Navigation Properties
        [ForeignKey("CreatedById")]
        public virtual User CreatedBy { get; set; } = null!;

        [ForeignKey("ThemeId")]
        public virtual ProjectTheme? Theme { get; set; }

        public virtual ICollection<ProjectCollaborator> Collaborators { get; set; } = new List<ProjectCollaborator>();
        public virtual ICollection<Track> Tracks { get; set; } = new List<Track>();
        public virtual ICollection<HitListItem> HitListItems { get; set; } = new List<HitListItem>();
        public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();

        // Helper properties for easy access (computed properties)
        [NotMapped]
        public IEnumerable<User> ActiveCollaborators =>
            Collaborators.Where(c => c.Status == CollaboratorStatus.Active).Select(c => c.User);

        [NotMapped]
        public IEnumerable<User> AllProducers =>
            Collaborators.Where(c => c.Status == CollaboratorStatus.Active && c.Role == CollaboratorRole.Producer).Select(c => c.User);

        [NotMapped]
        public IEnumerable<User> AllArtists =>
            Collaborators.Where(c => c.Status == CollaboratorStatus.Active && c.Role == CollaboratorRole.Artist).Select(c => c.User);
    }
}