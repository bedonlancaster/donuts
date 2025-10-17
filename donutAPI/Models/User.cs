using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace DonutAPI.Models
{
    public enum UserRole
    {
        Producer = 1,
        Artist = 2
    }

    public class User : IdentityUser<int>
    {
        [Required]
        [StringLength(50)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string DisplayName { get; set; } = string.Empty;

        [Required]
        public List<UserRole> Roles { get; set; } = new List<UserRole>();

        public string? ProfileImageUrl { get; set; }
        public string? Bio { get; set; }

        // Navigation Properties
        public virtual ICollection<Project> CreatedProjects { get; set; } = new List<Project>();
        public virtual ICollection<Track> UploadedTracks { get; set; } = new List<Track>();
        public virtual ICollection<HitListItem> CreatedHitListItems { get; set; } = new List<HitListItem>();
        public virtual ICollection<Session> ProducerSessions { get; set; } = new List<Session>();
        public virtual ICollection<Session> ArtistSessions { get; set; } = new List<Session>();
        public virtual ICollection<ProjectCollaborator> ProjectCollaborations { get; set; } = new List<ProjectCollaborator>();
        public virtual ICollection<ProjectCollaborator> AddedCollaborators { get; set; } = new List<ProjectCollaborator>();

        public string FullName => $"{FirstName} {LastName}";

        public bool IsProducer => Roles.Contains(UserRole.Producer);
        public bool IsArtist => Roles.Contains(UserRole.Artist);
    }
}