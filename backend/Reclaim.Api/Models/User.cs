namespace Reclaim.Api.Models;

// Public account details only; password_hash is never selected.
public record User(int UserId, string Name, string Email, string Role);
