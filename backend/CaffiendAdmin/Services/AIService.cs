using System.Text;
using System.Text.Json;
using CaffiendAdmin.Data;
using CaffiendAdmin.Models;

namespace CaffiendAdmin.Services;

public interface IAIService
{
    Task<string> AnalyzeErrorAsync(string message, string? stackTrace);
}

public class AIService : IAIService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<AIService> _logger;

    public AIService(HttpClient http, IConfiguration config, ILogger<AIService> logger)
    {
        _http = http;
        _config = config;
        _logger = logger;
    }

    /// <summary>
    /// Hata mesajını ve stack trace'i Gemini API'sine gönderir,
    /// Türkçe senior mühendis diliyle analiz raporu döner.
    /// </summary>
    public async Task<string> AnalyzeErrorAsync(string message, string? stackTrace)
    {
        var apiKey = _config["Gemini:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.LogWarning("Gemini API anahtarı bulunamadı. Analiz atlandı.");
            return "AI analizi için Gemini API anahtarı yapılandırılmamış.";
        }

        var prompt = $"""
            Sen kıdemli bir .NET ve React yazılım mühendisisin.
            Aşağıdaki hata mesajını ve stack trace'i analiz et.
            Türkçe yaz. Teknik ve net ol. Şu başlıkları kullan:
            
            🔍 Hatanın Kökü: (tek cümle)
            🛠️ Olası Sebepler: (madde madde)
            ✅ Çözüm Önerisi: (adım adım)
            ⚠️ Önleyici Tedbir: (gelecekte nasıl engellenir)
            
            --- HATA MESAJI ---
            {message}
            
            --- STACK TRACE ---
            {stackTrace ?? "Stack trace mevcut değil."}
            """;

        var requestBody = new
        {
            contents = new[]
            {
                new { parts = new[] { new { text = prompt } } }
            }
        };

        var url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";
        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await _http.PostAsync(url, content);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);

            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return text ?? "AI analizi boş döndü.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gemini API isteği başarısız oldu.");
            return $"AI analizi sırasında hata oluştu: {ex.Message}";
        }
    }
}

/// <summary>
/// Yeni bir ErrorLog kaydedildiğinde arka planda AI analizini çalıştıran servis.
/// </summary>
public class ErrorAnalysisBackgroundService
{
    private readonly IAIService _aiService;
    private readonly AppDbContext _db;
    private readonly ILogger<ErrorAnalysisBackgroundService> _logger;

    public ErrorAnalysisBackgroundService(
        IAIService aiService,
        AppDbContext db,
        ILogger<ErrorAnalysisBackgroundService> logger)
    {
        _aiService = aiService;
        _db = db;
        _logger = logger;
    }

    public async Task RunAnalysisAsync(int errorLogId)
    {
        var log = await _db.ErrorLogs.FindAsync(errorLogId);
        if (log is null) return;

        _logger.LogInformation("ErrorLog #{Id} için AI analizi başlatılıyor...", errorLogId);

        log.AiAnalysis = await _aiService.AnalyzeErrorAsync(log.Message, log.StackTrace);
        await _db.SaveChangesAsync();

        _logger.LogInformation("ErrorLog #{Id} için AI analizi tamamlandı.", errorLogId);
    }
}