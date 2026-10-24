namespace Reclaim.Api.Models;

public record Location(int LocationId, string Building, string? RoomOrArea, bool IsDropoffPoint);
