using CaffiendAdmin.Services;
using Microsoft.AspNetCore.Mvc;
namespace CaffiendAdmin.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    public AuthController(IAuthService auth) => _auth = auth;

    public record LoginRequest(string Username, string Password);

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var token = await _auth.LoginAsync(req.Username, req.Password);
        if (token is null)
            return Unauthorized(new { message = "Kullanici adi veya sifre hatali." });
        return Ok(new { token });
    }
}
