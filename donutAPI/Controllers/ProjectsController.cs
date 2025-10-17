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
    public class ProjectsController : ControllerBase
    {
        private readonly DonutDbContext _context;
        private readonly UserManager<User> _userManager;

        public ProjectsController(DonutDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/projects
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectDto>>> GetProjects()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Get projects where user is creator OR active collaborator
            var projects = await _context.Projects
                .Include(p => p.CreatedBy)
                .Include(p => p.Theme)
                .Include(p => p.Collaborators)
                    .ThenInclude(c => c.User)
                .Include(p => p.Collaborators)
                    .ThenInclude(c => c.AddedBy)
                .Include(p => p.Tracks)
                    .ThenInclude(t => t.UploadedBy)
                .Include(p => p.HitListItems)
                .Where(p => p.CreatedById == user.Id ||
                           p.Collaborators.Any(c => c.UserId == user.Id && c.Status == CollaboratorStatus.Active))
                .ToListAsync();

            return Ok(projects.Select(p => new ProjectDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                ArtworkUrl = p.ArtworkUrl,
                Status = p.Status,
                CreatedBy = p.CreatedBy.ToUserDto(),
                Theme = p.Theme != null ? MapThemeToDto(p.Theme) : null,
                Collaborators = p.Collaborators
                        .Where(c => c.Status == CollaboratorStatus.Active)
                        .Select(c => new CollaboratorDto
                        {
                            Id = c.Id,
                            User = c.User.ToUserDto(),
                            Role = c.Role,
                            Status = c.Status,
                            JoinedAt = c.JoinedAt,
                            AddedBy = c.AddedBy.ToUserDto()
                        }).ToList(),
                Tracks = p.Tracks.Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    FileUrl = t.FileUrl,
                    FileType = t.FileType,
                    Duration = t.Duration,
                    OrderIndex = t.OrderIndex,
                    Status = t.Status,
                    UploadedBy = t.UploadedBy.ToUserDto()
                }).ToList(),
                TrackCount = p.Tracks.Count,
                HitListItemCount = p.HitListItems.Count
            }));
        }

        // GET: api/projects/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectDto>> GetProject(int id)
        {
            var project = await _context.Projects
                .Include(p => p.CreatedBy)
                .Include(p => p.Theme)
                .Include(p => p.Tracks)
                    .ThenInclude(t => t.UploadedBy)
                .Include(p => p.HitListItems)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            var projectDto = new ProjectDto
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                ArtworkUrl = project.ArtworkUrl,
                Status = project.Status,
                CreatedBy = project.CreatedBy.ToUserDto(),
                Theme = project.Theme != null ? MapThemeToDto(project.Theme) : null,
                Tracks = project.Tracks.Select(t => new TrackDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    FileUrl = t.FileUrl,
                    FileType = t.FileType,
                    Duration = t.Duration,
                    OrderIndex = t.OrderIndex,
                    Status = t.Status,
                    UploadedBy = t.UploadedBy.ToUserDto()
                }).ToList(),
                TrackCount = project.Tracks.Count,
                HitListItemCount = project.HitListItems.Count
            };

            return Ok(projectDto);
        }

        // POST: api/projects
        [HttpPost]
        public async Task<ActionResult<ProjectDto>> CreateProject(CreateProjectDto createProjectDto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var project = new Project
            {
                Title = createProjectDto.Title,
                Description = createProjectDto.Description,
                CreatedById = user.Id,
                Status = ProjectStatus.Active
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            // Create theme if provided
            if (createProjectDto.Theme != null)
            {
                var theme = CreateThemeFromDto(createProjectDto.Theme);
                _context.ProjectThemes.Add(theme);
                await _context.SaveChangesAsync(); // Save theme first to get ID

                // Now assign the theme ID to the project
                project.ThemeId = theme.Id;
                await _context.SaveChangesAsync(); // Save project with theme ID
            }

            // Add creator as initial collaborator with their primary role
            var creatorRole = user.IsProducer ? CollaboratorRole.Producer : CollaboratorRole.Artist;
            var creatorCollaborator = new ProjectCollaborator
            {
                ProjectId = project.Id,
                UserId = user.Id,
                Role = creatorRole,
                Status = CollaboratorStatus.Active,
                AddedById = user.Id,
                JoinedAt = DateTime.UtcNow
            };
            _context.ProjectCollaborators.Add(creatorCollaborator);

            // Add initial collaborators if provided
            if (createProjectDto.Collaborators != null && createProjectDto.Collaborators.Any())
            {
                foreach (var collaboratorDto in createProjectDto.Collaborators)
                {
                    var collaboratorUser = await _userManager.FindByEmailAsync(collaboratorDto.Email);
                    if (collaboratorUser != null)
                    {
                        // Only add if not already the creator
                        if (collaboratorUser.Id != user.Id)
                        {
                            var collaborator = new ProjectCollaborator
                            {
                                ProjectId = project.Id,
                                UserId = collaboratorUser.Id,
                                Role = collaboratorDto.Role,
                                Status = CollaboratorStatus.Active,
                                AddedById = user.Id,
                                JoinedAt = DateTime.UtcNow
                            };
                            _context.ProjectCollaborators.Add(collaborator);
                        }
                    }
                    // Note: For demo purposes, we'll skip email invitations for now
                    // but could add ProjectInvitation records here for non-existing users
                }
            }

            await _context.SaveChangesAsync();

            // Return full project with collaborators
            return await GetProject(project.Id);
        }

        // PUT: api/projects/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, UpdateProjectDto updateProjectDto)
        {
            var project = await _context.Projects
                .Include(p => p.CreatedBy)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null || project.CreatedById != user.Id)
            {
                return Forbid("You can only update your own projects");
            }

            // Update only provided fields
            if (!string.IsNullOrEmpty(updateProjectDto.Title))
                project.Title = updateProjectDto.Title;

            if (updateProjectDto.Description != null)
                project.Description = updateProjectDto.Description;

            // Handle theme updates
            if (updateProjectDto.Theme != null)
            {
                if (project.Theme != null)
                {
                    // Update existing theme
                    if (updateProjectDto.Theme.Mode.HasValue)
                        project.Theme.Mode = updateProjectDto.Theme.Mode.Value;
                    if (updateProjectDto.Theme.Palette.HasValue)
                        project.Theme.Palette = updateProjectDto.Theme.Palette.Value;
                    if (updateProjectDto.Theme.PrimaryColor != null)
                        project.Theme.PrimaryColor = updateProjectDto.Theme.PrimaryColor;
                    if (updateProjectDto.Theme.SecondaryColor != null)
                        project.Theme.SecondaryColor = updateProjectDto.Theme.SecondaryColor;
                    if (updateProjectDto.Theme.AccentColor != null)
                        project.Theme.AccentColor = updateProjectDto.Theme.AccentColor;
                    if (updateProjectDto.Theme.BackgroundColor != null)
                        project.Theme.BackgroundColor = updateProjectDto.Theme.BackgroundColor;
                    if (updateProjectDto.Theme.TextColor != null)
                        project.Theme.TextColor = updateProjectDto.Theme.TextColor;
                    if (updateProjectDto.Theme.EmotionalTone != null)
                        project.Theme.EmotionalTone = updateProjectDto.Theme.EmotionalTone;
                    if (updateProjectDto.Theme.VisualDescription != null)
                        project.Theme.VisualDescription = updateProjectDto.Theme.VisualDescription;

                    project.Theme.UpdatedAt = DateTime.UtcNow;
                }
                else
                {
                    // Create new theme
                    var newTheme = new ProjectTheme
                    {
                        Mode = updateProjectDto.Theme.Mode ?? ThemeMode.Light,
                        Palette = updateProjectDto.Theme.Palette ?? ColorPalette.Coral,
                        PrimaryColor = updateProjectDto.Theme.PrimaryColor,
                        SecondaryColor = updateProjectDto.Theme.SecondaryColor,
                        AccentColor = updateProjectDto.Theme.AccentColor,
                        BackgroundColor = updateProjectDto.Theme.BackgroundColor,
                        TextColor = updateProjectDto.Theme.TextColor,
                        EmotionalTone = updateProjectDto.Theme.EmotionalTone,
                        VisualDescription = updateProjectDto.Theme.VisualDescription,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    _context.ProjectThemes.Add(newTheme);
                    project.Theme = newTheme;
                }
            }

            if (updateProjectDto.Status.HasValue)
                project.Status = updateProjectDto.Status.Value;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/projects/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null || project.CreatedById != user.Id)
            {
                return Forbid("You can only delete your own projects");
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/projects/my
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<ProjectDto>>> GetMyProjects()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            var projects = await _context.Projects
                .Include(p => p.CreatedBy)
                .Include(p => p.Theme)
                .Include(p => p.Tracks)
                    .ThenInclude(t => t.UploadedBy)
                .Include(p => p.HitListItems)
                .Where(p => p.CreatedById == user.Id)
                .Select(p => new ProjectDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    ArtworkUrl = p.ArtworkUrl,
                    Status = p.Status,
                    CreatedBy = p.CreatedBy.ToUserDto(),
                    Theme = p.Theme != null ? MapThemeToDto(p.Theme) : null,
                    Tracks = p.Tracks.Select(t => new TrackDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        FileUrl = t.FileUrl,
                        FileType = t.FileType,
                        Duration = t.Duration,
                        OrderIndex = t.OrderIndex,
                        Status = t.Status,
                        UploadedBy = t.UploadedBy.ToUserDto()
                    }).ToList(),
                    TrackCount = p.Tracks.Count,
                    HitListItemCount = p.HitListItems.Count
                })
                .ToListAsync();

            return Ok(projects);
        }

        // POST: api/projects/5/collaborators
        [HttpPost("{id}/collaborators")]
        public async Task<ActionResult<CollaboratorDto>> AddCollaborator(int id, CreateCollaboratorDto createCollaboratorDto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Check if user has permission to add collaborators (is creator or active collaborator)
            var hasPermission = await _context.Projects
                .AnyAsync(p => p.Id == id &&
                              (p.CreatedById == user.Id ||
                               p.Collaborators.Any(c => c.UserId == user.Id && c.Status == CollaboratorStatus.Active)));

            if (!hasPermission) return Forbid("You don't have permission to add collaborators to this project");

            // Find the user to add
            var collaboratorUser = await _userManager.FindByEmailAsync(createCollaboratorDto.Email);
            if (collaboratorUser == null)
            {
                return NotFound($"No user found with email: {createCollaboratorDto.Email}");
            }

            // Check if already a collaborator
            var existingCollaborator = await _context.ProjectCollaborators
                .FirstOrDefaultAsync(c => c.ProjectId == id && c.UserId == collaboratorUser.Id);

            if (existingCollaborator != null)
            {
                if (existingCollaborator.Status == CollaboratorStatus.Active)
                {
                    return BadRequest("User is already an active collaborator on this project");
                }

                // Reactivate if previously removed
                existingCollaborator.Status = CollaboratorStatus.Active;
                existingCollaborator.JoinedAt = DateTime.UtcNow;
                existingCollaborator.AddedById = user.Id;
                existingCollaborator.RemovedAt = null;
                existingCollaborator.RemovedById = null;
            }
            else
            {
                // Create new collaborator
                var newCollaborator = new ProjectCollaborator
                {
                    ProjectId = id,
                    UserId = collaboratorUser.Id,
                    Role = createCollaboratorDto.Role,
                    Status = CollaboratorStatus.Active,
                    AddedById = user.Id,
                    JoinedAt = DateTime.UtcNow
                };
                _context.ProjectCollaborators.Add(newCollaborator);
            }

            await _context.SaveChangesAsync();

            // Return the collaborator with full details
            var collaborator = await _context.ProjectCollaborators
                .Include(c => c.User)
                .Include(c => c.AddedBy)
                .FirstOrDefaultAsync(c => c.ProjectId == id && c.UserId == collaboratorUser.Id);

            var collaboratorDto = new CollaboratorDto
            {
                Id = collaborator!.Id,
                User = collaborator.User.ToUserDto(),
                Role = collaborator.Role,
                Status = collaborator.Status,
                JoinedAt = collaborator.JoinedAt,
                AddedBy = collaborator.AddedBy.ToUserDto()
            };

            return Ok(collaboratorDto);
        }

        // DELETE: api/projects/5/collaborators/10
        [HttpDelete("{id}/collaborators/{collaboratorId}")]
        public async Task<IActionResult> RemoveCollaborator(int id, int collaboratorId)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var collaborator = await _context.ProjectCollaborators
                .Include(c => c.Project)
                .FirstOrDefaultAsync(c => c.Id == collaboratorId && c.ProjectId == id);

            if (collaborator == null) return NotFound();

            // Check permissions (project creator, the collaborator themselves, or another active collaborator)
            var hasPermission = collaborator.Project.CreatedById == user.Id ||
                               collaborator.UserId == user.Id ||
                               await _context.ProjectCollaborators
                                   .AnyAsync(c => c.ProjectId == id && c.UserId == user.Id && c.Status == CollaboratorStatus.Active);

            if (!hasPermission) return Forbid("You don't have permission to remove this collaborator");

            // Don't allow removing the project creator
            if (collaborator.UserId == collaborator.Project.CreatedById)
            {
                return BadRequest("Cannot remove the project creator");
            }

            collaborator.Status = CollaboratorStatus.Removed;
            collaborator.RemovedAt = DateTime.UtcNow;
            collaborator.RemovedById = user.Id;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/projects/search-users?query=john
        [HttpGet("search-users")]
        public async Task<ActionResult<IEnumerable<UserDto>>> SearchUsers(string query)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                return BadRequest("Query must be at least 2 characters");
            }

            var users = await _context.Users
                .Where(u => u.DisplayName.Contains(query) ||
                           u.UserName!.Contains(query) ||
                           u.Email!.Contains(query))
                .Take(10) // Limit results for performance
                .Select(u => u.ToUserDto())
                .ToListAsync();

            return Ok(users);
        }

        // Helper method to map ProjectTheme to ProjectThemeDto
        public static ProjectThemeDto MapThemeToDto(ProjectTheme theme)
        {
            // Get colors from palette or use custom overrides
            var paletteColors = ColorPalettes.Palettes[theme.Palette][theme.Mode];

            return new ProjectThemeDto
            {
                Id = theme.Id,
                Mode = theme.Mode,
                Palette = theme.Palette,
                PrimaryColor = theme.PrimaryColor ?? paletteColors.Primary,
                SecondaryColor = theme.SecondaryColor ?? paletteColors.Secondary,
                AccentColor = theme.AccentColor ?? paletteColors.Accent,
                BackgroundColor = theme.BackgroundColor ?? paletteColors.Background,
                TextColor = theme.TextColor ?? paletteColors.Text,
                EmotionalTone = theme.EmotionalTone,
                VisualDescription = theme.VisualDescription,
                CreatedAt = theme.CreatedAt,
                UpdatedAt = theme.UpdatedAt
            };
        }

        // Helper method to create ProjectTheme from DTO
        private static ProjectTheme CreateThemeFromDto(CreateProjectThemeDto themeDto)
        {
            return new ProjectTheme
            {
                Mode = themeDto.Mode,
                Palette = themeDto.Palette,
                PrimaryColor = themeDto.PrimaryColor,
                SecondaryColor = themeDto.SecondaryColor,
                AccentColor = themeDto.AccentColor,
                BackgroundColor = themeDto.BackgroundColor,
                TextColor = themeDto.TextColor,
                EmotionalTone = themeDto.EmotionalTone,
                VisualDescription = themeDto.VisualDescription,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }
    }
}