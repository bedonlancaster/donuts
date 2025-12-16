using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DonutAPI.Models;
using DonutAPI.DTOs;

namespace DonutAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<User> _userManager;

        public UsersController(UserManager<User> userManager)
        {
            _userManager = userManager;
        }

        // GET: api/users/search?q=searchQuery
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<UserSearchResultDTO>>> SearchUsers([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest("Search query cannot be empty");

            // Minimum 2 characters for search
            if (q.Length < 2)
                return Ok(new List<UserSearchResultDTO>());

            var searchTerm = q.ToLower();

            // Search by username, first name, or last name
            var users = await _userManager.Users
                .Where(u =>
                    u.UserName!.ToLower().Contains(searchTerm) ||
                    u.FirstName.ToLower().Contains(searchTerm) ||
                    u.LastName.ToLower().Contains(searchTerm) ||
                    (u.FirstName + " " + u.LastName).ToLower().Contains(searchTerm))
                .Take(10) // Limit results to 10
                .ToListAsync();

            var results = users.Select(u => new UserSearchResultDTO
            {
                Id = u.Id,
                UserName = u.UserName ?? "",
                FirstName = u.FirstName,
                LastName = u.LastName,
                FullName = u.FullName,
                ProfileImageUrl = u.ProfileImageUrl
            });

            return Ok(results);
        }

        // GET: api/users/me
        [HttpGet("me")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            return Ok(new UserDto
            {
                Id = user.Id,
                Username = user.UserName ?? "",
                Email = user.Email ?? "",
                FirstName = user.FirstName,
                LastName = user.LastName,
                ProfileImageUrl = user.ProfileImageUrl,
                Bio = user.Bio
            });
        }
    }
}
