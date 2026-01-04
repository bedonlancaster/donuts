using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DonutAPI.Data;
using DonutAPI.Services;

namespace DonutAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MaintenanceController : ControllerBase
    {
        private readonly DonutDbContext _context;
        private readonly IAudioMetadataService _audioMetadataService;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly ILogger<MaintenanceController> _logger;

        public MaintenanceController(
            DonutDbContext context,
            IAudioMetadataService audioMetadataService,
            IWebHostEnvironment webHostEnvironment,
            ILogger<MaintenanceController> logger)
        {
            _context = context;
            _audioMetadataService = audioMetadataService;
            _webHostEnvironment = webHostEnvironment;
            _logger = logger;
        }

        /// <summary>
        /// Updates duration for all track versions that don't have one
        /// </summary>
        [HttpPost("update-track-durations")]
        public async Task<IActionResult> UpdateTrackDurations()
        {
            var versionsWithoutDuration = await _context.TrackVersions
                .Where(v => v.Duration == null && v.FileUrl != null)
                .ToListAsync();

            _logger.LogInformation("Found {Count} track versions without duration", versionsWithoutDuration.Count);

            int updatedCount = 0;
            int failedCount = 0;

            foreach (var version in versionsWithoutDuration)
            {
                try
                {
                    // Get the file path
                    var fileName = Path.GetFileName(version.FileUrl);
                    var filePath = Path.Combine(_webHostEnvironment.ContentRootPath, "uploads", "tracks", fileName);

                    _logger.LogInformation("Processing version {VersionId} (v{VersionNumber}) - File: {FilePath}",
                        version.Id, version.VersionNumber, filePath);

                    // Extract duration
                    var duration = _audioMetadataService.ExtractDuration(filePath);

                    if (duration.HasValue)
                    {
                        version.Duration = duration;
                        updatedCount++;
                        _logger.LogInformation("Updated version {VersionId} with duration {Duration}",
                            version.Id, duration);
                    }
                    else
                    {
                        failedCount++;
                        _logger.LogWarning("Failed to extract duration for version {VersionId}",
                            version.Id);
                    }
                }
                catch (Exception ex)
                {
                    failedCount++;
                    _logger.LogError(ex, "Error processing version {VersionId}",
                        version.Id);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Track version duration update completed",
                totalProcessed = versionsWithoutDuration.Count,
                updated = updatedCount,
                failed = failedCount
            });
        }

        /// <summary>
        /// Updates duration for a specific track version
        /// </summary>
        [HttpPost("update-version-duration/{versionId}")]
        public async Task<IActionResult> UpdateSingleVersionDuration(int versionId)
        {
            var version = await _context.TrackVersions.FindAsync(versionId);

            if (version == null)
            {
                return NotFound("Track version not found");
            }

            if (string.IsNullOrEmpty(version.FileUrl))
            {
                return BadRequest("Version has no file");
            }

            try
            {
                // Get the file path
                var fileName = Path.GetFileName(version.FileUrl);
                var filePath = Path.Combine(_webHostEnvironment.ContentRootPath, "uploads", "tracks", fileName);

                // Extract duration
                var duration = _audioMetadataService.ExtractDuration(filePath);

                if (duration.HasValue)
                {
                    version.Duration = duration;
                    await _context.SaveChangesAsync();

                    return Ok(new
                    {
                        message = "Duration updated successfully",
                        versionId = version.Id,
                        duration = version.Duration
                    });
                }
                else
                {
                    return StatusCode(500, "Failed to extract duration from audio file");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating duration for version {VersionId}", versionId);
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }
    }
}
