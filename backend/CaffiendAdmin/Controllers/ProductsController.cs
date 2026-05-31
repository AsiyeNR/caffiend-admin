using CaffiendAdmin.Data;
using CaffiendAdmin.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CaffiendAdmin.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ProductsController(AppDbContext db) => _db = db;

    // GET api/products
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _db.Products.OrderBy(p => p.Category).ThenBy(p => p.Name).ToListAsync());

    // POST api/products
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Product product)
    {
        _db.Products.Add(product);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = product.Id }, product);
    }

    // PATCH api/products/{id}/stock
    [HttpPatch("{id:int}/stock")]
    public async Task<IActionResult> UpdateStock(int id, [FromBody] int delta)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        product.Stock = Math.Max(0, product.Stock + delta);
        await _db.SaveChangesAsync();
        return Ok(product);
    }

    // DELETE api/products/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product is null) return NotFound();

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}