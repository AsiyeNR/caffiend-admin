using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CaffiendAdmin.Models;

public class Product
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Column(TypeName = "decimal(10,2)")]
    public decimal PricePerUnit { get; set; }

    public int Stock { get; set; }

    // Navigation
    public ICollection<SubscriptionItem> SubscriptionItems { get; set; } = new List<SubscriptionItem>();
}