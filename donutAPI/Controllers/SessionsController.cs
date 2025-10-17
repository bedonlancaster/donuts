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
    public class SessionsController : ControllerBase
    {
        private readonly DonutDbContext _context;
        private readonly UserManager<User> _userManager;

        public SessionsController(DonutDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/sessions
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SessionDto>>> GetSessions(
            [FromQuery] SessionStatus? status = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            var query = _context.Sessions
                .Include(s => s.Producer)
                .Include(s => s.Artist)
                .Include(s => s.BookedBy)
                .Include(s => s.Project)
                .Where(s => s.ProducerId == user.Id || s.ArtistId == user.Id);

            // Apply filters
            if (status.HasValue)
                query = query.Where(s => s.Status == status.Value);

            if (fromDate.HasValue)
                query = query.Where(s => s.ScheduledDate >= fromDate.Value);

            if (toDate.HasValue)
                query = query.Where(s => s.ScheduledDate <= toDate.Value);

            var sessions = await query
                .OrderBy(s => s.ScheduledDate)
                .Select(s => new SessionDto
                {
                    Id = s.Id,
                    Title = s.Title,
                    Description = s.Description,
                    ScheduledDate = s.ScheduledDate,
                    Duration = s.Duration,
                    Location = s.Location,
                    Status = s.Status,
                    Producer = s.Producer.ToUserDto(),
                    Artist = s.Artist.ToUserDto(),
                    BookedBy = s.BookedBy.ToUserDto(),
                    ProjectId = s.ProjectId,
                    ProjectTitle = s.Project != null ? s.Project.Title : null
                })
                .ToListAsync();

            return Ok(sessions);
        }

        // GET: api/sessions/5
        [HttpGet("{id}")]
        public async Task<ActionResult<SessionDto>> GetSession(int id)
        {
            var session = await _context.Sessions
                .Include(s => s.Producer)
                .Include(s => s.Artist)
                .Include(s => s.BookedBy)
                .Include(s => s.Project)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (session == null)
            {
                return NotFound();
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null || (session.ProducerId != user.Id && session.ArtistId != user.Id))
            {
                return Forbid("You can only view sessions you're involved in");
            }

            var sessionDto = new SessionDto
            {
                Id = session.Id,
                Title = session.Title,
                Description = session.Description,
                ScheduledDate = session.ScheduledDate,
                Duration = session.Duration,
                Location = session.Location,
                Status = session.Status,
                Producer = session.Producer.ToUserDto(),
                Artist = session.Artist.ToUserDto(),
                BookedBy = session.BookedBy.ToUserDto(),
                ProjectId = session.ProjectId,
                ProjectTitle = session.Project?.Title
            };

            return Ok(sessionDto);
        }

        // POST: api/sessions
        [HttpPost]
        public async Task<ActionResult<SessionDto>> CreateSession(CreateSessionDto createSessionDto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            // Verify producer and artist exist and are of correct types
            var producer = await _userManager.FindByIdAsync(createSessionDto.ProducerId.ToString());
            var artist = await _userManager.FindByIdAsync(createSessionDto.ArtistId.ToString());

            if (producer == null || !producer.IsProducer)
            {
                return BadRequest("Invalid producer");
            }

            if (artist == null || !artist.IsArtist)
            {
                return BadRequest("Invalid artist");
            }

            // User must be either the producer or artist to book a session
            if (user.Id != createSessionDto.ProducerId && user.Id != createSessionDto.ArtistId)
            {
                return Forbid("You can only book sessions for yourself");
            }

            // If ProjectId is provided, verify it exists
            if (createSessionDto.ProjectId.HasValue)
            {
                var project = await _context.Projects.FindAsync(createSessionDto.ProjectId.Value);
                if (project == null)
                {
                    return BadRequest("Project not found");
                }
            }

            var session = new Session
            {
                Title = createSessionDto.Title,
                Description = createSessionDto.Description,
                ProducerId = createSessionDto.ProducerId,
                ArtistId = createSessionDto.ArtistId,
                ProjectId = createSessionDto.ProjectId,
                ScheduledDate = createSessionDto.ScheduledDate,
                Duration = createSessionDto.Duration,
                Location = createSessionDto.Location,
                BookedById = user.Id,
                Status = SessionStatus.Scheduled
            };

            _context.Sessions.Add(session);
            await _context.SaveChangesAsync();

            // Reload with navigation properties
            await _context.Entry(session)
                .Reference(s => s.Producer)
                .LoadAsync();
            await _context.Entry(session)
                .Reference(s => s.Artist)
                .LoadAsync();
            await _context.Entry(session)
                .Reference(s => s.BookedBy)
                .LoadAsync();
            await _context.Entry(session)
                .Reference(s => s.Project)
                .LoadAsync();

            var sessionDto = new SessionDto
            {
                Id = session.Id,
                Title = session.Title,
                Description = session.Description,
                ScheduledDate = session.ScheduledDate,
                Duration = session.Duration,
                Location = session.Location,
                Status = session.Status,
                Producer = session.Producer.ToUserDto(),
                Artist = session.Artist.ToUserDto(),
                BookedBy = session.BookedBy.ToUserDto(),
                ProjectId = session.ProjectId,
                ProjectTitle = session.Project?.Title
            };

            return CreatedAtAction(nameof(GetSession), new { id = session.Id }, sessionDto);
        }

        // PUT: api/sessions/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSession(int id, UpdateSessionDto updateSessionDto)
        {
            var session = await _context.Sessions
                .FirstOrDefaultAsync(s => s.Id == id);

            if (session == null)
            {
                return NotFound();
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null || (session.ProducerId != user.Id && session.ArtistId != user.Id))
            {
                return Forbid("You can only update sessions you're involved in");
            }

            // Update only provided fields
            if (!string.IsNullOrEmpty(updateSessionDto.Title))
                session.Title = updateSessionDto.Title;

            if (updateSessionDto.Description != null)
                session.Description = updateSessionDto.Description;

            if (updateSessionDto.ScheduledDate.HasValue)
                session.ScheduledDate = updateSessionDto.ScheduledDate.Value;

            if (updateSessionDto.Duration.HasValue)
                session.Duration = updateSessionDto.Duration.Value;

            if (updateSessionDto.Location != null)
                session.Location = updateSessionDto.Location;

            if (updateSessionDto.Status.HasValue)
                session.Status = updateSessionDto.Status.Value;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/sessions/5/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateSessionStatus(int id, UpdateSessionStatusDto statusDto)
        {
            var session = await _context.Sessions
                .FirstOrDefaultAsync(s => s.Id == id);

            if (session == null)
            {
                return NotFound();
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null || (session.ProducerId != user.Id && session.ArtistId != user.Id))
            {
                return Forbid("You can only update sessions you're involved in");
            }

            session.Status = statusDto.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Session status updated", status = session.Status });
        }

        // DELETE: api/sessions/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSession(int id)
        {
            var session = await _context.Sessions
                .FirstOrDefaultAsync(s => s.Id == id);

            if (session == null)
            {
                return NotFound();
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null || session.BookedById != user.Id)
            {
                return Forbid("You can only delete sessions you booked");
            }

            _context.Sessions.Remove(session);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/sessions/producers
        [HttpGet("producers")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAvailableProducers()
        {
            var producers = await _userManager.Users
                .Where(u => u.IsProducer)
                .Select(u => u.ToUserDto())
                .ToListAsync();

            return Ok(producers);
        }

        // GET: api/sessions/artists
        [HttpGet("artists")]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetAvailableArtists()
        {
            var artists = await _userManager.Users
                .Where(u => u.IsArtist)
                .Select(u => u.ToUserDto())
                .ToListAsync();

            return Ok(artists);
        }
    }
}