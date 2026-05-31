using CaffiendAdmin.Data;
using CaffiendAdmin.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ─── Veritabanı (AWS RDS PostgreSQL) ───────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ─── CORS ──────────────────────────────────────────────────────────────────
// React (Vite) http://localhost:5173 adresine izin ver
builder.Services.AddCors(options =>
{
    options.AddPolicy("CaffiendCorsPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")   // Vite dev sunucusu
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ─── Servisler ─────────────────────────────────────────────────────────────
builder.Services.AddHttpClient<IAIService, AIService>();
builder.Services.AddScoped<ErrorAnalysisBackgroundService>();

builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        // Enum'ları string olarak serialize et (Active/Paused, Frontend/Backend)
        opts.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ─── Middleware Pipeline ────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS middleware'i routing'den ÖNCE ekle
app.UseCors("CaffiendCorsPolicy");

app.UseAuthorization();
app.MapControllers();

// ─── Otomatik Migration (geliştirme ortamı için) ───────────────────────────
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();