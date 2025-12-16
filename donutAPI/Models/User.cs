using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace DonutAPI.Models
{
    public class User : IdentityUser<int>
    {
        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;

        public string? ProfileImageUrl { get; set; }
        public string? Bio { get; set; }

        // Navigation Properties
        public virtual ICollection<Project> CreatedProjects { get; set; } = new List<Project>();
        public virtual ICollection<Track> UploadedTracks { get; set; } = new List<Track>();
        public virtual ICollection<HitListItem> CreatedHitListItems { get; set; } = new List<HitListItem>();
        public virtual ICollection<HitListItemComment> HitListItemComments { get; set; } = new List<HitListItemComment>();
        public virtual ICollection<Session> ProducerSessions { get; set; } = new List<Session>();
        public virtual ICollection<Session> ArtistSessions { get; set; } = new List<Session>();
        public virtual ICollection<ProjectCollaborator> ProjectCollaborations { get; set; } = new List<ProjectCollaborator>();
        public virtual ICollection<ProjectCollaborator> AddedCollaborators { get; set; } = new List<ProjectCollaborator>();

        public string FullName => $"{FirstName} {LastName}";
    }
}