using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CaffiendAdmin.Data;
using CaffiendAdmin.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CaffiendAdmin.Services;

public interface IAuthService
{
    Task<string?> LoginAsync(string username, string password);
    Task<AdminUser> EnsureDefaultAdminAsync();
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<string?> LoginAsync(string username, string password)
    {
        var admin = await _db.AdminUsers
            .FirstOrDefaultAsync(a => a.Username == username);

        if (admin is null) return null;

        if (!VerifyPassword(password, admin.PasswordHash)) return null;

        return GenerateToken(admin);
    }

    public async Task<AdminUser> EnsureDefaultAdminAsync()
    {
        var existing = await _db.AdminUsers.FirstOrDefaultAsync();
        if (existing is not null) return existing;

        // Varsayılan admin: caffiend / Admin1234!
        var admin = new AdminUser
        {
            Username = "caffiend",
            PasswordHash = HashPassword("Admin1234!")
        };

        _db.AdminUsers.Add(admin);
        await _db.SaveChangesAsync();
        return admin;
    }

    private string GenerateToken(AdminUser admin)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, admin.Username),
            new Claim(ClaimTypes.NameIdentifier, admin.Id.ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: "CaffiendAdmin",
            audience: "CaffiendAdmin",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password), salt, 100_000,
            HashAlgorithmName.SHA256, 32);

        return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
    }

    private static bool VerifyPassword(string password, string storedHash)
    {
        try
        {
            var parts = storedHash.Split(':');
            var salt = Convert.FromBase64String(parts[0]);
            var expectedHash = Convert.FromBase64String(parts[1]);

            var actualHash = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(password), salt, 100_000,
                HashAlgorithmName.SHA256, 32);

            return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
        }
        catch { return false; }
    }
}