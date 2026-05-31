using CaffiendAdmin.Data;
using CaffiendAdmin.Models;
using CaffiendAdmin.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CaffiendAdmin.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ErrorLogsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ErrorAnalysisBackgroundService _analysisService;

    public ErrorLogsController(AppDbContext db, ErrorAnalysisBackgroundService analysisService)
    {
        _db = db;
        _analysisService = analysisService;
    }

    // GET api/errorlogs
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var logs = await _db.ErrorLogs
            .OrderByDescending(e => e.Timestamp)
            .Take(50)
            .ToListAsync();

        return Ok(logs);
    }

    // GET api/errorlogs/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var log = await _db.ErrorLogs.FindAsync(id);
        return log is null ? NotFound() : Ok(log);
    }

    // POST api/errorlogs
    // Yeni hata kaydeder, arka planda Gemini analizi başlatır.
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ErrorLog dto)
    {
        dto.Timestamp = DateTime.UtcNow;
        dto.AiAnalysis = null; // Analiz henüz yapılmadı

        _db.ErrorLogs.Add(dto);
        await _db.SaveChangesAsync();

        // Arka planda AI analizi — yanıtı bekletmez
        _ = Task.Run(() => _analysisService.RunAnalysisAsync(dto.Id));

        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    // DELETE api/errorlogs/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var log = await _db.ErrorLogs.FindAsync(id);
        if (log is null) return NotFound();

        _db.ErrorLogs.Remove(log);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}