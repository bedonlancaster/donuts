# DONUTS - C#/.NET Data Models
*Entity Framework Core Models for Music Producer Collaboration Platform*

## Base Entity Abstract Class

```csharp
using System.ComponentModel.DataAnnotations;

namespace DonutAPI.Models
{
    public abstract class BaseEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;
    }
}
```

## User Management Models

### User Model
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace DonutAPI.Models
{
    public class User : IdentityUser<Guid>
    {
        [Required]
        [StringLength(50)]
        public string FirstName { get; set; }
        
        [Required]  
        [StringLength(50)]
        public string LastName { get; set; }
        
        [Required]
        public UserType UserType { get; set; }
        
        public string? ProfileImageUrl { get; set; }
        
        public string? Bio { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;

        // Navigation Properties
        public virtual ICollection<Project> CreatedProjects { get; set; } = new List<Project>();
        public virtual ICollection<ProjectCollaborator> ProjectCollaborations { get; set; } = new List<ProjectCollaborator>();
        public virtual ICollection<HitListItem> CreatedHitListItems { get; set; } = new List<HitListItem>();
        public virtual ICollection<Track> UploadedTracks { get; set; } = new List<Track>();
        public virtual ICollection<Session> BookedSessions { get; set; } = new List<Session>();
        public virtual ICollection<Session> ProducerSessions { get; set; } = new List<Session>();
        public virtual ICollection<Session> ArtistSessions { get; set; } = new List<Session>();
        public virtual ICollection<ProducerArtistCollaboration> ProducerCollaborations { get; set; } = new List<ProducerArtistCollaboration>();
        public virtual ICollection<ProducerArtistCollaboration> ArtistCollaborations { get; set; } = new List<ProducerArtistCollaboration>();
        
        [NotMapped]
        public string FullName => $"{FirstName} {LastName}";
    }
}
```

### UserType Enum
```csharp
namespace DonutAPI.Models
{
    public enum UserType
    {
        Producer = 1,
        Artist = 2
    }
}
```

## Project Management Models

### Project Model
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace DonutAPI.Models
{
    public class Project : BaseEntity
    {
        [Required]
        [StringLength(100)]
        public string Title { get; set; }
        
        public string? Description { get; set; }
        
        public string? ArtworkUrl { get; set; }
        
        [Required]
        [StringLength(7)] // Hex color format: #RRGGBB
        public string ColorTheme { get; set; } = "#FF6B9D"; // Default donut pink
        
        [Required]
        [ForeignKey("CreatedBy")]
        public Guid CreatedById { get; set; }
        
        [Required]
        public ProjectStatus Status { get; set; } = ProjectStatus.Active;
        
        // JSON array to store track order for drag-and-drop functionality
        public string? TrackOrder { get; set; }

        // Navigation Properties
        public virtual User CreatedBy { get; set; }
        public virtual ICollection<Track> Tracks { get; set; } = new List<Track>();
        public virtual ICollection<ProjectCollaborator> Collaborators { get; set; } = new List<ProjectCollaborator>();
        public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();
        public virtual ICollection<HitListItem> ProjectHitListItems { get; set; } = new List<HitListItem>();

        // Helper methods for track ordering
        [NotMapped]
        public List<Guid> TrackOrderList 
        { 
            get => string.IsNullOrEmpty(TrackOrder) 
                ? new List<Guid>() 
                : JsonSerializer.Deserialize<List<Guid>>(TrackOrder) ?? new List<Guid>();
            set => TrackOrder = JsonSerializer.Serialize(value);
        }
    }
}
```

### ProjectStatus Enum
```csharp
namespace DonutAPI.Models
{
    public enum ProjectStatus
    {
        Active = 1,
        Completed = 2,
        Archived = 3
    }
}
```

### Track Model
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonutAPI.Models
{
    public class Track : BaseEntity
    {
        [Required]
        [ForeignKey("Project")]
        public Guid ProjectId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        public string? FileUrl { get; set; }
        
        public string? FileType { get; set; } // MP3, WAV, FLAC, etc.
        
        public TimeSpan? Duration { get; set; }
        
        [Required]
        public int OrderIndex { get; set; }
        
        [Required]
        [ForeignKey("UploadedBy")]
        public Guid UploadedById { get; set; }
        
        [Required]
        public TrackStatus Status { get; set; } = TrackStatus.Demo;

        // Navigation Properties
        public virtual Project Project { get; set; }
        public virtual User UploadedBy { get; set; }
        public virtual ICollection<HitListItem> HitListItems { get; set; } = new List<HitListItem>();
    }
}
```

### TrackStatus Enum
```csharp
namespace DonutAPI.Models
{
    public enum TrackStatus
    {
        Demo = 1,
        InProgress = 2,
        Review = 3,
        Final = 4
    }
}
```

## Hit List Management Models

### HitListItem Model
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonutAPI.Models
{
    public class HitListItem : BaseEntity
    {
        // MVP: Per-track hit lists (required)
        [ForeignKey("Track")]
        public Guid? TrackId { get; set; }
        
        // STRETCH: Project-wide hit lists (optional)
        [ForeignKey("Project")]
        public Guid? ProjectId { get; set; }
        
        [Required]
        [ForeignKey("CreatedBy")]
        public Guid CreatedById { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        public string? Description { get; set; }
        
        [Required]
        public HitListPriority Priority { get; set; } = HitListPriority.Medium;
        
        [Required]
        public HitListStatus Status { get; set; } = HitListStatus.Todo;
        
        public DateTime? DueDate { get; set; }
        
        public DateTime? CompletedAt { get; set; }

        // Navigation Properties
        public virtual Track? Track { get; set; }
        public virtual Project? Project { get; set; }
        public virtual User CreatedBy { get; set; }
    }
}
```

### HitListPriority Enum
```csharp
namespace DonutAPI.Models
{
    public enum HitListPriority
    {
        Low = 1,
        Medium = 2,
        High = 3,
        Critical = 4
    }
}
```

### HitListStatus Enum
```csharp
namespace DonutAPI.Models
{
    public enum HitListStatus
    {
        Todo = 1,
        InProgress = 2,
        Complete = 3
    }
}
```

## Session Management Models

### Session Model
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonutAPI.Models
{
    public class Session : BaseEntity
    {
        [Required]
        [ForeignKey("Producer")]
        public Guid ProducerId { get; set; }
        
        [Required]
        [ForeignKey("Artist")]
        public Guid ArtistId { get; set; }
        
        // Optional: Can be project-specific or general collaboration
        [ForeignKey("Project")]
        public Guid? ProjectId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        public string? Description { get; set; }
        
        [Required]
        public DateTime ScheduledDate { get; set; }
        
        [Required]
        public TimeSpan Duration { get; set; }
        
        public string? Location { get; set; }
        
        [Required]
        public SessionStatus Status { get; set; } = SessionStatus.Scheduled;
        
        [Required]
        [ForeignKey("BookedBy")]
        public Guid BookedById { get; set; } // Who initiated the booking

        // Navigation Properties
        public virtual User Producer { get; set; }
        public virtual User Artist { get; set; }
        public virtual Project? Project { get; set; }
        public virtual User BookedBy { get; set; }
    }
}
```

### SessionStatus Enum
```csharp
namespace DonutAPI.Models
{
    public enum SessionStatus
    {
        Scheduled = 1,
        InProgress = 2,
        Completed = 3,
        Cancelled = 4
    }
}
```

## Relationship Models (Many-to-Many)

### ProducerArtistCollaboration Model
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonutAPI.Models
{
    public class ProducerArtistCollaboration : BaseEntity
    {
        [Required]
        [ForeignKey("Producer")]
        public Guid ProducerId { get; set; }
        
        [Required]
        [ForeignKey("Artist")]
        public Guid ArtistId { get; set; }
        
        [Required]
        public CollaborationStatus Status { get; set; } = CollaborationStatus.Active;
        
        [Required]
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? EndedAt { get; set; }

        // Navigation Properties
        public virtual User Producer { get; set; }
        public virtual User Artist { get; set; }
    }
}
```

### ProjectCollaborator Model
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonutAPI.Models
{
    public class ProjectCollaborator : BaseEntity
    {
        [Required]
        [ForeignKey("Project")]
        public Guid ProjectId { get; set; }
        
        [Required]
        [ForeignKey("User")]
        public Guid UserId { get; set; }
        
        [Required]
        public ProjectRole Role { get; set; } = ProjectRole.Collaborator;
        
        public bool CanEditTracks { get; set; } = true;
        public bool CanEditHitList { get; set; } = true;
        public bool CanReorderTracks { get; set; } = true;
        public bool CanChangeTheme { get; set; } = false; // Artists can change donut colors
        
        [Required]
        public DateTime InvitedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? AcceptedAt { get; set; }
        
        [Required]
        [ForeignKey("InvitedBy")]
        public Guid InvitedById { get; set; }

        // Navigation Properties
        public virtual Project Project { get; set; }
        public virtual User User { get; set; }
        public virtual User InvitedBy { get; set; }
    }
}
```

### Enums for Relationships
```csharp
namespace DonutAPI.Models
{
    public enum CollaborationStatus
    {
        Active = 1,
        Inactive = 2,
        Pending = 3
    }
    
    public enum ProjectRole
    {
        Owner = 1,
        Collaborator = 2
    }
}
```

## Entity Framework DbContext

### DonutDbContext
```csharp
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DonutAPI.Data
{
    public class DonutDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
    {
        public DonutDbContext(DbContextOptions<DonutDbContext> options) : base(options) { }

        // DbSets for all entities
        public DbSet<Project> Projects { get; set; }
        public DbSet<Track> Tracks { get; set; }
        public DbSet<HitListItem> HitListItems { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<ProducerArtistCollaboration> ProducerArtistCollaborations { get; set; }
        public DbSet<ProjectCollaborator> ProjectCollaborators { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User relationships
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.UserType).HasConversion<int>();
            });

            // Project relationships
            modelBuilder.Entity<Project>(entity =>
            {
                entity.HasOne(p => p.CreatedBy)
                    .WithMany(u => u.CreatedProjects)
                    .HasForeignKey(p => p.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Status).HasConversion<int>();
            });

            // Track relationships
            modelBuilder.Entity<Track>(entity =>
            {
                entity.HasOne(t => t.Project)
                    .WithMany(p => p.Tracks)
                    .HasForeignKey(t => t.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(t => t.UploadedBy)
                    .WithMany(u => u.UploadedTracks)
                    .HasForeignKey(t => t.UploadedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Status).HasConversion<int>();
            });

            // HitListItem relationships
            modelBuilder.Entity<HitListItem>(entity =>
            {
                entity.HasOne(h => h.Track)
                    .WithMany(t => t.HitListItems)
                    .HasForeignKey(h => h.TrackId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(h => h.Project)
                    .WithMany(p => p.ProjectHitListItems)
                    .HasForeignKey(h => h.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(h => h.CreatedBy)
                    .WithMany(u => u.CreatedHitListItems)
                    .HasForeignKey(h => h.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Priority).HasConversion<int>();
                entity.Property(e => e.Status).HasConversion<int>();
            });

            // Session relationships
            modelBuilder.Entity<Session>(entity =>
            {
                entity.HasOne(s => s.Producer)
                    .WithMany(u => u.ProducerSessions)
                    .HasForeignKey(s => s.ProducerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Artist)
                    .WithMany(u => u.ArtistSessions)
                    .HasForeignKey(s => s.ArtistId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Project)
                    .WithMany(p => p.Sessions)
                    .HasForeignKey(s => s.ProjectId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(s => s.BookedBy)
                    .WithMany(u => u.BookedSessions)
                    .HasForeignKey(s => s.BookedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Status).HasConversion<int>();
            });

            // ProducerArtistCollaboration relationships
            modelBuilder.Entity<ProducerArtistCollaboration>(entity =>
            {
                entity.HasOne(pac => pac.Producer)
                    .WithMany(u => u.ProducerCollaborations)
                    .HasForeignKey(pac => pac.ProducerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(pac => pac.Artist)
                    .WithMany(u => u.ArtistCollaborations)
                    .HasForeignKey(pac => pac.ArtistId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Status).HasConversion<int>();

                // Ensure a producer and artist can only have one active collaboration
                entity.HasIndex(e => new { e.ProducerId, e.ArtistId })
                    .IsUnique()
                    .HasDatabaseName("IX_ProducerArtist_Unique");
            });

            // ProjectCollaborator relationships
            modelBuilder.Entity<ProjectCollaborator>(entity =>
            {
                entity.HasOne(pc => pc.Project)
                    .WithMany(p => p.Collaborators)
                    .HasForeignKey(pc => pc.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(pc => pc.User)
                    .WithMany(u => u.ProjectCollaborations)
                    .HasForeignKey(pc => pc.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(pc => pc.InvitedBy)
                    .WithMany()
                    .HasForeignKey(pc => pc.InvitedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Role).HasConversion<int>();

                // Ensure a user can only be added to a project once
                entity.HasIndex(e => new { e.ProjectId, e.UserId })
                    .IsUnique()
                    .HasDatabaseName("IX_ProjectUser_Unique");
            });

            // Configure cascade delete behaviors to prevent circular references
            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                if (relationship.DeleteBehavior == DeleteBehavior.Cascade)
                {
                    // Only allow cascade delete for specific parent-child relationships
                    var principalType = relationship.PrincipalEntityType.ClrType;
                    var dependentType = relationship.DeclaringEntityType.ClrType;
                    
                    if (!(principalType == typeof(Project) && (dependentType == typeof(Track) || dependentType == typeof(ProjectCollaborator))) &&
                        !(principalType == typeof(Track) && dependentType == typeof(HitListItem)))
                    {
                        relationship.DeleteBehavior = DeleteBehavior.Restrict;
                    }
                }
            }
        }
    }
}
```

## DTOs for API Responses

### User DTOs
```csharp
namespace DonutAPI.DTOs
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName { get; set; }
        public UserType UserType { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? Bio { get; set; }
        public DateTime CreatedAt { get; set; }
    }
    
    public class CreateUserDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string Username { get; set; }
        
        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; }
        
        [Required]
        public string FirstName { get; set; }
        
        [Required]
        public string LastName { get; set; }
        
        [Required]
        public UserType UserType { get; set; }
    }
}
```

### Project DTOs
```csharp
namespace DonutAPI.DTOs
{
    public class ProjectDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string? ArtworkUrl { get; set; }
        public string ColorTheme { get; set; }
        public ProjectStatus Status { get; set; }
        public UserDto CreatedBy { get; set; }
        public List<TrackDto> Tracks { get; set; } = new();
        public List<ProjectCollaboratorDto> Collaborators { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
    
    public class CreateProjectDto
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Title { get; set; }
        
        public string? Description { get; set; }
        
        [RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "ColorTheme must be a valid hex color")]
        public string ColorTheme { get; set; } = "#FF6B9D";
        
        [Required]
        public Guid ArtistId { get; set; } // Artist to collaborate with
    }
    
    public class UpdateProjectDto
    {
        [StringLength(100, MinimumLength = 1)]
        public string? Title { get; set; }
        
        public string? Description { get; set; }
        
        [RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "ColorTheme must be a valid hex color")]
        public string? ColorTheme { get; set; }
        
        public ProjectStatus? Status { get; set; }
        
        public List<Guid>? TrackOrder { get; set; }
    }
}
```

This comprehensive data model structure provides:

✅ **All MVP Requirements**: User authentication, project management, track uploads, hit lists, session booking  
✅ **Proper Relationships**: One-to-many and many-to-many relationships as required  
✅ **Data Ownership**: Users can only edit their own data and shared projects  
✅ **Entity Framework**: Proper configuration with foreign keys and constraints  
✅ **ASP.NET Identity**: Integrated user authentication system  
✅ **Validation**: Data annotations for input validation  
✅ **DTOs**: Clean API contracts for requests and responses  

Ready for implementation with your C#/.NET backend!