using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpizarniaAPI.Data;
using SpizarniaAPI.Models;

namespace SpizarniaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(AuthDto request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Użytkownik o takim emailu już istnieje.");

            var user = new User
            {
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow 
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Rejestracja zakończona sukcesem!" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(AuthDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null) return BadRequest("Nieprawidłowy email lub hasło.");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return BadRequest("Nieprawidłowy email lub hasło.");

            return Ok(new
            {
                userId = user.Id,
                email = user.Email,
                avatarSeed = user.AvatarSeed
            });
        }

        [HttpPut("avatar")]
        public async Task<IActionResult> UpdateAvatar([FromBody] UpdateAvatarDto dto)
        {
            if (!Request.Headers.TryGetValue("X-User-Id", out var userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized("Brak autoryzacji.");

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("Nie znaleziono użytkownika.");

            user.AvatarSeed = dto.AvatarSeed;
            await _context.SaveChangesAsync();

            return Ok(new { avatarSeed = user.AvatarSeed });
        }
    }

    public class AuthDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class UpdateAvatarDto
    {
        public string AvatarSeed { get; set; } = string.Empty;
    }
}