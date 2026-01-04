using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DonutAPI.Data;
using DonutAPI.Models;
using DonutAPI.DTOs;
using DonutAPI.Services;

namespace DonutAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TracksController : ControllerBase
    {
        private readonly DonutDbContext _context;
        private readonly UserManager<User> _userManager;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IAudioMetadataService _audioMetadataService;

        public TracksController(
            DonutDbContext context,
            UserManager<User> userManager,
            IWebHostEnvironment webHostEnvironment,
            IAudioMetadataService audioMetadataService)
        {
            _context = context;
            _userManager = userManager;
            _webHostEnvironment = webHostEnvironment;
            _audioMetadataService = audioMetadataService;
        }

        // GET: api/tracks/project/5
        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<IEnumerable<TrackDetailDto>>> GetProjectTracks(int projectId)
        {
            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
            {
                return NotFound("Project not found");
            }

            var tracks = await _context.Tracks
                .Include(t => t.CreatedBy)
                .Include(t => t.Versions)
                    .ThenInclude(v => v.UploadedBy)
                .Where(t => t.ProjectId == projectId)
                .OrderBy(t => t.OrderIndex)
                .ToListAsync();

            var trackDtos = tracks.Select(t => MapToTrackDetailDto(t)).ToList();
            return Ok(trackDtos);
        }

        // GET: api/tracks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TrackDetailDto>> GetTrack(int id)
        {
            var track = await _context.Tracks
                .Include(t => t.Project)
                    .ThenInclude(p => p.CreatedBy)
                .Include(t => t.Project)
                    .ThenInclude(p => p.Theme)
                .Include(t => t.CreatedBy)
                .Include(t => t.Versions)
                    .ThenInclude(v => v.UploadedBy)
                .Include(t => t.HitListItems)
                    .ThenInclude(h => h.CreatedBy)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (track == null)
            {
                return NotFound();
            }

            var trackDto = MapToTrackDetailDto(track, includeHitListItems: true);
            return Ok(trackDto);
        }

        // POST: api/tracks/upload (Create track + upload first version in one step)
        [HttpPost("upload")]
        [RequestSizeLimit(100 * 1024 * 1024)] // 100 MB limit
        [RequestFormLimits(MultipartBodyLengthLimit = 100 * 1024 * 1024)]
        public async Task<ActionResult<TrackDetailDto>> CreateTrackWithVersion([FromForm] CreateTrackWithVersionDto dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            // Verify project exists and user has access
            var project = await _context.Projects
                .Include(p => p.CreatedBy)
                .Include(p => p.Collaborators)
                .FirstOrDefaultAsync(p => p.Id == dto.ProjectId);

            if (project == null)
            {
                return BadRequest("Project not found");
            }

            // Check permission
            bool hasAccess = project.CreatedById == user.Id ||
                           project.Collaborators.Any(c => c.UserId == user.Id);

            if (!hasAccess)
            {
                return Forbid("You don't have permission to upload tracks to this project");
            }

            // Validate file
            var allowedExtensions = new[] { ".mp3", ".wav", ".flac", ".m4a", ".aac", ".ogg" };
            var fileExtension = Path.GetExtension(dto.AudioFile.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest("Invalid file type. Allowed types: MP3, WAV, FLAC, M4A, AAC, OGG");
            }

            const long maxFileSize = 100 * 1024 * 1024; // 100MB
            if (dto.AudioFile.Length > maxFileSize)
            {
                return BadRequest("File size exceeds 100MB limit");
            }

            // Calculate order index
            var orderIndex = dto.OrderIndex;
            if (orderIndex == 0)
            {
                var maxOrder = await _context.Tracks
                    .Where(t => t.ProjectId == dto.ProjectId)
                    .MaxAsync(t => (int?)t.OrderIndex) ?? 0;
                orderIndex = maxOrder + 1;
            }

            // Create track container
            var track = new Track
            {
                Title = dto.Title,
                ProjectId = dto.ProjectId,
                OrderIndex = orderIndex,
                Status = dto.Status,
                CreatedById = user.Id,
                CreatedAt = DateTime.UtcNow
            };

            _context.Tracks.Add(track);
            await _context.SaveChangesAsync(); // Get track ID

            try
            {
                // Create version 1
                var version = await CreateVersionAsync(track.Id, dto.AudioFile, user.Id, dto.Notes);
                track.Versions.Add(version);
                await _context.SaveChangesAsync();

                // Load navigation properties
                await _context.Entry(track)
                    .Reference(t => t.CreatedBy)
                    .LoadAsync();
                await _context.Entry(track)
                    .Collection(t => t.Versions)
                    .Query()
                    .Include(v => v.UploadedBy)
                    .LoadAsync();

                var trackDto = MapToTrackDetailDto(track);
                return CreatedAtAction(nameof(GetTrack), new { id = track.Id }, trackDto);
            }
            catch (Exception ex)
            {
                // Rollback: remove track if version creation fails
                _context.Tracks.Remove(track);
                await _context.SaveChangesAsync();
                return StatusCode(500, new { message = "Failed to create track", error = ex.Message });
            }
        }

        // POST: api/tracks/5/versions (Add new version to existing track)
        [HttpPost("{trackId}/versions")]
        [RequestSizeLimit(100 * 1024 * 1024)]
        [RequestFormLimits(MultipartBodyLengthLimit = 100 * 1024 * 1024)]
        public async Task<ActionResult<TrackVersionDto>> AddVersion(int trackId, [FromForm] CreateTrackVersionDto dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            var track = await _context.Tracks
                .Include(t => t.Project)
                    .ThenInclude(p => p.Collaborators)
                .Include(t => t.Versions)
                .FirstOrDefaultAsync(t => t.Id == trackId);

            if (track == null)
            {
                return NotFound("Track not found");
            }

            // Check permission
            bool hasAccess = track.Project.CreatedById == user.Id ||
                           track.Project.Collaborators.Any(c => c.UserId == user.Id);

            if (!hasAccess)
            {
                return Forbid("You don't have permission to add versions to this track");
            }

            // Validate file
            var allowedExtensions = new[] { ".mp3", ".wav", ".flac", ".m4a", ".aac", ".ogg" };
            var fileExtension = Path.GetExtension(dto.AudioFile.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(fileExtension))
            {
                return BadRequest("Invalid file type. Allowed types: MP3, WAV, FLAC, M4A, AAC, OGG");
            }

            const long maxFileSize = 100 * 1024 * 1024;
            if (dto.AudioFile.Length > maxFileSize)
            {
                return BadRequest("File size exceeds 100MB limit");
            }

            try
            {
                // Unset current version flag on all existing versions
                foreach (var v in track.Versions)
                {
                    v.IsCurrentVersion = false;
                }

                // Create new version
                var version = await CreateVersionAsync(trackId, dto.AudioFile, user.Id, dto.Notes);

                await _context.SaveChangesAsync();

                // Load uploader info
                await _context.Entry(version)
                    .Reference(v => v.UploadedBy)
                    .LoadAsync();

                var versionDto = MapToVersionDto(version);
                return CreatedAtAction(nameof(GetVersion), new { trackId, versionId = version.Id }, versionDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to add version", error = ex.Message });
            }
        }

        // GET: api/tracks/5/versions
        [HttpGet("{trackId}/versions")]
        public async Task<ActionResult<IEnumerable<TrackVersionDto>>> GetVersions(int trackId)
        {
            var track = await _context.Tracks.FindAsync(trackId);
            if (track == null)
            {
                return NotFound("Track not found");
            }

            var versions = await _context.TrackVersions
                .Include(v => v.UploadedBy)
                .Where(v => v.TrackId == trackId)
                .OrderBy(v => v.VersionNumber)
                .ToListAsync();

            var versionDtos = versions.Select(v => MapToVersionDto(v)).ToList();
            return Ok(versionDtos);
        }

        // GET: api/tracks/5/versions/3
        [HttpGet("{trackId}/versions/{versionId}")]
        public async Task<ActionResult<TrackVersionDto>> GetVersion(int trackId, int versionId)
        {
            var version = await _context.TrackVersions
                .Include(v => v.UploadedBy)
                .FirstOrDefaultAsync(v => v.Id == versionId && v.TrackId == trackId);

            if (version == null)
            {
                return NotFound("Version not found");
            }

            var versionDto = MapToVersionDto(version);
            return Ok(versionDto);
        }

        // PUT: api/tracks/5/versions/3/set-current
        [HttpPut("{trackId}/versions/{versionId}/set-current")]
        public async Task<IActionResult> SetCurrentVersion(int trackId, int versionId)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            var track = await _context.Tracks
                .Include(t => t.Project)
                    .ThenInclude(p => p.Collaborators)
                .Include(t => t.Versions)
                .FirstOrDefaultAsync(t => t.Id == trackId);

            if (track == null)
            {
                return NotFound("Track not found");
            }

            // Check permission
            bool hasAccess = track.Project.CreatedById == user.Id ||
                           track.Project.Collaborators.Any(c => c.UserId == user.Id);

            if (!hasAccess)
            {
                return Forbid("You don't have permission to modify this track");
            }

            var version = track.Versions.FirstOrDefault(v => v.Id == versionId);
            if (version == null)
            {
                return NotFound("Version not found");
            }

            // Unset all current versions
            foreach (var v in track.Versions)
            {
                v.IsCurrentVersion = false;
            }

            // Set new current version
            version.IsCurrentVersion = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Version {version.VersionNumber} is now current" });
        }

        // DELETE: api/tracks/5/versions/3
        [HttpDelete("{trackId}/versions/{versionId}")]
        public async Task<IActionResult> DeleteVersion(int trackId, int versionId)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            var track = await _context.Tracks
                .Include(t => t.Project)
                    .ThenInclude(p => p.Collaborators)
                .Include(t => t.Versions)
                .FirstOrDefaultAsync(t => t.Id == trackId);

            if (track == null)
            {
                return NotFound("Track not found");
            }

            // Check permission
            bool hasAccess = track.Project.CreatedById == user.Id ||
                           track.Project.Collaborators.Any(c => c.UserId == user.Id);

            if (!hasAccess)
            {
                return Forbid("You don't have permission to delete versions from this track");
            }

            // Can't delete if only one version
            if (track.Versions.Count <= 1)
            {
                return BadRequest("Cannot delete the only version of a track. Delete the track instead.");
            }

            var version = track.Versions.FirstOrDefault(v => v.Id == versionId);
            if (version == null)
            {
                return NotFound("Version not found");
            }

            // Delete physical file
            if (!string.IsNullOrEmpty(version.FileUrl))
            {
                var fileName = Path.GetFileName(version.FileUrl);
                var filePath = Path.Combine(_webHostEnvironment.ContentRootPath, "uploads", "tracks", fileName);
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            // If deleting current version, set another as current
            if (version.IsCurrentVersion && track.Versions.Count > 1)
            {
                var latestOther = track.Versions
                    .Where(v => v.Id != versionId)
                    .OrderByDescending(v => v.VersionNumber)
                    .First();
                latestOther.IsCurrentVersion = true;
            }

            _context.TrackVersions.Remove(version);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Version deleted successfully" });
        }

        // PUT: api/tracks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTrack(int id, UpdateTrackDto updateDto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            var track = await _context.Tracks
                .Include(t => t.Project)
                    .ThenInclude(p => p.Collaborators)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (track == null)
            {
                return NotFound();
            }

            // Check permission
            bool hasAccess = track.Project.CreatedById == user.Id ||
                           track.Project.Collaborators.Any(c => c.UserId == user.Id);

            if (!hasAccess)
            {
                return Forbid("You don't have permission to update this track");
            }

            // Update fields
            if (!string.IsNullOrEmpty(updateDto.Title))
                track.Title = updateDto.Title;

            if (updateDto.OrderIndex.HasValue)
                track.OrderIndex = updateDto.OrderIndex.Value;

            if (updateDto.Status.HasValue)
                track.Status = updateDto.Status.Value;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/tracks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTrack(int id)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            var track = await _context.Tracks
                .Include(t => t.Project)
                    .ThenInclude(p => p.Collaborators)
                .Include(t => t.Versions)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (track == null)
            {
                return NotFound();
            }

            // Check permission
            bool hasAccess = track.Project.CreatedById == user.Id ||
                           track.Project.Collaborators.Any(c => c.UserId == user.Id);

            if (!hasAccess)
            {
                return Forbid("You don't have permission to delete this track");
            }

            // Delete all version files
            foreach (var version in track.Versions)
            {
                if (!string.IsNullOrEmpty(version.FileUrl))
                {
                    var fileName = Path.GetFileName(version.FileUrl);
                    var filePath = Path.Combine(_webHostEnvironment.ContentRootPath, "uploads", "tracks", fileName);
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }
            }

            _context.Tracks.Remove(track);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/tracks/reorder
        [HttpPost("reorder")]
        public async Task<IActionResult> ReorderTracks(ReorderTracksDto reorderDto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            foreach (var trackOrder in reorderDto.TrackOrders)
            {
                var track = await _context.Tracks.FindAsync(trackOrder.TrackId);
                if (track != null)
                {
                    track.OrderIndex = trackOrder.OrderIndex;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Tracks reordered successfully" });
        }

        // ===== HELPER METHODS =====

        private async Task<TrackVersion> CreateVersionAsync(int trackId, IFormFile audioFile, int userId, string? notes)
        {
            // Get next version number
            var maxVersion = await _context.TrackVersions
                .Where(v => v.TrackId == trackId)
                .MaxAsync(v => (int?)v.VersionNumber) ?? 0;
            var versionNumber = maxVersion + 1;

            var fileExtension = Path.GetExtension(audioFile.FileName).ToLowerInvariant();

            // Create uploads directory
            var uploadsDir = Path.Combine(_webHostEnvironment.ContentRootPath, "uploads", "tracks");
            Directory.CreateDirectory(uploadsDir);

            // Generate unique filename
            var fileName = $"{trackId}_v{versionNumber}_{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsDir, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await audioFile.CopyToAsync(stream);
            }

            // Extract duration
            TimeSpan? duration = null;
            try
            {
                duration = _audioMetadataService.ExtractDuration(filePath);
            }
            catch
            {
                // Duration extraction is optional
            }

            // Create version record
            var version = new TrackVersion
            {
                TrackId = trackId,
                VersionNumber = versionNumber,
                FileUrl = $"/uploads/tracks/{fileName}",
                FileType = fileExtension.TrimStart('.'),
                Duration = duration,
                UploadedById = userId,
                UploadedAt = DateTime.UtcNow,
                IsCurrentVersion = true, // New versions are always current
                Notes = notes
            };

            _context.TrackVersions.Add(version);
            return version;
        }

        private TrackDetailDto MapToTrackDetailDto(Track track, bool includeHitListItems = false)
        {
            var currentVersion = track.Versions.FirstOrDefault(v => v.IsCurrentVersion);

            return new TrackDetailDto
            {
                Id = track.Id,
                Title = track.Title,
                OrderIndex = track.OrderIndex,
                Status = track.Status,
                CreatedAt = track.CreatedAt,
                CreatedBy = track.CreatedBy.ToUserDto(),
                Project = new ProjectDto
                {
                    Id = track.Project.Id,
                    Title = track.Project.Title,
                    ArtistName = track.Project.ArtistName,
                    Description = track.Project.Description,
                    Status = track.Project.Status,
                    ArtworkUrl = track.Project.ArtworkUrl,
                    CreatedBy = track.Project.CreatedBy.ToUserDto(),
                    Theme = new ProjectThemeDto
                    {
                        Id = track.Project.Theme.Id,
                        Mode = track.Project.Theme.Mode,
                        Palette = track.Project.Theme.Palette
                    },
                    Tracks = new List<TrackDto>(),
                    Collaborators = new List<CollaboratorDto>()
                },
                CurrentVersion = currentVersion != null ? MapToVersionDto(currentVersion) : null,
                Versions = track.Versions
                    .OrderBy(v => v.VersionNumber)
                    .Select(v => MapToVersionDto(v))
                    .ToList(),
                HitListItems = includeHitListItems
                    ? track.HitListItems.Select(h => new HitListItemDto
                    {
                        Id = h.Id,
                        Title = h.Title,
                        Description = h.Description,
                        Priority = h.Priority,
                        Status = h.Status,
                        Category = h.Category,
                        SortOrder = h.SortOrder,
                        DueDate = h.DueDate,
                        CompletedAt = h.CompletedAt,
                        ProjectId = h.ProjectId,
                        TrackId = h.TrackId,
                        TrackTitle = track.Title,
                        CreatedBy = h.CreatedBy.ToUserDto()
                    }).ToList()
                    : new List<HitListItemDto>()
            };
        }

        private TrackVersionDto MapToVersionDto(TrackVersion version)
        {
            return new TrackVersionDto
            {
                Id = version.Id,
                TrackId = version.TrackId,
                VersionNumber = version.VersionNumber,
                FileUrl = version.FileUrl,
                FileType = version.FileType,
                Duration = version.Duration,
                UploadedAt = version.UploadedAt,
                IsCurrentVersion = version.IsCurrentVersion,
                Notes = version.Notes,
                UploadedBy = version.UploadedBy.ToUserDto()
            };
        }
    }
}
