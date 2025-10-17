using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DonutAPI.Data;
using DonutAPI.Models;
using DonutAPI.DTOs;

namespace DonutAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HitListItemsController : ControllerBase
    {
        private readonly DonutDbContext _context;
        private readonly UserManager<User> _userManager;

        public HitListItemsController(DonutDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/hitlistitems/project/5
        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<IEnumerable<HitListItemDto>>> GetProjectHitListItems(int projectId)
        {
            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
            {
                return NotFound("Project not found");
            }

            var hitListItems = await _context.HitListItems
                .Include(h => h.CreatedBy)
                .Include(h => h.Track)
                .Where(h => h.ProjectId == projectId)
                .OrderBy(h => h.Priority)
                .ThenBy(h => h.DueDate)
                .Select(h => new HitListItemDto
                {
                    Id = h.Id,
                    Title = h.Title,
                    Description = h.Description,
                    Priority = h.Priority,
                    Status = h.Status,
                    DueDate = h.DueDate,
                    CompletedAt = h.CompletedAt,
                    ProjectId = h.ProjectId,
                    TrackId = h.TrackId,
                    TrackTitle = h.Track != null ? h.Track.Title : null,
                    CreatedBy = h.CreatedBy.ToUserDto()
                })
                .ToListAsync();

            return Ok(hitListItems);
        }

        // GET: api/hitlistitems/track/5
        [HttpGet("track/{trackId}")]
        public async Task<ActionResult<IEnumerable<HitListItemDto>>> GetTrackHitListItems(int trackId)
        {
            var track = await _context.Tracks.FindAsync(trackId);
            if (track == null)
            {
                return NotFound("Track not found");
            }

            var hitListItems = await _context.HitListItems
                .Include(h => h.CreatedBy)
                .Include(h => h.Track)
                .Where(h => h.TrackId == trackId)
                .OrderBy(h => h.Priority)
                .ThenBy(h => h.DueDate)
                .Select(h => new HitListItemDto
                {
                    Id = h.Id,
                    Title = h.Title,
                    Description = h.Description,
                    Priority = h.Priority,
                    Status = h.Status,
                    DueDate = h.DueDate,
                    CompletedAt = h.CompletedAt,
                    ProjectId = h.ProjectId,
                    TrackId = h.TrackId,
                    TrackTitle = h.Track!.Title,
                    CreatedBy = h.CreatedBy.ToUserDto()
                })
                .ToListAsync();

            return Ok(hitListItems);
        }

        // GET: api/hitlistitems/5
        [HttpGet("{id}")]
        public async Task<ActionResult<HitListItemDto>> GetHitListItem(int id)
        {
            var hitListItem = await _context.HitListItems
                .Include(h => h.CreatedBy)
                .Include(h => h.Track)
                .FirstOrDefaultAsync(h => h.Id == id);

            if (hitListItem == null)
            {
                return NotFound();
            }

            var hitListItemDto = new HitListItemDto
            {
                Id = hitListItem.Id,
                Title = hitListItem.Title,
                Description = hitListItem.Description,
                Priority = hitListItem.Priority,
                Status = hitListItem.Status,
                DueDate = hitListItem.DueDate,
                CompletedAt = hitListItem.CompletedAt,
                ProjectId = hitListItem.ProjectId,
                TrackId = hitListItem.TrackId,
                TrackTitle = hitListItem.Track?.Title,
                CreatedBy = hitListItem.CreatedBy.ToUserDto()
            };

            return Ok(hitListItemDto);
        }

        // POST: api/hitlistitems
        [HttpPost]
        public async Task<ActionResult<HitListItemDto>> CreateHitListItem(CreateHitListItemDto createHitListItemDto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            // Verify project exists
            var project = await _context.Projects.FindAsync(createHitListItemDto.ProjectId);
            if (project == null)
            {
                return BadRequest("Project not found");
            }

            // If TrackId is provided, verify track exists and belongs to the project
            if (createHitListItemDto.TrackId.HasValue)
            {
                var track = await _context.Tracks
                    .FirstOrDefaultAsync(t => t.Id == createHitListItemDto.TrackId.Value && t.ProjectId == createHitListItemDto.ProjectId);
                if (track == null)
                {
                    return BadRequest("Track not found or doesn't belong to the specified project");
                }
            }

            var hitListItem = new HitListItem
            {
                Title = createHitListItemDto.Title,
                Description = createHitListItemDto.Description,
                ProjectId = createHitListItemDto.ProjectId,
                TrackId = createHitListItemDto.TrackId,
                Priority = createHitListItemDto.Priority,
                DueDate = createHitListItemDto.DueDate,
                CreatedById = user.Id,
                Status = HitListStatus.Todo
            };

            _context.HitListItems.Add(hitListItem);
            await _context.SaveChangesAsync();

            // Reload with navigation properties
            await _context.Entry(hitListItem)
                .Reference(h => h.CreatedBy)
                .LoadAsync();
            await _context.Entry(hitListItem)
                .Reference(h => h.Track)
                .LoadAsync();

            var hitListItemDto = new HitListItemDto
            {
                Id = hitListItem.Id,
                Title = hitListItem.Title,
                Description = hitListItem.Description,
                Priority = hitListItem.Priority,
                Status = hitListItem.Status,
                DueDate = hitListItem.DueDate,
                CompletedAt = hitListItem.CompletedAt,
                ProjectId = hitListItem.ProjectId,
                TrackId = hitListItem.TrackId,
                TrackTitle = hitListItem.Track?.Title,
                CreatedBy = hitListItem.CreatedBy.ToUserDto()
            };

            return CreatedAtAction(nameof(GetHitListItem), new { id = hitListItem.Id }, hitListItemDto);
        }

        // PUT: api/hitlistitems/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateHitListItem(int id, UpdateHitListItemDto updateHitListItemDto)
        {
            var hitListItem = await _context.HitListItems
                .Include(h => h.CreatedBy)
                .FirstOrDefaultAsync(h => h.Id == id);

            if (hitListItem == null)
            {
                return NotFound();
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null || hitListItem.CreatedById != user.Id)
            {
                return Forbid("You can only update your own hit list items");
            }

            // Update only provided fields
            if (!string.IsNullOrEmpty(updateHitListItemDto.Title))
                hitListItem.Title = updateHitListItemDto.Title;

            if (updateHitListItemDto.Description != null)
                hitListItem.Description = updateHitListItemDto.Description;

            if (updateHitListItemDto.Priority.HasValue)
                hitListItem.Priority = updateHitListItemDto.Priority.Value;

            if (updateHitListItemDto.Status.HasValue)
            {
                hitListItem.Status = updateHitListItemDto.Status.Value;

                // If marking as complete, set completion timestamp
                if (updateHitListItemDto.Status.Value == HitListStatus.Complete && hitListItem.CompletedAt == null)
                {
                    hitListItem.CompletedAt = DateTime.UtcNow;
                }
                // If changing from complete to something else, clear completion timestamp
                else if (updateHitListItemDto.Status.Value != HitListStatus.Complete)
                {
                    hitListItem.CompletedAt = null;
                }
            }

            if (updateHitListItemDto.DueDate.HasValue)
                hitListItem.DueDate = updateHitListItemDto.DueDate.Value;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/hitlistitems/5/complete
        [HttpPost("{id}/complete")]
        public async Task<IActionResult> CompleteHitListItem(int id, CompleteHitListItemDto completeDto)
        {
            var hitListItem = await _context.HitListItems
                .Include(h => h.CreatedBy)
                .FirstOrDefaultAsync(h => h.Id == id);

            if (hitListItem == null)
            {
                return NotFound();
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null || hitListItem.CreatedById != user.Id)
            {
                return Forbid("You can only complete your own hit list items");
            }

            hitListItem.Status = HitListStatus.Complete;
            hitListItem.CompletedAt = completeDto.CompletedAt ?? DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Hit list item marked as complete", completedAt = hitListItem.CompletedAt });
        }

        // DELETE: api/hitlistitems/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteHitListItem(int id)
        {
            var hitListItem = await _context.HitListItems
                .FirstOrDefaultAsync(h => h.Id == id);

            if (hitListItem == null)
            {
                return NotFound();
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null || hitListItem.CreatedById != user.Id)
            {
                return Forbid("You can only delete your own hit list items");
            }

            _context.HitListItems.Remove(hitListItem);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/hitlistitems/my
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<HitListItemDto>>> GetMyHitListItems(
            [FromQuery] HitListStatus? status = null,
            [FromQuery] HitListPriority? priority = null,
            [FromQuery] int? projectId = null)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            var query = _context.HitListItems
                .Include(h => h.CreatedBy)
                .Include(h => h.Track)
                .Where(h => h.CreatedById == user.Id);

            // Apply filters
            if (status.HasValue)
                query = query.Where(h => h.Status == status.Value);

            if (priority.HasValue)
                query = query.Where(h => h.Priority == priority.Value);

            if (projectId.HasValue)
                query = query.Where(h => h.ProjectId == projectId.Value);

            var hitListItems = await query
                .OrderBy(h => h.Status == HitListStatus.Complete ? 1 : 0) // Incomplete items first
                .ThenByDescending(h => h.Priority)
                .ThenBy(h => h.DueDate)
                .Select(h => new HitListItemDto
                {
                    Id = h.Id,
                    Title = h.Title,
                    Description = h.Description,
                    Priority = h.Priority,
                    Status = h.Status,
                    DueDate = h.DueDate,
                    CompletedAt = h.CompletedAt,
                    ProjectId = h.ProjectId,
                    TrackId = h.TrackId,
                    TrackTitle = h.Track != null ? h.Track.Title : null,
                    CreatedBy = h.CreatedBy.ToUserDto()
                })
                .ToListAsync();

            return Ok(hitListItems);
        }
    }
}