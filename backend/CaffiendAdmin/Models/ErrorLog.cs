using System.ComponentModel.DataAnnotations;

namespace CaffiendAdmin.Models;

public enum ErrorSource
{
    Frontend,
    Backend
}

public class ErrorLog
{
    public int Id { get; set; }

    public ErrorSource Source { get; set; }

    [Required, MaxLength(500)]
    public string Message { get; set; } = string.Empty;

    public string? StackTrace { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>Gemini / OpenAI tarafından üretilen Türkçe analiz raporu.</summary>
    public string? AiAnalysis { get; set; }
}