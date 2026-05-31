using System.ComponentModel.DataAnnotations;

namespace CaffiendAdmin.Models;

public enum SubscriptionStatus
{
    Active,
    Paused
}

public class Subscription
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;

    /// <summary>Teslimat sıklığı (hafta bazında). Örn: 1 = haftada bir, 2 = iki haftada bir.</summary>
    public int FrequencyWeeks { get; set; } = 1;

    public DateTime NextDeliveryDate { get; set; }

    // Navigation
    public ICollection<SubscriptionItem> Items { get; set; } = new List<SubscriptionItem>();
}

public class SubscriptionItem
{
    public int Id { get; set; }

    public int SubscriptionId { get; set; }
    public Subscription Subscription { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; } = 1;
}