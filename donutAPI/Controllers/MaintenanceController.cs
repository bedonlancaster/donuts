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
        /// Updates duration for all tracks that don't have one
        /// </summary>
        [HttpPost("update-track-durations")]
        public async Task<IActionResult> UpdateTrackDurations()
        {
            var tracksWithoutDuration = await _context.Tracks
                .Where(t => t.Duration == null && t.FileUrl != null)
                .ToListAsync();

            _logger.LogInformation("Found {Count} tracks without duration", tracksWithoutDuration.Count);

            int updatedCount = 0;
            int failedCount = 0;

            foreach (var track in tracksWithoutDuration)
            {
                try
                {
                    // Get the file path
                    var fileName = Path.GetFileName(track.FileUrl);
                    var filePath = Path.Combine(_webHostEnvironment.ContentRootPath, "uploads", "tracks", fileName);

                    _logger.LogInformation("Processing track {TrackId}: {Title} - File: {FilePath}",
                        track.Id, track.Title, filePath);

                    // Extract duration
                    var duration = _audioMetadataService.ExtractDuration(filePath);

                    if (duration.HasValue)
                    {
                        track.Duration = duration;
                        updatedCount++;
                        _logger.LogInformation("Updated track {TrackId} with duration {Duration}",
                            track.Id, duration);
                    }
                    else
                    {
                        failedCount++;
                        _logger.LogWarning("Failed to extract duration for track {TrackId}: {Title}",
                            track.Id, track.Title);
                    }
                }
                catch (Exception ex)
                {
                    failedCount++;
                    _logger.LogError(ex, "Error processing track {TrackId}: {Title}",
                        track.Id, track.Title);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Track duration update completed",
                totalProcessed = tracksWithoutDuration.Count,
                updated = updatedCount,
                failed = failedCount
            });
        }

        /// <summary>
        /// Updates duration for a specific track
        /// </summary>
        [HttpPost("update-track-duration/{trackId}")]
        public async Task<IActionResult> UpdateSingleTrackDuration(int trackId)
        {
            var track = await _context.Tracks.FindAsync(trackId);

            if (track == null)
            {
                return NotFound("Track not found");
            }

            if (string.IsNullOrEmpty(track.FileUrl))
            {
                return BadRequest("Track has no file");
            }

            try
            {
                // Get the file path
                var fileName = Path.GetFileName(track.FileUrl);
                var filePath = Path.Combine(_webHostEnvironment.ContentRootPath, "uploads", "tracks", fileName);

                // Extract duration
                var duration = _audioMetadataService.ExtractDuration(filePath);

                if (duration.HasValue)
                {
                    track.Duration = duration;
                    await _context.SaveChangesAsync();

                    return Ok(new
                    {
                        message = "Duration updated successfully",
                        trackId = track.Id,
                        duration = track.Duration
                    });
                }
                else
                {
                    return StatusCode(500, "Failed to extract duration from audio file");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating duration for track {TrackId}", trackId);
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }
    }
}
