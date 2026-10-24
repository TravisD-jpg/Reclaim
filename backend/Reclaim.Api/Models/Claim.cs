using System.ComponentModel.DataAnnotations;

namespace Reclaim.Api.Models;

public record Claim(
    int ClaimId,
    int ItemId,
    string ItemName,
    int UserId,
    string ClaimantName,
    int? ReportId,
    string? ReportName,
    int ApprovedBy,
    string ApprovedByName,
    DateTime ClaimDate);

public record ClaimSearch(int? ItemId, int? UserId, int? ApprovedBy);

// Fields staff can change on an existing claim. The item can't change; delete and re-create instead.
public class ClaimChanges
{
    [Required]
    public int? UserId { get; init; }

    public int? ReportId { get; init; }

    [Required]
    public int? ApprovedBy { get; init; }

    // Defaults to now when omitted.
    public DateTime? ClaimDate { get; init; }
}

public class ClaimRequest : ClaimChanges
{
    [Required]
    public int? ItemId { get; init; }
}
