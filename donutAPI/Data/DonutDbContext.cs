using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using DonutAPI.Models;

namespace DonutAPI.Data
{
    public class DonutDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public DonutDbContext(DbContextOptions<DonutDbContext> options) : base(options) { }

        // DbSets for all entities
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectTheme> ProjectThemes { get; set; }
        public DbSet<ProjectCollaborator> ProjectCollaborators { get; set; }
        public DbSet<ProjectInvitation> ProjectInvitations { get; set; }
        public DbSet<Track> Tracks { get; set; }
        public DbSet<TrackVersion> TrackVersions { get; set; }
        public DbSet<HitListItem> HitListItems { get; set; }
        public DbSet<HitListItemComment> HitListItemComments { get; set; }
        public DbSet<Session> Sessions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Project relationships and enum conversion
            modelBuilder.Entity<Project>(entity =>
            {
                entity.HasOne(p => p.CreatedBy)
                    .WithMany(u => u.CreatedProjects)
                    .HasForeignKey(p => p.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Theme)
                    .WithOne(t => t.Project)
                    .HasForeignKey<Project>(p => p.ThemeId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.Property(e => e.Status).HasConversion<int>();
            });

            // ProjectTheme configuration
            modelBuilder.Entity<ProjectTheme>(entity =>
            {
                entity.Property(e => e.Mode).HasConversion<int>();
                entity.Property(e => e.Palette).HasConversion<int>();
            });

            // Track relationships and enum conversion
            modelBuilder.Entity<Track>(entity =>
            {
                entity.HasOne(t => t.Project)
                    .WithMany(p => p.Tracks)
                    .HasForeignKey(t => t.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(t => t.CreatedBy)
                    .WithMany(u => u.CreatedTracks)
                    .HasForeignKey(t => t.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Status).HasConversion<int>();
            });

            // TrackVersion relationships
            modelBuilder.Entity<TrackVersion>(entity =>
            {
                entity.HasOne(tv => tv.Track)
                    .WithMany(t => t.Versions)
                    .HasForeignKey(tv => tv.TrackId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(tv => tv.UploadedBy)
                    .WithMany(u => u.UploadedTrackVersions)
                    .HasForeignKey(tv => tv.UploadedById)
                    .OnDelete(DeleteBehavior.Restrict);

                // Ensure only one version per track is marked as current
                entity.HasIndex(tv => new { tv.TrackId, tv.IsCurrentVersion })
                    .HasFilter("[IsCurrentVersion] = 1");

                // Ensure unique version numbers per track
                entity.HasIndex(tv => new { tv.TrackId, tv.VersionNumber })
                    .IsUnique();
            });

            // HitListItem relationships and enum conversion
            modelBuilder.Entity<HitListItem>(entity =>
            {
                // Optional relationship to Track (null = project-level item)
                entity.HasOne(h => h.Track)
                    .WithMany(t => t.HitListItems)
                    .HasForeignKey(h => h.TrackId)
                    .OnDelete(DeleteBehavior.Cascade);

                // Required relationship to Project
                entity.HasOne(h => h.Project)
                    .WithMany(p => p.HitListItems)
                    .HasForeignKey(h => h.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(h => h.CreatedBy)
                    .WithMany(u => u.CreatedHitListItems)
                    .HasForeignKey(h => h.CreatedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Priority).HasConversion<int>();
                entity.Property(e => e.Status).HasConversion<int>();
                entity.Property(e => e.Category).HasConversion<int>();
            });

            // HitListItemComment relationships
            modelBuilder.Entity<HitListItemComment>(entity =>
            {
                entity.HasOne(c => c.HitListItem)
                    .WithMany(h => h.Comments)
                    .HasForeignKey(c => c.HitListItemId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(c => c.User)
                    .WithMany(u => u.HitListItemComments)
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Session relationships and enum conversion
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
                    .WithMany()
                    .HasForeignKey(s => s.BookedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.Property(e => e.Status).HasConversion<int>();
            });

            // ProjectCollaborator relationships and enum conversion
            modelBuilder.Entity<ProjectCollaborator>(entity =>
            {
                entity.HasOne(pc => pc.Project)
                    .WithMany(p => p.Collaborators)
                    .HasForeignKey(pc => pc.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(pc => pc.User)
                    .WithMany(u => u.ProjectCollaborations)
                    .HasForeignKey(pc => pc.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(pc => pc.AddedBy)
                    .WithMany(u => u.AddedCollaborators)
                    .HasForeignKey(pc => pc.AddedById)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(pc => pc.RemovedBy)
                    .WithMany()
                    .HasForeignKey(pc => pc.RemovedById)
                    .OnDelete(DeleteBehavior.Restrict);

                // Ensure unique collaborator per project (one user can't have multiple active collaborations on same project)
                entity.HasIndex(e => new { e.ProjectId, e.UserId })
                    .IsUnique()
                    .HasDatabaseName("IX_ProjectCollaborator_Project_User");

                entity.Property(e => e.Role).HasConversion<int>();
                entity.Property(e => e.Status).HasConversion<int>();
            });

            // ProjectInvitation relationships and enum conversion
            modelBuilder.Entity<ProjectInvitation>(entity =>
            {
                entity.HasOne(pi => pi.Project)
                    .WithMany()
                    .HasForeignKey(pi => pi.ProjectId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(pi => pi.InvitedUser)
                    .WithMany()
                    .HasForeignKey(pi => pi.InvitedUserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(pi => pi.InvitedBy)
                    .WithMany()
                    .HasForeignKey(pi => pi.InvitedById)
                    .OnDelete(DeleteBehavior.Restrict);

                // Prevent duplicate pending invitations
                entity.HasIndex(e => new { e.ProjectId, e.InvitedUserId, e.Status })
                    .HasDatabaseName("IX_ProjectInvitation_Project_User_Status");

                entity.Property(e => e.Status).HasConversion<int>();
            });
        }
    }
}