namespace Reclaim.Api.Models;

// One row per item: where and when it was found, who logged it, and its claim if it has one.
public record ItemHistory(
    int ItemId,
    string Name,
    string? Description,
    string? Status,
    DateOnly DateFound,
    string? CategoryName,
    string? Building,
    string? RoomOrArea,
    string? LoggedByName,
    int? ClaimId,
    DateTime? ClaimDate,
    string? ClaimantName,
    string? ClaimantEmail,
    string? ApprovedByName,
    int? ReportId,
    string? ReportName,
    DateOnly? DateLost,
    long FailedAttempts);
