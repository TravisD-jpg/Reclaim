using System.ComponentModel.DataAnnotations;

namespace Reclaim.Api.Models;

public record Item(
    int ItemId,
    string Name,
    string? Description,
    int? CategoryId,
    string? CategoryName,
    int? FoundLocationId,
    string? Building,
    int HeldAtLocationId,
    string HeldAtBuilding,
    string? HeldAtRoom,
    DateOnly DateFound,
    string? Status,
    string? PhotoUrl);

public record ItemSearch(string? Search, int? CategoryId, int? LocationId, string? Status);

public class ItemRequest
{
    [Required, MaxLength(100)]
    public string Name { get; init; } = "";

    public string? Description { get; init; }

    public int? CategoryId { get; init; }

    public int? FoundLocationId { get; init; }

    [Required]
    public int? HeldAtLocationId { get; init; }

    [Required]
    public DateOnly? DateFound { get; init; }

    [AllowedValues("stored", "claimed", "disposed", ErrorMessage = "Status must be stored, claimed, or disposed.")]
    public string Status { get; init; } = "stored";

    [MaxLength(255)]
    public string? PhotoUrl { get; init; }
}
