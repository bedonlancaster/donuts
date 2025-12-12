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
    public class InvitationsController : ControllerBase
    {
        private readonly DonutDbContext _context;
        private readonly UserManager<User> _userManager;

        public InvitationsController(DonutDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // POST: api/invitations/send
        [HttpPost("send")]
        public async Task<ActionResult<InvitationDTO>> SendInvitation([FromBody] SendInvitationDTO dto)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null) return Unauthorized();

            // Validate project exists and user has permission to invite
            var project = await _context.Projects
                .Include(p => p.Collaborators)
                .FirstOrDefaultAsync(p => p.Id == dto.ProjectId);

            if (project == null)
                return NotFound("Project not found");

            // Check if current user is creator or active collaborator
            var isCreator = project.CreatedById == currentUser.Id;
            var isCollaborator = project.Collaborators.Any(c =>
                c.UserId == currentUser.Id && c.Status == CollaboratorStatus.Active);

            if (!isCreator && !isCollaborator)
                return Forbid();

            // Check if invited user exists
            var invitedUser = await _userManager.FindByIdAsync(dto.InvitedUserId.ToString());
            if (invitedUser == null)
                return NotFound("User not found");

            // Don't allow inviting yourself
            if (invitedUser.Id == currentUser.Id)
                return BadRequest("You cannot invite yourself");

            // Check if user is already a collaborator
            var existingCollaborator = await _context.ProjectCollaborators
                .FirstOrDefaultAsync(pc => pc.ProjectId == dto.ProjectId && pc.UserId == dto.InvitedUserId);

            if (existingCollaborator != null)
                return BadRequest("User is already a collaborator on this project");

            // Check if there's already a pending invitation
            var existingInvitation = await _context.ProjectInvitations
                .FirstOrDefaultAsync(pi =>
                    pi.ProjectId == dto.ProjectId &&
                    pi.InvitedUserId == dto.InvitedUserId &&
                    pi.Status == InvitationStatus.Pending);

            if (existingInvitation != null)
                return BadRequest("This user already has a pending invitation for this project");

            // Create the invitation
            var invitation = new ProjectInvitation
            {
                ProjectId = dto.ProjectId,
                InvitedUserId = dto.InvitedUserId,
                InvitedById = currentUser.Id,
                Message = dto.Message,
                Status = InvitationStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.ProjectInvitations.Add(invitation);
            await _context.SaveChangesAsync();

            // Load related data for response
            await _context.Entry(invitation)
                .Reference(i => i.Project)
                .LoadAsync();
            await _context.Entry(invitation)
                .Reference(i => i.InvitedBy)
                .LoadAsync();

            return Ok(new InvitationDTO
            {
                Id = invitation.Id,
                ProjectId = invitation.ProjectId,
                ProjectTitle = invitation.Project.Title,
                ProjectArtworkUrl = invitation.Project.ArtworkUrl,
                InvitedById = invitation.InvitedById,
                InvitedByUserName = invitation.InvitedBy.UserName ?? "",
                InvitedByFullName = invitation.InvitedBy.FullName,
                InvitedByProfileImageUrl = invitation.InvitedBy.ProfileImageUrl,
                Message = invitation.Message,
                Status = invitation.Status,
                CreatedAt = invitation.CreatedAt,
                RespondedAt = invitation.RespondedAt
            });
        }

        // GET: api/invitations/received
        [HttpGet("received")]
        public async Task<ActionResult<IEnumerable<InvitationDTO>>> GetReceivedInvitations()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null) return Unauthorized();

            var invitations = await _context.ProjectInvitations
                .Include(i => i.Project)
                .Include(i => i.InvitedBy)
                .Where(i => i.InvitedUserId == currentUser.Id)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return Ok(invitations.Select(i => new InvitationDTO
            {
                Id = i.Id,
                ProjectId = i.ProjectId,
                ProjectTitle = i.Project.Title,
                ProjectArtworkUrl = i.Project.ArtworkUrl,
                InvitedById = i.InvitedById,
                InvitedByUserName = i.InvitedBy.UserName ?? "",
                InvitedByFullName = i.InvitedBy.FullName,
                InvitedByProfileImageUrl = i.InvitedBy.ProfileImageUrl,
                Message = i.Message,
                Status = i.Status,
                CreatedAt = i.CreatedAt,
                RespondedAt = i.RespondedAt
            }));
        }

        // GET: api/invitations/received/pending
        [HttpGet("received/pending")]
        public async Task<ActionResult<IEnumerable<InvitationDTO>>> GetPendingReceivedInvitations()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null) return Unauthorized();

            var invitations = await _context.ProjectInvitations
                .Include(i => i.Project)
                .Include(i => i.InvitedBy)
                .Where(i => i.InvitedUserId == currentUser.Id && i.Status == InvitationStatus.Pending)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return Ok(invitations.Select(i => new InvitationDTO
            {
                Id = i.Id,
                ProjectId = i.ProjectId,
                ProjectTitle = i.Project.Title,
                ProjectArtworkUrl = i.Project.ArtworkUrl,
                InvitedById = i.InvitedById,
                InvitedByUserName = i.InvitedBy.UserName ?? "",
                InvitedByFullName = i.InvitedBy.FullName,
                InvitedByProfileImageUrl = i.InvitedBy.ProfileImageUrl,
                Message = i.Message,
                Status = i.Status,
                CreatedAt = i.CreatedAt,
                RespondedAt = i.RespondedAt
            }));
        }

        // GET: api/invitations/sent/{projectId}
        [HttpGet("sent/{projectId}")]
        public async Task<ActionResult<IEnumerable<SentInvitationDTO>>> GetSentInvitations(int projectId)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null) return Unauthorized();

            // Verify user has access to this project
            var project = await _context.Projects
                .Include(p => p.Collaborators)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null)
                return NotFound();

            var isCreator = project.CreatedById == currentUser.Id;
            var isCollaborator = project.Collaborators.Any(c =>
                c.UserId == currentUser.Id && c.Status == CollaboratorStatus.Active);

            if (!isCreator && !isCollaborator)
                return Forbid();

            var invitations = await _context.ProjectInvitations
                .Include(i => i.InvitedUser)
                .Where(i => i.ProjectId == projectId)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();

            return Ok(invitations.Select(i => new SentInvitationDTO
            {
                Id = i.Id,
                InvitedUserId = i.InvitedUserId,
                InvitedUserName = i.InvitedUser.UserName ?? "",
                InvitedUserFullName = i.InvitedUser.FullName,
                InvitedUserProfileImageUrl = i.InvitedUser.ProfileImageUrl,
                Message = i.Message,
                Status = i.Status,
                CreatedAt = i.CreatedAt,
                RespondedAt = i.RespondedAt
            }));
        }

        // POST: api/invitations/{id}/respond
        [HttpPost("{id}/respond")]
        public async Task<ActionResult> RespondToInvitation(int id, [FromBody] RespondToInvitationDTO dto)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null) return Unauthorized();

            var invitation = await _context.ProjectInvitations
                .Include(i => i.Project)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invitation == null)
                return NotFound("Invitation not found");

            // Verify this invitation is for the current user
            if (invitation.InvitedUserId != currentUser.Id)
                return Forbid();

            // Check if invitation is still pending
            if (invitation.Status != InvitationStatus.Pending)
                return BadRequest("This invitation has already been responded to");

            // Update invitation status
            invitation.Status = dto.Accept ? InvitationStatus.Accepted : InvitationStatus.Declined;
            invitation.RespondedAt = DateTime.UtcNow;

            // If accepted, add user as collaborator
            if (dto.Accept)
            {
                // Check if user is already a collaborator (shouldn't happen, but safety check)
                var existingCollaborator = await _context.ProjectCollaborators
                    .FirstOrDefaultAsync(pc => pc.ProjectId == invitation.ProjectId && pc.UserId == currentUser.Id);

                if (existingCollaborator == null)
                {
                    var collaborator = new ProjectCollaborator
                    {
                        ProjectId = invitation.ProjectId,
                        UserId = currentUser.Id,
                        Role = CollaboratorRole.Artist, // Default role, user can change it later
                        Status = CollaboratorStatus.Active,
                        JoinedAt = DateTime.UtcNow,
                        AddedById = invitation.InvitedById
                    };

                    _context.ProjectCollaborators.Add(collaborator);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = dto.Accept ? "Invitation accepted" : "Invitation declined",
                status = invitation.Status
            });
        }

        // DELETE: api/invitations/{id}/cancel
        [HttpDelete("{id}/cancel")]
        public async Task<ActionResult> CancelInvitation(int id)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null) return Unauthorized();

            var invitation = await _context.ProjectInvitations
                .Include(i => i.Project)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (invitation == null)
                return NotFound("Invitation not found");

            // Verify user has permission to cancel (must be the one who sent it or project creator)
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == invitation.ProjectId);

            if (invitation.InvitedById != currentUser.Id && project?.CreatedById != currentUser.Id)
                return Forbid();

            // Can only cancel pending invitations
            if (invitation.Status != InvitationStatus.Pending)
                return BadRequest("Only pending invitations can be cancelled");

            invitation.Status = InvitationStatus.Cancelled;
            invitation.RespondedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Invitation cancelled" });
        }

        // GET: api/invitations/count/pending
        [HttpGet("count/pending")]
        public async Task<ActionResult<int>> GetPendingInvitationCount()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null) return Unauthorized();

            var count = await _context.ProjectInvitations
                .CountAsync(i => i.InvitedUserId == currentUser.Id && i.Status == InvitationStatus.Pending);

            return Ok(new { count });
        }
    }
}
