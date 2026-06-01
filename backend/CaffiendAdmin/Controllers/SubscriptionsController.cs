using CaffiendAdmin.Data;
using CaffiendAdmin.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CaffiendAdmin.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SubscriptionsController : ControllerBase
{
    private readonly AppDbContext _db;
    public SubscriptionsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var subs = await _db.Subscriptions
            .Include(s => s.User)
            .Include(s => s.Items).ThenInclude(i => i.Product)
            .OrderByDescending(s => s.Id)
            .ToListAsync();
        return Ok(subs);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Subscription sub)
    {
        sub.NextDeliveryDate = DateTime.UtcNow.AddDays(sub.FrequencyWeeks * 7);
        _db.Subscriptions.Add(sub);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = sub.Id }, sub);
    }

    [HttpPost("{id:int}/pause")]
    public async Task<IActionResult> Pause(int id)
    {
        var sub = await _db.Subscriptions.FindAsync(id);
        if (sub is null) return NotFound();
        sub.Status = SubscriptionStatus.Paused;
        await _db.SaveChangesAsync();
        return Ok(sub);
    }

    [HttpPost("{id:int}/activate")]
    public async Task<IActionResult> Activate(int id)
    {
        var sub = await _db.Subscriptions.FindAsync(id);
        if (sub is null) return NotFound();
        sub.Status = SubscriptionStatus.Active;
        await _db.SaveChangesAsync();
        return Ok(sub);
    }

    [HttpPost("{id:int}/delay-one-week")]
    public async Task<IActionResult> DelayOneWeek(int id)
    {
        var sub = await _db.Subscriptions.FindAsync(id);
        if (sub is null) return NotFound();
        sub.NextDeliveryDate = sub.NextDeliveryDate.AddDays(7);
        await _db.SaveChangesAsync();
        return Ok(sub);
    }
}
