using System.ComponentModel.DataAnnotations;

namespace Reclaim.Api.Models;

public record LostReport(
    int ReportId,
    int UserId,
    string ReporterName,
    string Name,
    string? Description,
    int? CategoryId,
    string? CategoryName,
    int? LastSeenLocationId,
    string? Building,
    DateOnly? DateLost,
    string? Status);

public record LostReportSearch(string? Search, int? UserId, string? Status);

public class LostReportRequest
{
    [Required]
    public int? UserId { get; init; }

    [Required, MaxLength(100)]
    public string Name { get; init; } = "";

    public string? Description { get; init; }

    public int? CategoryId { get; init; }

    public int? LastSeenLocationId { get; init; }

    public DateOnly? DateLost { get; init; }

    [AllowedValues("open", "matched", "closed", ErrorMessage = "Status must be open, matched, or closed.")]
    public string Status { get; init; } = "open";
}
