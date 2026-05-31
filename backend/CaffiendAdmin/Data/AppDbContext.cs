using CaffiendAdmin.Models;
using Microsoft.EntityFrameworkCore;

namespace CaffiendAdmin.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<SubscriptionItem> SubscriptionItems => Set<SubscriptionItem>();
    public DbSet<ErrorLog> ErrorLogs => Set<ErrorLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User → Subscriptions (One-to-Many)
        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.User)
            .WithMany(u => u.Subscriptions)
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Subscription → SubscriptionItems (One-to-Many)
        modelBuilder.Entity<SubscriptionItem>()
            .HasOne(si => si.Subscription)
            .WithMany(s => s.Items)
            .HasForeignKey(si => si.SubscriptionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Product → SubscriptionItems (One-to-Many)
        modelBuilder.Entity<SubscriptionItem>()
            .HasOne(si => si.Product)
            .WithMany(p => p.SubscriptionItems)
            .HasForeignKey(si => si.ProductId)
            .OnDelete(DeleteBehavior.Restrict);

        // SubscriptionStatus enum → string olarak sakla
        modelBuilder.Entity<Subscription>()
            .Property(s => s.Status)
            .HasConversion<string>();

        // ErrorSource enum → string olarak sakla
        modelBuilder.Entity<ErrorLog>()
            .Property(e => e.Source)
            .HasConversion<string>();
    }
}